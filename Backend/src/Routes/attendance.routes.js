// Backend/src/Routes/attendance.routes.js
import express from 'express';
import {
    registerAttendance,
    getAttendanceByDate,
    getAttendanceSummary
} from '../Logic/attendance.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, registerAttendance);
router.get('/', verifyToken, getAttendanceByDate);
router.get('/summary', verifyToken, getAttendanceSummary);

export default router;