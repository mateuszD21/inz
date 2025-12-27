import { Router } from 'express';
import { upload } from '../middleware/upload';
import { uploadImage, uploadImages } from '../controllers/uploadController';

const router = Router();

// Upload pojedynczego zdjęcia
router.post('/image', upload.single('image'), uploadImage);

// Upload wielu zdjęć (max 10)
router.post('/images', upload.array('images', 10), uploadImages);

export default router;