import fs from 'node:fs';
import path from 'node:path';

import type { Request, Response } from 'express';
import sharp from 'sharp';

import { envs } from '../../config/envs';

// Carpeta donde se guardarán las imágenes optimizadas
const UPLOADS_DIR = path.join(process.cwd(), envs.UPLOAD_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

export const listImages = (_req: Request, res: Response) => {
	const files = fs.readdirSync(path.join(process.cwd(), envs.UPLOAD_DIR));
	const urls = files.map((file) => `/${envs.UPLOAD_DIR}/${file}`);
	res.json({ count: urls.length, files: urls });
};

export const sendImageByName = (req: Request, res: Response) => {
	const { imageName } = req.params;

	if (!imageName) {
		res.status(404).json({ error: 'Imagen no recibida' });
		return;
	}

	// Devolver la imagen solicitada
	const imagePath = path.join(UPLOADS_DIR, imageName);
	if (!fs.existsSync(imagePath)) {
		res.status(404).json({ error: 'Imagen no encontrada' });
		return;
	}

	res.sendFile(imagePath);
};

export const uploadImageFile = async (req: Request, res: Response) => {
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
			url: `/api/images/${finalName}`,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: 'Error procesando imagen' });
	}
};

export const uploadImageURL = async (req: Request, res: Response) => {
	try {
		const { imageUrl, filename } = req.body;
		console.log({ imageUrl, filename });
		if (!imageUrl) {
			res
				.status(400)
				.json({ success: false, error: 'URL de la imagen requerida' });
			return;
		}

		const response = await fetch(imageUrl);
		if (!response.ok) {
			res.status(400).json({
				success: false,
				error: 'No se pudo descargar la imagen desde la URL proporcionada',
			});
			return;
		}

		// Convertimos la respuesta en un buffer para sharp
		const imageBuffer = Buffer.from(await response.arrayBuffer());

		// Nombre final
		const finalName = filename ? `${filename}.webp` : `${Date.now()}.webp`;
		const outputPath = path.join(UPLOADS_DIR, finalName);

		// Procesar imagen con sharp
		await sharp(imageBuffer)
			.resize(800)
			.webp({ quality: 80 })
			.toFile(outputPath);

		res.json({
			success: true,
			url: `/api/images/${finalName}`,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			error: 'Error procesando imagen desde URL, usa { imageUrl: URL }',
		});
	}
};

export const uploadMany = async (req: Request, res: Response) => {
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
};
