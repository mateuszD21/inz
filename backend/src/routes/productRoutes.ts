import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  searchProductsByLocation,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';

const router = Router();

// WAŻNE: kolejność ma znaczenie!
// Bardziej szczegółowe routy muszą być PRZED ogólnymi
router.get('/my', getMyProducts);           // /api/products/my
router.get('/search', searchProductsByLocation); // /api/products/search
router.post('/', createProduct);            // POST /api/products
router.get('/', getAllProducts);            // GET /api/products
router.get('/:id', getProductById);         // /api/products/:id
router.put('/:id', updateProduct);          // PUT /api/products/:id
router.delete('/:id', deleteProduct);       // DELETE /api/products/:id

export default router;