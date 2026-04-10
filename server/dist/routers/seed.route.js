"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seed_service_1 = require("../services/seed.service");
const prisma_js_1 = require("../lib/prisma.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
router.get('/check', async (req, res) => {
    try {
        const workerCount = await prisma_js_1.prisma.worker.count();
        if (workerCount === 0) {
            await seed_service_1.SeedService.clearDatabase();
            await seed_service_1.SeedService.seedDefaultData();
            return res.status(201).json({
                status: 'seeded',
                message: 'Database was empty. Initialized with default 6 workers and stations.'
            });
        }
        res.status(200).json({
            status: 'exists',
            message: 'Database already contains data. No auto-seed required.'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Initialization check failed', details: error.message });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        await seed_service_1.SeedService.clearDatabase();
        await seed_service_1.SeedService.seedDefaultData();
        res.status(200).json({
            message: 'System reset and refreshed with default demonstration data.'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Refresh failed', details: error.message });
    }
});
router.post('/custom', async (req, res) => {
    try {
        const { workers, workstations, events } = req.body;
        if (!workers || !workstations || !events) {
            return res.status(400).json({
                error: 'Invalid payload. JSON must contain workers, workstations, and events arrays.'
            });
        }
        await seed_service_1.SeedService.seedCustomData(req.body);
        res.status(200).json({ message: 'Custom data processed and timeline generated successfully.' });
    }
    catch (error) {
        res.status(400).json({ error: 'Custom seeding failed', details: error.message });
    }
});
router.get('/template', (req, res) => {
    const template = {
        workers: [{ worker_id: 'W1', name: 'John Doe' }],
        workstations: [{ station_id: 'S1', name: 'Assembly Line Alpha' }],
        events: [
            {
                worker_id: 'W1',
                workstation_id: 'S1',
                event_type: index_js_1.EventType.WORKING,
                timestamp: new Date().toISOString(),
                confidence: 0.95
            },
            {
                worker_id: 'W1',
                workstation_id: 'S1',
                event_type: index_js_1.EventType.PRODUCT_COUNT,
                timestamp: new Date(Date.now() + 1000 * 60).toISOString(),
                count: 5
            }
        ]
    };
    res.json(template);
});
exports.default = router;
