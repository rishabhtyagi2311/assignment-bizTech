"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWorkstation = void 0;
const prisma_1 = require("../lib/prisma");
const addWorkstation = async (req, res) => {
    const { station_id, name } = req.body;
    if (!station_id || !name) {
        return res.status(400).json({ error: "station_id and name are required" });
    }
    try {
        const station = await prisma_1.prisma.workstation.create({
            data: { station_id, name }
        });
        res.status(201).json(station);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "Workstation ID already exists" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.addWorkstation = addWorkstation;
