import { Router } from 'express';
import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getMyPayments,
  getPricing,
  checkPaymentStatus,
} from '../controllers/paymentController';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
    webhook: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not configured',
  });
});

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-payment', confirmPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.get('/my-payments', getMyPayments);
router.get('/pricing', getPricing);
router.get('/status/:paymentIntentId', checkPaymentStatus);

export default router;