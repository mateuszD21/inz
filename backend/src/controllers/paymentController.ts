import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_tajny_klucz_jwt_abc123';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const LISTING_PRICE = 1000; // 10 zł w groszach

const verifyToken = (req: Request): number | null => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const { productData } = req.body;

    if (!productData || !productData.title) {
      return res.status(400).json({ error: 'Brak danych produktu' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
  amount: LISTING_PRICE,
  currency: 'pln',
  payment_method_types: ['card'], 
  metadata: {
    userId: userId.toString(),
    productTitle: productData.title,
    productCategory: productData.category || '',
  },
  description: `Opłata za dodanie ogłoszenia: ${productData.title}`,
});

    await prisma.payment.create({
      data: {
        userId: userId,
        amount: LISTING_PRICE,
        currency: 'pln',
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        productData: JSON.stringify(productData),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Błąd tworzenia Payment Intent:', error);
    res.status(500).json({ 
      error: 'Błąd tworzenia płatności',
      details: error.message 
    });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    console.log('=== CONFIRM PAYMENT START ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const userId = verifyToken(req);
    console.log('Verified userId:', userId);
    
    if (!userId) {
      console.log('ERROR: No userId');
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const { paymentIntentId } = req.body;
    console.log('PaymentIntentId from body:', paymentIntentId);

    if (!paymentIntentId) {
      console.log('ERROR: No paymentIntentId in body');
      return res.status(400).json({ error: 'Brak ID płatności' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Płatność nie powiodła się',
        status: paymentIntent.status 
      });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
        userId: userId,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Płatność nie znaleziona' });
    }

    if (payment.productId) {
      return res.status(400).json({ 
        error: 'Produkt został już utworzony dla tej płatności',
        productId: payment.productId 
      });
    }

    const productData = JSON.parse(payment.productData);

    const product = await prisma.product.create({
      data: {
        title: productData.title,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        condition: productData.condition,
        location: productData.location,
        latitude: productData.latitude || null,
        longitude: productData.longitude || null,
        images: productData.images || [],
        userId: userId,
        status: 'active',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        productId: product.id,
        completedAt: new Date(),
      },
    });

    res.json({
      message: 'Płatność potwierdzona i produkt utworzony',
      product: product,
    });
  } catch (error: any) {
    console.error('Błąd potwierdzania płatności:', error);
    res.status(500).json({ 
      error: 'Błąd potwierdzania płatności',
      details: error.message 
    });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send('Webhook signature missing');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(' Payment succeeded:', paymentIntent.id);
      
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'succeeded' },
      });
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log(' Payment failed:', failedPayment.id);
      
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: failedPayment.id },
        data: { status: 'failed' },
      });
      break;

    case 'payment_intent.canceled':
      const canceledPayment = event.data.object as Stripe.PaymentIntent;
      console.log(' Payment canceled:', canceledPayment.id);
      
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: canceledPayment.id },
        data: { status: 'canceled' },
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(payments);
  } catch (error) {
    console.error('Błąd pobierania płatności:', error);
    res.status(500).json({ error: 'Błąd pobierania płatności' });
  }
};

export const getPricing = async (req: Request, res: Response) => {
  res.json({
    listingFee: {
      amount: LISTING_PRICE,
      currency: 'pln',
      amountFormatted: `${(LISTING_PRICE / 100).toFixed(2)} zł`,
    },
  });
};

export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { paymentIntentId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
        userId: userId,
      },
      include: {
        product: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Płatność nie znaleziona' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      payment: payment,
      stripeStatus: paymentIntent.status,
    });
  } catch (error) {
    console.error('Błąd sprawdzania statusu płatności:', error);
    res.status(500).json({ error: 'Błąd sprawdzania statusu płatności' });
  }
};