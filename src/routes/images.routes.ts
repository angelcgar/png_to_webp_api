import fs from 'node:fs';
import path from 'node:path';

import { Router } from 'express';
import { envs } from '../config/envs';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/images', authMiddleware, (_req, res) => {
	const files = fs.readdirSync(path.join(process.cwd(), envs.UPLOAD_DIR));
	const urls = files.map((file) => `/${envs.UPLOAD_DIR}/${file}`);
	res.json({ count: urls.length, files: urls });
});

export default router;
