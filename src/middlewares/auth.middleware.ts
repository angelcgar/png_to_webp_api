import type { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../utils/jwt';

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

	const [bearer, token] = authHeader.split(' ');
	if (bearer !== 'Bearer' || !token) {
		return res.status(401).json({ error: 'Formato inválido' });
	}

	try {
		const decoded = verifyToken(token);
		// todo: mejorar tipado de req.user
		// @ts-expect-error
		req.user = decoded;
		next();
	} catch (error) {
		// todo: eliminar console.log en producción
		console.log({ error, f: 'authMiddleware.ts' });
		return res.status(401).json({ error: 'Token inválido o expirado' });
	}
}
