import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as path from 'path';
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔧 Starting server...');

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true,
}));

console.log('✅ CORS configured');

app.use(express.json());

console.log('✅ JSON parser configured');

// Logger middleware - sprawdza wszystkie requesty
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

console.log('✅ Logger middleware configured');

// Serwuj statyczne pliki z folderu uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

console.log('✅ Static files configured:', uploadsPath);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

console.log('✅ Routes configured');

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('📍 Test endpoint hit!');
  res.json({ message: 'Backend działa! 🚀' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});