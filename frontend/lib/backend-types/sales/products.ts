export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStock?: number;
  category?: string;
  barcode?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStock?: number;
  category?: string;
  barcode?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  stockQuantity?: number;
  minStock?: number;
  category?: string;
  barcode?: string;
  imageUrl?: string;
}

export interface ListProductsResponse {
  products: Product[];
}
