import { Router } from 'express';

import multer from 'multer';

import { uploadVideo } from './videos.controller';

const router: Router = Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('video'), uploadVideo);

export default router;
