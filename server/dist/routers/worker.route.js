"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const worker_1 = require("../controllers/worker");
const router = (0, express_1.Router)();
router.post('/', worker_1.addWorker);
router.get('/', worker_1.getAllWorkers);
exports.default = router;
