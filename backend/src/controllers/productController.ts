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

// Pobierz wszystkie produkty
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        user: {
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

    res.json(products);
  } catch (error) {
    console.error('Błąd pobierania produktów:', error);
    res.status(500).json({ error: 'Błąd pobierania produktów' });
  }
};

// Pobierz jeden produkt
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    res.json(product);
  } catch (error) {
    console.error('Błąd pobierania produktu:', error);
    res.status(500).json({ error: 'Błąd pobierania produktu' });
  }
};

// Dodaj nowy produkt
export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('Headers:', req.headers.authorization);
    console.log('Body:', req.body);
    
    const userId = verifyToken(req);
    console.log('Verified userId:', userId);
    
    if (!userId) {
      console.log('ERROR: No userId - unauthorized');
      return res.status(401).json({ error: 'Musisz być zalogowany' });
    }

    const {
      title,
      description,
      price,
      category,
      condition,
      images,
      latitude,
      longitude,
      location,
    } = req.body;

    console.log('Creating product for user:', userId);
    console.log('Product data:', { 
      title, 
      price: typeof price, 
      priceValue: price,
      category, 
      condition, 
      location,
      images: Array.isArray(images) ? images.length : 'not array'
    });

    const productData = {
      title,
      description,
      price: typeof price === 'number' ? price : parseFloat(price),
      category,
      condition,
      images: Array.isArray(images) ? images : [],
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      location,
      userId: userId,
    };

    console.log('Prisma create with data:', productData);

    const product = await prisma.product.create({
      data: productData,
      include: {
        user: true,
      },
    });

    console.log('Product created successfully:', product.id);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('=== DETAILED ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.meta) {
      console.error('Prisma meta:', error.meta);
    }
    res.status(500).json({ 
      error: 'Błąd tworzenia produktu', 
      details: error.message,
      type: error.constructor.name
    });
  }
};

// Wyszukiwanie produktów w promieniu
export const searchProductsByLocation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Brak współrzędnych' });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);

    const products = await prisma.product.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
        ],
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

    const filtered = products.filter((product) => {
      if (!product.latitude || !product.longitude) return false;
      
      const distance = calculateDistance(
        lat,
        lon,
        product.latitude,
        product.longitude
      );
      
      return distance <= rad;
    });

    res.json(filtered);
  } catch (error) {
    console.error('Błąd wyszukiwania:', error);
    res.status(500).json({ error: 'Błąd wyszukiwania' });
  }
};

// Pobierz produkty zalogowanego użytkownika
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const products = await prisma.product.findMany({
      where: { userId },
      include: {
        user: {
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

    res.json(products);
  } catch (error) {
    console.error('Błąd pobierania produktów:', error);
    res.status(500).json({ error: 'Błąd pobierania produktów' });
  }
};

// Aktualizuj produkt
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { id } = req.params;
    const {
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
    } = req.body;

    // Sprawdź czy produkt należy do użytkownika
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    if (product.userId !== userId) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    // Aktualizuj produkt
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        images,
        location,
      },
      include: {
        user: true,
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Błąd aktualizacji produktu:', error);
    res.status(500).json({ error: 'Błąd aktualizacji produktu' });
  }
};

// Usuń produkt
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { id } = req.params;

    // Sprawdź czy produkt należy do użytkownika
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    if (product.userId !== userId) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    // Usuń produkt
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Produkt usunięty' });
  } catch (error) {
    console.error('Błąd usuwania produktu:', error);
    res.status(500).json({ error: 'Błąd usuwania produktu' });
  }
};

// Funkcja obliczająca odległość (Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}