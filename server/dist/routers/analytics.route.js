"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_service_1 = require("../services/analytics.service");
const router = (0, express_1.Router)();
router.get('/factory', async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    const stats = await analytics_service_1.AnalyticsService.getFactoryStats(date);
    res.json(stats);
});
router.get('/workstations', async (req, res) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        date.setUTCHours(0, 0, 0, 0);
        const stats = await analytics_service_1.AnalyticsService.getAllWorkstationsStats(date);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/workers', async (req, res) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        date.setUTCHours(0, 0, 0, 0);
        const stats = await analytics_service_1.AnalyticsService.getAllWorkersStats(date);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/recent', async (req, res) => {
    try {
        const events = await analytics_service_1.AnalyticsService.getRecentActivity();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
