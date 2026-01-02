import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_tajny_klucz_jwt_abc123';

// Rejestracja
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email jest już zajęty' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Rejestracja pomyślna',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ error: 'Błąd podczas rejestracji' });
  }
};

// Logowanie
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Logowanie pomyślne',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ error: 'Błąd podczas logowania' });
  }
};

// Pobierz dane zalogowanego użytkownika
export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    res.json(user);
  } catch (error) {
    console.error('Błąd pobierania użytkownika:', error);
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

// Aktualizuj profil użytkownika
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { name, email, phone, avatar } = req.body;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: decoded.userId,
          },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email jest już zajęty' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name,
        email,
        phone,
        avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Profil zaktualizowany',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Błąd aktualizacji profilu:', error);
    res.status(500).json({ error: 'Błąd podczas aktualizacji profilu' });
  }
};

// ⭐ ZAKTUALIZOWANE - Pobierz dane użytkownika po ID (publiczne dane)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    res.json(user);
  } catch (error) {
    console.error('Błąd pobierania użytkownika:', error);
    res.status(500).json({ error: 'Błąd pobierania użytkownika' });
  }
};

// Helper function do weryfikacji tokenu
export const verifyToken = (req: Request): number | null => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    return null;
  }
};