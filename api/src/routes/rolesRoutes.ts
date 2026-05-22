import { Router } from 'express';
import * as rolesController from '../controllers/rolesController';

const router = Router();

/** Called by Azure SWA after login; body = client principal claims. */
router.post('/getRoles', rolesController.getRoles);
router.get('/getRoles', rolesController.getRoles);

export default router;
