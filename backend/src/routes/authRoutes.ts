import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.put('/profile', updateProfile);

export default router;