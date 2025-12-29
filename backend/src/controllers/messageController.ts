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

// 💬 Wyślij wiadomość
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const { receiverId, productId, content } = req.body;

    // Walidacja - productId jest opcjonalny
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Brak wymaganych danych' });
    }

    // Jeśli productId jest podany, sprawdź czy produkt istnieje
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });

      if (!product) {
        return res.status(404).json({ error: 'Produkt nie znaleziony' });
      }
    }

    // Utwórz wiadomość
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        receiverId: parseInt(receiverId),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Błąd wysyłania wiadomości:', error);
    res.status(500).json({ error: 'Błąd wysyłania wiadomości' });
  }
};

// 📋 Pobierz konwersacje użytkownika
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    console.log('getConversations - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    // Pobierz wszystkie wiadomości gdzie user jest nadawcą lub odbiorcą
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found messages:', messages.length);

    // Pobierz wszystkich użytkowników którzy są w konwersacjach
    const userIds = new Set<number>();
    messages.forEach(msg => {
      userIds.add(msg.senderId);
      userIds.add(msg.receiverId);
    });

    console.log('Unique user IDs:', Array.from(userIds));

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: Array.from(userIds),
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    console.log('Found users:', users.length);

    const usersMap = new Map(users.map(u => [u.id, u]));

    // Grupuj wiadomości według drugiej osoby
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser = usersMap.get(otherUserId);

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUser,
          lastMessage: msg,
          messages: [],
        });
      }
      
      conversationsMap.get(otherUserId).messages.push(msg);
    });

    // Konwertuj na array i posortuj po dacie ostatniej wiadomości
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - 
        new Date(a.lastMessage.createdAt).getTime()
      );

    console.log('Returning conversations:', conversations.length);

    res.json(conversations);
  } catch (error) {
    console.error('Błąd pobierania konwersacji:', error);
    res.status(500).json({ error: 'Błąd pobierania konwersacji' });
  }
};

// 💬 Pobierz wiadomości z konkretną osobą
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Brak ID drugiej osoby' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: parseInt(otherUserId),
          },
          {
            senderId: parseInt(otherUserId),
            receiverId: userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Pobierz dane drugiej osoby
    const otherUser = await prisma.user.findUnique({
      where: { id: parseInt(otherUserId) },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    // Dodaj receiver do każdej wiadomości
    const messagesWithReceiver = messages.map(msg => ({
      ...msg,
      receiver: msg.senderId === userId ? otherUser : currentUser,
    }));

    res.json(messagesWithReceiver);
  } catch (error) {
    console.error('Błąd pobierania wiadomości:', error);
    res.status(500).json({ error: 'Błąd pobierania wiadomości' });
  }
};

// 🔔 Pobierz liczbę nieprzeczytanych wiadomości
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    // Policz wiadomości gdzie user jest odbiorcą
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Błąd pobierania nieprzeczytanych:', error);
    res.status(500).json({ error: 'Błąd pobierania nieprzeczytanych' });
  }
};