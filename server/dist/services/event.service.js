"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAIEvent = void 0;
const prisma_1 = require("../lib/prisma");
const index_1 = require("../types/index");
const processAIEvent = async (data) => {
    return await prisma_1.prisma.$transaction(async (tx) => {
        const worker = await tx.worker.findUnique({ where: { worker_id: data.worker_id } });
        const station = await tx.workstation.findUnique({ where: { station_id: data.workstation_id } });
        if (!worker || !station)
            throw new Error("Worker or Workstation not found");
        const eventTime = new Date(data.timestamp);
        const today = new Date(data.timestamp);
        today.setUTCHours(0, 0, 0, 0);
        // 1. Log Raw Event
        await tx.aIEvent.create({
            data: {
                workerId: worker.id,
                workstationId: station.id,
                event_type: data.event_type,
                confidence: data.confidence,
                count: data.count || 0,
                timestamp: eventTime,
            },
        });
        // 2. Handle Product Count
        if (data.event_type === index_1.EventType.PRODUCT_COUNT) {
            await tx.workstationDailyStats.upsert({
                where: { workstationId_date: { workstationId: station.id, date: today } },
                update: { total_products: { increment: data.count || 0 } },
                create: { workstationId: station.id, date: today, total_products: data.count || 0 },
            });
            return { status: "success", detail: "Product count updated." };
        }
        // 3. Check for Open Sessions (Regular or Malfunction)
        const currentSession = await tx.workstationSession.findFirst({
            where: { workstationId: station.id, endTime: null },
            orderBy: { startTime: 'desc' },
        });
        // If the camera was in MALFUNCTION and now we have an event, 
        // OR if the state changed (e.g., WORKING -> IDLE)
        if (currentSession && currentSession.state !== data.event_type) {
            const duration = Math.floor((eventTime.getTime() - currentSession.startTime.getTime()) / 1000);
            const safeDuration = duration > 0 ? duration : 0;
            await tx.workstationSession.update({
                where: { id: currentSession.id },
                data: { endTime: eventTime, durationSec: safeDuration },
            });
            // This correctly updates the Hot Table for the session that just ended
            await updateDailyDuration(tx, station.id, today, currentSession.state, safeDuration);
        }
        // 4. Create New Session (If state is different or no session exists)
        if (!currentSession || currentSession.state !== data.event_type) {
            await tx.workstationSession.create({
                data: {
                    workerId: worker.id,
                    workstationId: station.id,
                    state: data.event_type,
                    startTime: eventTime,
                },
            });
        }
        return { status: "success", detail: `Station ${data.workstation_id} is now ${data.event_type}` };
    });
};
exports.processAIEvent = processAIEvent;
async function updateDailyDuration(tx, stationId, date, state, seconds) {
    const updateData = {};
    if (state === index_1.EventType.WORKING)
        updateData.working_sec = { increment: seconds };
    if (state === index_1.EventType.IDLE)
        updateData.idle_sec = { increment: seconds };
    if (state === index_1.EventType.CAMERA_MALFUNCTION)
        updateData.malfunction_sec = { increment: seconds };
    if (Object.keys(updateData).length > 0) {
        await tx.workstationDailyStats.upsert({
            where: { workstationId_date: { workstationId: stationId, date } },
            update: updateData,
            create: {
                workstationId: stationId,
                date,
                working_sec: state === index_1.EventType.WORKING ? seconds : 0,
                idle_sec: state === index_1.EventType.IDLE ? seconds : 0,
                malfunction_sec: state === index_1.EventType.CAMERA_MALFUNCTION ? seconds : 0,
            },
        });
    }
}
