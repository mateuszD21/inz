import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  searchProductsByLocation,
} from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.get('/search', searchProductsByLocation);
router.get('/:id', getProductById);
router.post('/', createProduct);

export default router;