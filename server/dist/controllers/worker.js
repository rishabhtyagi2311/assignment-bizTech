"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWorkers = exports.addWorker = void 0;
const prisma_1 = require("../lib/prisma");
const addWorker = async (req, res) => {
    const { worker_id, name } = req.body;
    if (!worker_id || !name) {
        return res.status(400).json({ error: "worker_id and name are required" });
    }
    try {
        const worker = await prisma_1.prisma.worker.create({
            data: { worker_id, name }
        });
        res.status(201).json(worker);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "Worker ID already exists" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.addWorker = addWorker;
const getAllWorkers = async (_req, res) => {
    const workers = await prisma_1.prisma.worker.findMany();
    res.json(workers);
};
exports.getAllWorkers = getAllWorkers;
