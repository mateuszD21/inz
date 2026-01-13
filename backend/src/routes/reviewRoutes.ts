import { Router } from 'express';
import {
  createReview,
  getUserReviews,
  getUserReviewStats,
  canReview,
  deleteReview,
} from '../controllers/reviewController';

const router = Router();

router.post('/', createReview);
router.get('/user/:userId', getUserReviews);
router.get('/user/:userId/stats', getUserReviewStats);
router.get('/can-review/:transactionId', canReview);
router.delete('/:reviewId', deleteReview);

export default router;