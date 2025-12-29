import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_tajny_klucz_jwt_abc123';

// Helper function do weryfikacji tokenu
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

// ⭐ Dodaj opinię o sprzedającym (tylko kupujący po ukończonej transakcji)
export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const { transactionId, rating, comment } = req.body;

    // Walidacja
    if (!transactionId || !rating) {
      return res.status(400).json({ error: 'Brak wymaganych danych' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Ocena musi być od 1 do 5' });
    }

    // Pobierz transakcję
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
      include: {
        product: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcja nie znaleziona' });
    }

    // Sprawdź czy user jest kupującym
    if (transaction.buyerId !== userId) {
      return res.status(403).json({ error: 'Tylko kupujący może dodać opinię' });
    }

    // Sprawdź czy transakcja jest ukończona
    if (transaction.status !== 'completed') {
      return res.status(400).json({ error: 'Możesz dodać opinię tylko po ukończeniu transakcji' });
    }

    // Sprawdź czy opinia już istnieje
    const existingReview = await prisma.review.findUnique({
      where: {
        transactionId: parseInt(transactionId),
      },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Opinia została już dodana dla tej transakcji' });
    }

    // Utwórz opinię
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        reviewerId: userId, // kupujący
        reviewedUserId: transaction.product.userId, // sprzedający
        transactionId: parseInt(transactionId),
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        transaction: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Błąd dodawania opinii:', error);
    res.status(500).json({ error: 'Błąd dodawania opinii' });
  }
};

// 📋 Pobierz opinie o użytkowniku (sprzedającym)
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        reviewedUserId: parseInt(userId), // opinie o tym użytkowniku
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        transaction: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Oblicz średnią ocen
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.json({
      reviews,
      stats: {
        totalReviews: reviews.length,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Błąd pobierania opinii:', error);
    res.status(500).json({ error: 'Błąd pobierania opinii' });
  }
};

// 📊 Pobierz statystyki opinii użytkownika
export const getUserReviewStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        reviewedUserId: parseInt(userId),
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Zlicz oceny według gwiazdek
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    res.json({
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution,
    });
  } catch (error) {
    console.error('Błąd pobierania statystyk:', error);
    res.status(500).json({ error: 'Błąd pobierania statystyk' });
  }
};

// ✅ Sprawdź czy można dodać opinię dla transakcji
export const canReview = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const { transactionId } = req.params;

    // Pobierz transakcję
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
      include: {
        product: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcja nie znaleziona' });
    }

    // Sprawdź warunki
    const isBuyer = transaction.buyerId === userId;
    const isCompleted = transaction.status === 'completed';
    
    // Sprawdź czy opinia już istnieje
    const existingReview = await prisma.review.findUnique({
      where: {
        transactionId: parseInt(transactionId),
      },
    });

    const canAddReview = isBuyer && isCompleted && !existingReview;

    res.json({
      canReview: canAddReview,
      reason: !isBuyer 
        ? 'Tylko kupujący może dodać opinię' 
        : !isCompleted 
        ? 'Transakcja musi być ukończona' 
        : existingReview 
        ? 'Opinia została już dodana' 
        : null,
      existingReview,
    });
  } catch (error) {
    console.error('Błąd sprawdzania możliwości dodania opinii:', error);
    res.status(500).json({ error: 'Błąd sprawdzania możliwości dodania opinii' });
  }
};

// 🗑️ Usuń opinię (tylko autor)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
    });

    if (!review) {
      return res.status(404).json({ error: 'Opinia nie znaleziona' });
    }

    // Sprawdź czy user jest autorem opinii
    if (review.reviewerId !== userId) {
      return res.status(403).json({ error: 'Nie możesz usunąć cudzej opinii' });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) },
    });

    res.json({ message: 'Opinia usunięta' });
  } catch (error) {
    console.error('Błąd usuwania opinii:', error);
    res.status(500).json({ error: 'Błąd usuwania opinii' });
  }
};