import express from 'express';
import * as ctrl from '../controllers/role.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', auth(), ctrl.getRoles);
router.post('/', auth([1]), ctrl.createRole);
router.put('/:id', auth([1]), ctrl.updateRole);
router.delete('/:id', auth([1]), ctrl.deleteRole);

export default router;