import { Request, Response } from 'express';

// Upload pojedynczego zdjęcia
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Brak pliku' });
    }

    // Zwróć URL do pliku
    const fileUrl = `/uploads/products/${req.file.filename}`;
    
    res.json({
      message: 'Plik został przesłany',
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Błąd uploadu:', error);
    res.status(500).json({ error: 'Błąd przesyłania pliku' });
  }
};

// Upload wielu zdjęć
export const uploadImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'Brak plików' });
    }

    // Zwróć tablicę URL-i
    const fileUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    
    res.json({
      message: 'Pliki zostały przesłane',
      urls: fileUrls,
      count: req.files.length,
    });
  } catch (error) {
    console.error('Błąd uploadu:', error);
    res.status(500).json({ error: 'Błąd przesyłania plików' });
  }
};