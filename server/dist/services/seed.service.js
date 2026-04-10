"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const prisma_1 = require("../lib/prisma");
const management_service_1 = require("./management.service");
const event_service_1 = require("./event.service");
const index_1 = require("../types/index");
exports.SeedService = {
    async clearDatabase() {
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.workstationDailyStats.deleteMany(),
            prisma_1.prisma.workstationSession.deleteMany(),
            prisma_1.prisma.aIEvent.deleteMany(),
            prisma_1.prisma.worker.deleteMany(),
            prisma_1.prisma.workstation.deleteMany(),
        ]);
    },
    async seedDefaultData() {
        await this.clearDatabase();
        console.log("🧹 DB Cleared. Starting Large Scale Seed...");
        // 1. Setup Identities
        const workerIds = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
        const stationIds = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
        for (let i = 0; i < 6; i++) {
            await (0, management_service_1.createWorker)(workerIds[i], `Worker ${workerIds[i]}`);
            await (0, management_service_1.createWorkstation)(stationIds[i], `Station ${stationIds[i]}`);
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
                let eventType;
                if (rand > 0.8) {
                    eventType = index_1.EventType.IDLE;
                }
                else if (rand > 0.1) {
                    eventType = index_1.EventType.WORKING;
                }
                else {
                    // Occasional malfunction to test our "Fairness" logic
                    eventType = index_1.EventType.CAMERA_MALFUNCTION;
                }
                // Send the state change event
                await (0, event_service_1.processAIEvent)({
                    worker_id: workerId,
                    workstation_id: stationId,
                    event_type: eventType,
                    timestamp: currentEventTime.toISOString(),
                    confidence: 0.9 + Math.random() * 0.1
                });
                // If they are working, also simulate some product counts
                if (eventType === index_1.EventType.WORKING) {
                    await (0, event_service_1.processAIEvent)({
                        worker_id: workerId,
                        workstation_id: stationId,
                        event_type: index_1.EventType.PRODUCT_COUNT,
                        timestamp: new Date(currentEventTime.getTime() + 5000).toISOString(),
                        count: Math.floor(Math.random() * 5) + 1,
                        confidence: 0.95
                    });
                }
            }
        }
        console.log("✅ Large Scale Seeding Complete. ~150+ events processed.");
    },
    async seedCustomData(payload) {
        await this.clearDatabase();
        for (const w of payload.workers) {
            await (0, management_service_1.createWorker)(w.worker_id, w.name);
        }
        for (const s of payload.workstations) {
            await (0, management_service_1.createWorkstation)(s.station_id, s.name);
        }
        const sortedEvents = payload.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        for (const event of sortedEvents) {
            await (0, event_service_1.processAIEvent)({
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
