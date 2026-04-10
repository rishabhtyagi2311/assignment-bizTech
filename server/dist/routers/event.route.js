"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_service_1 = require("../services/event.service");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        // Basic validation of the payload could be added here or via middleware
        const result = await (0, event_service_1.processAIEvent)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Event Error:', error.message);
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
