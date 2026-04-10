import { prisma } from '../lib/prisma';
import { createWorker, createWorkstation } from './management.service';
import { processAIEvent } from './event.service';
import { CustomSeedPayload,EventType } from '../types/index';

export const SeedService = {
  async clearDatabase() {
    await prisma.$transaction([
      prisma.workstationDailyStats.deleteMany(),
      prisma.workstationSession.deleteMany(),
      prisma.aIEvent.deleteMany(),
      prisma.worker.deleteMany(),
      prisma.workstation.deleteMany(),
    ]);
  },

  async seedDefaultData() {
    
    console.log("🧹 DB Cleared. Starting Large Scale Seed...");

    // 1. Setup Identities
    const workerIds = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
    const stationIds = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

    for (let i = 0; i < 6; i++) {
      await createWorker(workerIds[i], `Worker ${workerIds[i]}`);
      await createWorkstation(stationIds[i], `Station ${stationIds[i]}`);
    }

    // 2. Simulate 4 hours of activity (from 4 hours ago until now)
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 4);

    // We'll move forward in 10-minute increments to simulate events
    for (let step = 0; step < 24; step++) {
      const currentEventTime = new Date(startTime.getTime() + step * 10 * 60000);

      for (let i = 0; i < 6; i++) {
        const workerId = workerIds[i];
        const stationId = stationIds[i];

        // Randomly decide what this worker is doing in this 10-min block
        const rand = Math.random();
        let eventType: EventType;

        if (rand > 0.8) {
          eventType = EventType.IDLE;
        } else if (rand > 0.1) {
          eventType = EventType.WORKING;
        } else {
          // Occasional malfunction to test our "Fairness" logic
          eventType = EventType.CAMERA_MALFUNCTION;
        }

        // Send the state change event
        await processAIEvent({
          worker_id: workerId,
          workstation_id: stationId,
          event_type: eventType,
          timestamp: currentEventTime.toISOString(),
          confidence: 0.9 + Math.random() * 0.1
        });

        // If they are working, also simulate some product counts
        if (eventType === EventType.WORKING) {
          await processAIEvent({
            worker_id: workerId,
            workstation_id: stationId,
            event_type: EventType.PRODUCT_COUNT,
            timestamp: new Date(currentEventTime.getTime() + 5000).toISOString(),
            count: Math.floor(Math.random() * 5) + 1,
            confidence: 0.95
          });
        }
      }
    }

    console.log("✅ Large Scale Seeding Complete. ~150+ events processed.");
  },

  async seedCustomData(payload: CustomSeedPayload) {
    await this.clearDatabase();

   
    for (const w of payload.workers) {
      await createWorker(w.worker_id, w.name);
    }

    for (const s of payload.workstations) {
      await createWorkstation(s.station_id, s.name);
    }

    const sortedEvents = payload.events.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const event of sortedEvents) {

      await processAIEvent({
          worker_id: event.worker_id,
          workstation_id: event.workstation_id,
          event_type: event.event_type,
          timestamp: event.timestamp,
          confidence: event.confidence || 0.9,
          count: event.count || 0
      });
    }
    console.log("✅ Custom Seeding Complete");
  }
};