import { Router } from 'express';
import { register, login, getMe, updateProfile, getUserById } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.get('/users/:id', getUserById); // ✨ NOWE - publiczne dane użytkownika

export default router;