import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { getLogs } from '../controllers/audit.controller.js';

const router = express.Router();

router.get('/', auth([1]), getLogs);

export default router;