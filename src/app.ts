import cors from 'cors';

import express from 'express';

import { envs } from './config/envs';

const app = express();
const port = envs.PORT ?? 3000;

// Middlewares
app.use(
	cors({
		origin: envs.CORS_ORIGIN,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas agrupadas por dominio
import authRoutes from './features/auth/auth.routes';
import imageRoutes from './features/images/images.routes';

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

// Ruta básica de health check
app.get('/', (_req, res) => {
	res.json({ message: 'API is running 🚀' });
});

app.listen(port, () => {
	console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
