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

// 🛒 Rozpocznij transakcję (kupujący klika "Kup")
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const { productId, message } = req.body;

    // Sprawdź czy produkt istnieje
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: { user: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    // Sprawdź czy użytkownik nie próbuje kupić swojego produktu
    if (product.userId === userId) {
      return res.status(400).json({ error: 'Nie możesz kupić własnego produktu' });
    }

    // Sprawdź czy produkt jest dostępny
    if (product.status !== 'active') {
      return res.status(400).json({ error: 'Produkt nie jest już dostępny' });
    }

    // Sprawdź czy użytkownik nie ma już aktywnej transakcji dla tego produktu
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        productId: parseInt(productId),
        buyerId: userId,
        status: {
          in: ['pending', 'accepted'],
        },
      },
    });

    if (existingTransaction) {
      return res.status(400).json({ 
        error: 'Masz już aktywną transakcję dla tego produktu',
        transaction: existingTransaction 
      });
    }

    // Utwórz transakcję
    const transaction = await prisma.transaction.create({
      data: {
        buyerId: userId,
        productId: parseInt(productId),
        status: 'pending',
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Opcjonalnie: Wyślij wiadomość do sprzedającego
    if (message) {
      await prisma.message.create({
        data: {
          content: message,
          senderId: userId,
          receiverId: product.userId,
        },
      });
    }

    res.status(201).json({
      message: 'Transakcja rozpoczęta! Sprzedający zostanie powiadomiony.',
      transaction,
    });
  } catch (error) {
    console.error('Błąd tworzenia transakcji:', error);
    res.status(500).json({ error: 'Błąd podczas rozpoczynania transakcji' });
  }
};

// 📋 Pobierz wszystkie transakcje użytkownika
export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { product: { userId: userId } },
        ],
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        product: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const asBuyer = transactions.filter(t => t.buyerId === userId);
    const asSeller = transactions.filter(t => t.product.userId === userId);

    res.json({
      asBuyer,
      asSeller,
      all: transactions,
    });
  } catch (error) {
    console.error('Błąd pobierania transakcji:', error);
    res.status(500).json({ error: 'Błąd pobierania transakcji' });
  }
};

// 📄 Pobierz szczegóły jednej transakcji
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        product: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcja nie znaleziona' });
    }

    const isBuyer = transaction.buyerId === userId;
    const isSeller = transaction.product.userId === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Brak uprawnień do tej transakcji' });
    }

    res.json({
      transaction,
      role: isBuyer ? 'buyer' : 'seller',
    });
  } catch (error) {
    console.error('Błąd pobierania transakcji:', error);
    res.status(500).json({ error: 'Błąd pobierania transakcji' });
  }
};

// ✅ Akceptuj transakcję (sprzedający)
export const acceptTransaction = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: { product: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcja nie znaleziona' });
    }

    if (transaction.product.userId !== userId) {
      return res.status(403).json({ error: 'Tylko sprzedający może zaakceptować transakcję' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transakcja nie jest w stanie oczekującym' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: { status: 'accepted' },
      include: {
        buyer: true,
        product: { include: { user: true } },
      },
    });

    res.json({
      message: 'Transakcja zaakceptowana',
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error('Błąd akceptacji transakcji:', error);
    res.status(500).json({ error: 'Błąd akceptacji transakcji' });
  }
};

// 🎉 Zakończ transakcję jako ukończoną (sprzedający)
export const completeTransaction = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: { product: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcja nie znaleziona' });
    }

    if (transaction.product.userId !== userId) {
      return res.status(403).json({ error: 'Tylko sprzedający może oznaczyć transakcję jako ukończoną' });
    }

    if (transaction.status !== 'accepted') {
      return res.status(400).json({ error: 'Transakcja musi być najpierw zaakceptowana' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: { status: 'completed' },
      include: {
        buyer: true,
        product: { include: { user: true } },
      },
    });

    // Oznacz produkt jako sprzedany
    await prisma.product.update({
      where: { id: transaction.productId },
      data: { status: 'sold' },
    });

    res.json({
      message: 'Transakcja ukończona! Produkt został oznaczony jako sprzedany.',
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error('Błąd ukończenia transakcji:', error);
    res.status(500).json({ error: 'Błąd ukończenia transakcji' });
  }
};

// ❌ Anuluj transakcję
export const cancelTransaction = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: { product: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcja nie znaleziona' });
    }

    const isBuyer = transaction.buyerId === userId;
    const isSeller = transaction.product.userId === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Brak uprawnień do anulowania tej transakcji' });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({ error: 'Nie można anulować ukończonej transakcji' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' },
      include: {
        buyer: true,
        product: { include: { user: true } },
      },
    });

    res.json({
      message: 'Transakcja anulowana',
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error('Błąd anulowania transakcji:', error);
    res.status(500).json({ error: 'Błąd anulowania transakcji' });
  }
};