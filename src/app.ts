import express from 'express';
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

// Servir imágenes estáticas desde /uploads
app.use(`/${envs.UPLOAD_DIR}`, express.static(UPLOADS_DIR));

app.listen(port, () => {
	console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
