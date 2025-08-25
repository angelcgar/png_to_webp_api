import type { Request, Response } from 'express';

import { convertToWebm } from './videos.service';

export const uploadVideo = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		const inputPath = req.file.path;
		const outputPath = `${inputPath}-converted.webm`;

		const convertedVideo = await convertToWebm(inputPath, outputPath);

		return res.json({
			message: 'Video converted successfully',
			videoUrl: `/${outputPath}`,
			convertedVideo,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error converting video' });
	}
};
