// backend/src/Routes/student.routes.js
import express from 'express';
import {
    getStudents,
    getStudentById,
    getStudentByDocument,
    getStudentsByGrade
} from '../Logic/student.controller.js';

const router = express.Router();

router.get('/', getStudents);
router.get('/id/:id', getStudentById);
router.get('/document/:document', getStudentByDocument);
router.get('/grade/:grade', getStudentsByGrade);

export default router;
