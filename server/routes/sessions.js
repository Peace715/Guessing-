import express from 'express';
import { createSession, getSession } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', createSession);
router.get('/:code', getSession);

export default router; 
