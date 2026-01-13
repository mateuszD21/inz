import { Router } from 'express';
import { upload } from '../middleware/upload';
import { uploadImages } from '../controllers/uploadController';

const router = Router();

// upload zdjec max 10
router.post('/images', upload.array('images', 10), uploadImages);

export default router;