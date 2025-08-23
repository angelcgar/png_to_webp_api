import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';

import fs from 'fs';
import path from 'path';

import { envs } from './config/envs';

const app = express();
const port = envs.PORT ?? 3000;

// Carpeta donde se guardarán las imágenes optimizadas
const UPLOADS_DIR = path.join(process.cwd(), envs.UPLOAD_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Configuración de multer para uploads temporales
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para subir imágenes
app.post('/upload', upload.single('image'), async (req, res) => {
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
app.post('/upload/many', upload.array('images', 3), async (req, res) => {
	try {
		const { filenames } = req.body; // puede ser un array desde el cliente
		const results = [];

		for (let i = 0; i < Number(req.files?.length); i++) {
			//! Bug: TypeScript no entiende que req.files existe
			// @ts-ignore
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

function authMiddleware(req: Request, res: Response, next: NextFunction) {
	const token = req.headers['authorization'];
	if (token === 'Bearer MI_TOKEN_SECRETO') {
		return next();
	}
	return res.status(401).json({ error: 'Unauthorized' });
}

app.get('/images', authMiddleware, (req, res) => {
	const files = fs.readdirSync(path.join(process.cwd(), 'uploads'));
	const urls = files.map((file) => `/uploads/${file}`);
	res.json({ count: urls.length, files: urls });
});

// Servir imágenes estáticas desde /uploads
app.use(`/${envs.UPLOAD_DIR}`, express.static(UPLOADS_DIR));

app.listen(port, () => {
	console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
