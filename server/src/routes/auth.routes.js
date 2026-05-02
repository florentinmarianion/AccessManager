import express from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', ctrl.login);
router.get('/profile', auth(), ctrl.getProfile);

export default router;
