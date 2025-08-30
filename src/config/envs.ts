import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
	PORT: get('PORT').required().asPortNumber(),
	JWT_SECRET: get('JWT_SECRET').required().asString(),
	CORS_ORIGIN: get('CORS_ORIGIN').default('http://localhost:5173').asString(),

	UPLOAD_DIR: get('UPLOAD_DIR').default('uploads').asString(),
};
