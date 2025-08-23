import { Router } from 'express';

import { generateToken } from '../utils/jwt';

const router: Router = Router();

// Simple login
router.post('/login', (req, res) => {
	const { username, password } = req.body;
	if (username === 'admin' && password === 'password') {
		const token = generateToken({ id: 1, username });
		return res.json({ token });
	}

	return res.status(401).json({ error: 'Credenciales inválidas' });
});

export default router;
