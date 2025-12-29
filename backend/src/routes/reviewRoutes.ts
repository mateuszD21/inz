import { Router } from 'express';
import {
  createReview,
  getUserReviews,
  getUserReviewStats,
  canReview,
  deleteReview,
} from '../controllers/reviewController';

const router = Router();

// POST /api/reviews - Dodaj opinię
router.post('/', createReview);

// GET /api/reviews/user/:userId - Pobierz opinie o użytkowniku
router.get('/user/:userId', getUserReviews);

// GET /api/reviews/user/:userId/stats - Statystyki opinii użytkownika
router.get('/user/:userId/stats', getUserReviewStats);

// GET /api/reviews/can-review/:transactionId - Sprawdź czy można dodać opinię
router.get('/can-review/:transactionId', canReview);

// DELETE /api/reviews/:reviewId - Usuń opinię
router.delete('/:reviewId', deleteReview);

export default router;