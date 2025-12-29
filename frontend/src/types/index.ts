export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  status: string;
  createdAt: string;
  userId: number;  // ✨ DODANE - ID właściciela produktu
  user: User;
}

// ✨ NOWY INTERFEJS - Transaction
export interface Transaction {
  id: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  buyerId: number;
  productId: number;
  buyer: User;
  product: Product;
}

// ⭐ NOWY INTERFEJS - Review
export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerId: number;
  reviewedUserId: number;
  reviewer: {
    id: number;
    name: string;
    avatar: string | null;
  };
}