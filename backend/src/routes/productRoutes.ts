import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  getAllProducts,
  getProductById,
  createProduct,
  searchProductsByLocation,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_tajny_klucz_jwt_abc123';

// Middleware do weryfikacji tokena
const verifyToken = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Brak tokena' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

// Konfiguracja multer do uploadu zdjęć
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tylko pliki graficzne są dozwolone!'));
    }
  }
});

// WAŻNE: kolejność ma znaczenie!
// Bardziej szczegółowe routy muszą być PRZED ogólnymi
router.get('/my', getMyProducts);           // /api/products/my
router.get('/search', searchProductsByLocation); // /api/products/search
router.post('/', createProduct);            // POST /api/products
router.get('/', getAllProducts);            // GET /api/products
router.get('/:id', getProductById);         // /api/products/:id
router.put('/:id', updateProduct);          // PUT /api/products/:id
router.delete('/:id', deleteProduct);       // DELETE /api/products/:id

// 🆕 NOWY ENDPOINT - Upload zdjęć do istniejącego produktu
router.post('/:id/images', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];
    const userId = (req as any).userId;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Brak zdjęć' });
    }

    // Sprawdź czy produkt należy do użytkownika
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    if (product.userId !== userId) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    // Generuj URLe do zdjęć
const imageUrls = files.map(file => `/uploads/products/${file.filename}`); 

    // Zaktualizuj produkt z nowymi zdjęciami
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        images: imageUrls,
      },
    });

    res.json({ 
      success: true, 
      product: updatedProduct,
      message: 'Zdjęcia zostały dodane pomyślnie'
    });
  } catch (error) {
    console.error('Błąd uploadu zdjęć:', error);
    res.status(500).json({ error: 'Błąd serwera podczas uploadu zdjęć' });
  }
});

export default router;