"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workstation_1 = require("../controllers/workstation");
const router = (0, express_1.Router)();
router.post('/', workstation_1.addWorkstation);
exports.default = router;
