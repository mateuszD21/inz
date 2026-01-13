import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_tajny_klucz_jwt_abc123';

// Weryfikacja tokenu
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

// Pobieranie wszystkich produktow
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
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

// Pobieranie produktu po ID
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

export const searchProductsByLocation = async (req: Request, res: Response) => {
  try {
    const { city, latitude, longitude, radius = '50' } = req.query;

    console.log('=== SEARCH BY LOCATION ===');
    console.log('Query params:', { city, latitude, longitude, radius });

    if (city && typeof city === 'string') {
      const products = await prisma.product.findMany({
        where: {
          location: {
            contains: city,
            mode: 'insensitive',
          },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`Found ${products.length} products in city: ${city}`);
      return res.json(products);
    }

    // Wyszukiwanie po współrzędnych i promieniu
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);

      console.log('Searching by coordinates:', { lat, lon, rad });

      // Pobieranie wszystkich produktów z lokalizacją
      const allProducts = await prisma.product.findMany({
        where: {
          AND: [
            { latitude: { not: null } },
            { longitude: { not: null } },
            { status: 'active' },
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

      console.log(`Processing ${allProducts.length} products with coordinates`);

      // Obliczanie odległosci i filtrowanie
      const productsWithDistance = allProducts
        .map((product) => {
          if (!product.latitude || !product.longitude) return null;
          
          const distance = calculateDistance(
            lat,
            lon,
            product.latitude,
            product.longitude
          );
          
          return {
            ...product,
            distance: parseFloat(distance.toFixed(1)),
          };
        })
        .filter((product): product is NonNullable<typeof product> => 
          product !== null && product.distance <= rad
        )
        .sort((a, b) => a.distance - b.distance);

      console.log(`Found ${productsWithDistance.length} products within ${rad}km`);

      return res.json(productsWithDistance);
    }

    return res.status(400).json({ 
      error: 'Podaj miasto lub współrzędne (latitude + longitude)' 
    });

  } catch (error) {
    console.error('Błąd wyszukiwania:', error);
    res.status(500).json({ error: 'Błąd wyszukiwania' });
  }
};

// Pobieranie produktów zalogowanego uzytkownika
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const products = await prisma.product.findMany({
      where: { 
        userId,
       status: { not: 'deleted'},
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

// Aktualizacja produktu
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

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    if (product.userId !== userId) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

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

// Usuwanie produktu
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const userId = verifyToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    if (product.userId !== userId) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        status: 'deleted',
      },
    });

    res.json({ message: 'Produkt usunięty' });
  } catch (error) {
    console.error('Błąd usuwania produktu:', error);
    res.status(500).json({ error: 'Błąd usuwania produktu' });
  }
};

// Funkcja obliczająca odległość Haversine
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Promień Ziemi w km
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