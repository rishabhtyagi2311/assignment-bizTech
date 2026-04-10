import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { EventType } from '../types/index';

const TIMEOUT_THRESHOLD_MS = 15 * 60 * 1000; 

export const startHeartbeatMonitor = () => {
  
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Heartbeat] Checking for Zombie Sessions...');
    
    const now = new Date();

    const openSessions = await prisma.workstationSession.findMany({
      where: { endTime: null },
      include: { workstation: true }
    });

    for (const session of openSessions) {
      const lastEvent = await prisma.aIEvent.findFirst({
        where: { workstationId: session.workstationId },
        orderBy: { timestamp: 'desc' },
      });

      if (lastEvent) {
        const timeSinceLastEvent = now.getTime() - lastEvent.timestamp.getTime();

        if (timeSinceLastEvent > TIMEOUT_THRESHOLD_MS) {
          await handleSystemTimeout(session, lastEvent.timestamp, now);
        }
      }
    }
  });
};

async function handleSystemTimeout(session: any, lastEventTime: Date, currentTime: Date) {
  await prisma.$transaction(async (tx) => {
    const duration = Math.floor((lastEventTime.getTime() - session.startTime.getTime()) / 1000);

    // Close the "Zombie" session at the exact time the camera last spoke
    await tx.workstationSession.update({
      where: { id: session.id },
      data: { 
        endTime: lastEventTime, 
        durationSec: duration > 0 ? duration : 0 
      },
    });

    // Start the Malfunction bridge from the last event until NOW
    await tx.workstationSession.create({
      data: {
        workerId: session.workerId,
        workstationId: session.workstationId,
        state: EventType.CAMERA_MALFUNCTION,
        startTime: lastEventTime,
      },
    });
    
    console.log(`[Heartbeat] Station ${session.workstationId} marked as MALFUNCTION.`);
  });
}