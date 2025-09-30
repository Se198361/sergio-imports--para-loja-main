import { api, APIError } from "encore.dev/api";
import { salesDB } from "./db";

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

// Creates a new product
export const createProduct = api<CreateProductRequest, Product>(
  { expose: true, method: "POST", path: "/products" },
  async (req) => {
    const now = new Date();
    const product = await salesDB.queryRow<Product>`
      INSERT INTO products (name, description, price, cost_price, stock_quantity, min_stock, category, barcode, image_url, created_at, updated_at)
      VALUES (${req.name}, ${req.description}, ${req.price}, ${req.costPrice}, ${req.stockQuantity}, ${req.minStock}, ${req.category}, ${req.barcode}, ${req.imageUrl}, ${now}, ${now})
      RETURNING id, name, description, price, cost_price as "costPrice", stock_quantity as "stockQuantity", min_stock as "minStock", category, barcode, image_url as "imageUrl", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!product) {
      throw APIError.internal("Failed to create product");
    }
    
    return product;
  }
);

// Lists all products
export const listProducts = api<void, ListProductsResponse>(
  { expose: true, method: "GET", path: "/products" },
  async () => {
    const products = await salesDB.queryAll<Product>`
      SELECT id, name, description, price, cost_price as "costPrice", stock_quantity as "stockQuantity", min_stock as "minStock", category, barcode, image_url as "imageUrl", created_at as "createdAt", updated_at as "updatedAt"
      FROM products
      ORDER BY name ASC
    `;
    
    return { products };
  }
);

// Gets a product by ID
export const getProduct = api<{ id: number }, Product>(
  { expose: true, method: "GET", path: "/products/:id" },
  async ({ id }) => {
    const product = await salesDB.queryRow<Product>`
      SELECT id, name, description, price, cost_price as "costPrice", stock_quantity as "stockQuantity", min_stock as "minStock", category, barcode, image_url as "imageUrl", created_at as "createdAt", updated_at as "updatedAt"
      FROM products
      WHERE id = ${id}
    `;
    
    if (!product) {
      throw APIError.notFound("Product not found");
    }
    
    return product;
  }
);

// Updates a product
export const updateProduct = api<UpdateProductRequest, Product>(
  { expose: true, method: "PUT", path: "/products/:id" },
  async (req) => {
    const now = new Date();
    const product = await salesDB.queryRow<Product>`
      UPDATE products
      SET 
        name = COALESCE(${req.name}, name),
        description = COALESCE(${req.description}, description),
        price = COALESCE(${req.price}, price),
        cost_price = COALESCE(${req.costPrice}, cost_price),
        stock_quantity = COALESCE(${req.stockQuantity}, stock_quantity),
        min_stock = COALESCE(${req.minStock}, min_stock),
        category = COALESCE(${req.category}, category),
        barcode = COALESCE(${req.barcode}, barcode),
        image_url = COALESCE(${req.imageUrl}, image_url),
        updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING id, name, description, price, cost_price as "costPrice", stock_quantity as "stockQuantity", min_stock as "minStock", category, barcode, image_url as "imageUrl", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!product) {
      throw APIError.notFound("Product not found");
    }
    
    return product;
  }
);

// Deletes a product
export const deleteProduct = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/products/:id" },
  async ({ id }) => {
    const result = await salesDB.queryRow<{ count: number }>`
      DELETE FROM products WHERE id = ${id} RETURNING 1 as count
    `;
    
    if (!result) {
      throw APIError.notFound("Product not found");
    }
  }
);

// Updates product stock
export const updateProductStock = api<{ id: number; quantity: number }, Product>(
  { expose: true, method: "PATCH", path: "/products/:id/stock" },
  async ({ id, quantity }) => {
    const now = new Date();
    const product = await salesDB.queryRow<Product>`
      UPDATE products
      SET stock_quantity = stock_quantity + ${quantity}, updated_at = ${now}
      WHERE id = ${id}
      RETURNING id, name, description, price, cost_price as "costPrice", stock_quantity as "stockQuantity", min_stock as "minStock", category, barcode, image_url as "imageUrl", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!product) {
      throw APIError.notFound("Product not found");
    }
    
    return product;
  }
);
