export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  tags: string[];
  rating: number;
  downloads: number;
  featured?: boolean;
  demoLink?: string;
  createdAt: string;
  [key: string]: any; // Allow additional properties
}