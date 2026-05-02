import express from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', auth([1]), ctrl.getUsers);
router.post('/', auth([1]), ctrl.createUser);
router.put('/:id', auth([1]), ctrl.updateUser);
router.delete('/:id', auth([1]), ctrl.deleteUser);

export default router;