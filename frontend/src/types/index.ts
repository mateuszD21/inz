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
  user: User;
}