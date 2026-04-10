"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkstation = exports.createWorker = void 0;
const prisma_1 = require("../lib/prisma");
const createWorker = async (worker_id, name) => {
    return await prisma_1.prisma.worker.upsert({
        where: { worker_id },
        update: { name },
        create: { worker_id, name },
    });
};
exports.createWorker = createWorker;
const createWorkstation = async (station_id, name) => {
    return await prisma_1.prisma.workstation.upsert({
        where: { station_id },
        update: { name },
        create: { station_id, name },
    });
};
exports.createWorkstation = createWorkstation;
