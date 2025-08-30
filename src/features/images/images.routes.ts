import { Router } from 'express';
import multer from 'multer';

import { authMiddleware } from '../../middlewares/auth.middleware';

import * as ImagesController from './images.controller';

const router: Router = Router();

// Configuración de multer para uploads temporales
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para listar imágenes, solo para usuarios autenticados
router.get('/', authMiddleware, ImagesController.listImages);

// Ruta para obtener una imagen
router.get('/:imageName', ImagesController.sendImageByName);

// Ruta para subir imágenes
router.post('/upload', upload.single('image'), ImagesController.uploadImage);

// Endpoint: subir VARIAS imágenes
router.post(
	'/upload/many',
	upload.array('images', 3),
	ImagesController.uploadMany,
);

export default router;
