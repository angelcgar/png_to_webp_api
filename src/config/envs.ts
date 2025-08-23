import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
	PORT: get('PORT').required().asPortNumber(),
	UPLOAD_DIR: get('UPLOAD_DIR').default('uploads').asString(),
};
