"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHeartbeatMonitor = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../lib/prisma");
const index_1 = require("../types/index");
const TIMEOUT_THRESHOLD_MS = 15 * 60 * 1000; // 5 Minutes
const startHeartbeatMonitor = () => {
    node_cron_1.default.schedule('* * * * *', async () => {
        console.log('[Heartbeat] Checking for Zombie Sessions...');
        const now = new Date();
        // 1. Find all workstations that have an OPEN session
        const openSessions = await prisma_1.prisma.workstationSession.findMany({
            where: { endTime: null },
            include: { workstation: true }
        });
        for (const session of openSessions) {
            // 2. Find the last raw event received for this specific workstation
            const lastEvent = await prisma_1.prisma.aIEvent.findFirst({
                where: { workstationId: session.workstationId },
                orderBy: { timestamp: 'desc' },
            });
            if (lastEvent) {
                const timeSinceLastEvent = now.getTime() - lastEvent.timestamp.getTime();
                // 3. If timeout exceeded, kill the session and start malfunction
                if (timeSinceLastEvent > TIMEOUT_THRESHOLD_MS) {
                    await handleSystemTimeout(session, lastEvent.timestamp, now);
                }
            }
        }
    });
};
exports.startHeartbeatMonitor = startHeartbeatMonitor;
async function handleSystemTimeout(session, lastEventTime, currentTime) {
    await prisma_1.prisma.$transaction(async (tx) => {
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
                state: index_1.EventType.CAMERA_MALFUNCTION,
                startTime: lastEventTime,
            },
        });
        console.log(`[Heartbeat] Station ${session.workstationId} marked as MALFUNCTION.`);
    });
}
