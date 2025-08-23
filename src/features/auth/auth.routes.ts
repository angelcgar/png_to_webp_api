import { Router } from 'express';

import * as AuthController from './auth.controller';

const router: Router = Router();

// Simple login
router.post('/login', AuthController.authSimple);

export default router;
