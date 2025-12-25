import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    res.status(500).json({ error: 'Błąd pobierania produktu' });
  }
};

// Dodaj nowy produkt
export const createProduct = async (req: Request, res: Response) => {
  try {
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
      userId,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        images,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        location,
        userId,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Błąd tworzenia produktu' });
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

    // Prosty filtr (dla dokładniejszego użyj PostGIS)
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

    // Filtruj po odległości (uproszczone)
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
    res.status(500).json({ error: 'Błąd wyszukiwania' });
  }
};

// Funkcja obliczająca odległość (Haversine)
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