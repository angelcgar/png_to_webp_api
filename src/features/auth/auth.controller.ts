import type { Request, Response } from 'express';

import { generateToken } from '../../utils/jwt';

export const authSimple = (req: Request, res: Response) => {
	const { username, password } = req.body;
	if (username === 'admin' && password === 'password') {
		const token = generateToken({ id: 1, username });
		return res.json({ token });
	}

	return res.status(401).json({ error: 'Credenciales inválidas' });
};
