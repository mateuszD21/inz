import { Router } from 'express';
import { register, login, getMe, updateProfile, getUserById, changePassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.get('/users/:id', getUserById); 
router.put('/change-password', changePassword);

export default router;