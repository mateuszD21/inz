import { Request, Response } from 'express';

// upload zdjec
export const uploadImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'Brak plików' });
    }

    // zwracamy tablice url
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