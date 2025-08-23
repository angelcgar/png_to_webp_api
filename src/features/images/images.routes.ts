import fs from 'node:fs';
import path from 'node:path';

import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';

import { envs } from '../../config/envs';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router: Router = Router();

// Carpeta donde se guardarán las imágenes optimizadas
const UPLOADS_DIR = path.join(process.cwd(), envs.UPLOAD_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Configuración de multer para uploads temporales
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/images', authMiddleware, (_req, res) => {
	const files = fs.readdirSync(path.join(process.cwd(), envs.UPLOAD_DIR));
	const urls = files.map((file) => `/${envs.UPLOAD_DIR}/${file}`);
	res.json({ count: urls.length, files: urls });
});

// Ruta para subir imágenes
router.post('/upload', upload.single('image'), async (req, res) => {
	try {
		const { filename } = req.body;

		const finalName = filename ? `${filename}.webp` : `${Date.now()}.webp`;
		const outputPath = path.join(UPLOADS_DIR, finalName);

		// Procesar imagen: redimensionar y convertir a webp
		await sharp(req.file?.buffer)
			.resize(800) // máx ancho
			.webp({ quality: 80 })
			.toFile(outputPath);

		res.json({
			success: true,
			url: `/${envs.UPLOAD_DIR}/${finalName}`,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: 'Error procesando imagen' });
	}
});

// Endpoint: subir VARIAS imágenes
router.post('/upload/many', upload.array('images', 3), async (req, res) => {
	try {
		const { filenames } = req.body; // puede ser un array desde el cliente
		const results = [];

		for (let i = 0; i < Number(req.files?.length); i++) {
			//! Bug: TypeScript no entiende que req.files existe
			// @ts-expect-error
			const file = req.files[i];
			const customName = Array.isArray(filenames) ? filenames[i] : null;
			const finalName = customName
				? `${customName}.webp`
				: `${Date.now()}_${i}.webp`;

			const outputPath = path.join(UPLOADS_DIR, finalName);

			await sharp(file.buffer)
				.resize(800)
				.webp({ quality: 80 })
				.toFile(outputPath);

			results.push({
				original: file.originalname,
				savedAs: finalName,
				url: `/uploads/${finalName}`,
			});
		}

		res.json({
			success: true,
			count: results.length,
			files: results,
		});
	} catch (err) {
		console.error(err);
		res
			.status(500)
			.json({ success: false, error: 'Error procesando imágenes' });
	}
});

export default router;
