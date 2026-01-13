import { Router } from 'express';
import {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  completeTransaction,
  cancelTransaction,
} from '../controllers/transactionController';

const router = Router();

router.post('/', createTransaction);
router.get('/my', getMyTransactions);
router.get('/:id', getTransactionById);
router.put('/:id/complete', completeTransaction);
router.put('/:id/cancel', cancelTransaction);

export default router;