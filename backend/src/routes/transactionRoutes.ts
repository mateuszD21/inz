import { Router } from 'express';
import {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  acceptTransaction,
  completeTransaction,
  cancelTransaction,
} from '../controllers/transactionController';

const router = Router();

// POST /api/transactions - Rozpocznij transakcję (kupujący klika "Kup")
router.post('/', createTransaction);

// GET /api/transactions/my - Pobierz moje transakcje
router.get('/my', getMyTransactions);

// GET /api/transactions/:id - Pobierz szczegóły transakcji
router.get('/:id', getTransactionById);

// PUT /api/transactions/:id/accept - Zaakceptuj transakcję (sprzedający)
router.put('/:id/accept', acceptTransaction);

// PUT /api/transactions/:id/complete - Oznacz transakcję jako ukończoną (sprzedający)
router.put('/:id/complete', completeTransaction);

// PUT /api/transactions/:id/cancel - Anuluj transakcję
router.put('/:id/cancel', cancelTransaction);

export default router;