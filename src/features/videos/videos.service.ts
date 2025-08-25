import fs from 'node:fs';
import ffmpeg from 'fluent-ffmpeg';

export const convertToWebm = (
	inputPath: string,
	outputPath: string,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		ffmpeg(inputPath)
			.outputOptions([
				'-c:v libvpx-vp9', // Codec de video VP9
				'-b:v 1M', // Bitrate de video
				'-c:a libopus', // Codec de audio Opus
				'-b:a 128k', // Bitrate de audio
				'-vf scale=-1:720', // Escalar a 720p (manteniendo la relación de aspecto)
			])
			.on('end', () => {
				fs.unlinkSync(inputPath);
				resolve(outputPath);
			})
			.on('error', (err) => {
				reject(err);
			})
			.save(outputPath);
	});
};
