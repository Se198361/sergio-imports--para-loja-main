import { api, APIError } from "encore.dev/api";
import { salesDB } from "./db";

export interface Exchange {
  id: number;
  saleId: number;
  productId: number;
  reason: string;
  description?: string;
  newProductId?: number;
  status: string;
  exchangeDate: Date;
  sale?: {
    id: number;
    saleDate: Date;
  };
  product?: {
    id: number;
    name: string;
  };
  newProduct?: {
    id: number;
    name: string;
  };
}

export interface CreateExchangeRequest {
  saleId: number;
  productId: number;
  reason: string;
  description?: string;
  newProductId?: number;
}

export interface UpdateExchangeRequest {
  id: number;
  status?: string;
  newProductId?: number;
  description?: string;
}

export interface ListExchangesResponse {
  exchanges: Exchange[];
}

// Creates a new exchange
export const createExchange = api<CreateExchangeRequest, Exchange>(
  { expose: true, method: "POST", path: "/exchanges" },
  async (req) => {
    const now = new Date();
    
    // Verify that the sale and product exist
    const saleItem = await salesDB.queryRow<{ id: number }>`
      SELECT si.id
      FROM sale_items si
      WHERE si.sale_id = ${req.saleId} AND si.product_id = ${req.productId}
    `;
    
    if (!saleItem) {
      throw APIError.invalidArgument("Product not found in the specified sale");
    }
    
    const exchange = await salesDB.queryRow<Exchange>`
      INSERT INTO exchanges (sale_id, product_id, reason, description, new_product_id, status, exchange_date)
      VALUES (${req.saleId}, ${req.productId}, ${req.reason}, ${req.description}, ${req.newProductId}, 'pending', ${now})
      RETURNING id, sale_id as "saleId", product_id as "productId", reason, description, new_product_id as "newProductId", status, exchange_date as "exchangeDate"
    `;
    
    if (!exchange) {
      throw APIError.internal("Failed to create exchange");
    }
    
    return exchange;
  }
);

// Lists all exchanges
export const listExchanges = api<void, ListExchangesResponse>(
  { expose: true, method: "GET", path: "/exchanges" },
  async () => {
    const exchanges = await salesDB.queryAll<Exchange>`
      SELECT 
        e.id, 
        e.sale_id as "saleId", 
        e.product_id as "productId", 
        e.reason, 
        e.description, 
        e.new_product_id as "newProductId", 
        e.status, 
        e.exchange_date as "exchangeDate",
        s.sale_date as "saleDate",
        p.name as "productName",
        np.name as "newProductName"
      FROM exchanges e
      LEFT JOIN sales s ON e.sale_id = s.id
      LEFT JOIN products p ON e.product_id = p.id
      LEFT JOIN products np ON e.new_product_id = np.id
      ORDER BY e.exchange_date DESC
    `;
    
    // Format the response
    const formattedExchanges = exchanges.map(exchange => ({
      ...exchange,
      sale: exchange.saleId ? { id: exchange.saleId, saleDate: (exchange as any).saleDate } : undefined,
      product: exchange.productId ? { id: exchange.productId, name: (exchange as any).productName } : undefined,
      newProduct: exchange.newProductId ? { id: exchange.newProductId, name: (exchange as any).newProductName } : undefined,
    }));
    
    return { exchanges: formattedExchanges };
  }
);

// Gets an exchange by ID
export const getExchange = api<{ id: number }, Exchange>(
  { expose: true, method: "GET", path: "/exchanges/:id" },
  async ({ id }) => {
    const exchange = await salesDB.queryRow<Exchange>`
      SELECT 
        e.id, 
        e.sale_id as "saleId", 
        e.product_id as "productId", 
        e.reason, 
        e.description, 
        e.new_product_id as "newProductId", 
        e.status, 
        e.exchange_date as "exchangeDate",
        s.sale_date as "saleDate",
        p.name as "productName",
        np.name as "newProductName"
      FROM exchanges e
      LEFT JOIN sales s ON e.sale_id = s.id
      LEFT JOIN products p ON e.product_id = p.id
      LEFT JOIN products np ON e.new_product_id = np.id
      WHERE e.id = ${id}
    `;
    
    if (!exchange) {
      throw APIError.notFound("Exchange not found");
    }
    
    return {
      ...exchange,
      sale: exchange.saleId ? { id: exchange.saleId, saleDate: (exchange as any).saleDate } : undefined,
      product: exchange.productId ? { id: exchange.productId, name: (exchange as any).productName } : undefined,
      newProduct: exchange.newProductId ? { id: exchange.newProductId, name: (exchange as any).newProductName } : undefined,
    };
  }
);

// Updates an exchange
export const updateExchange = api<UpdateExchangeRequest, Exchange>(
  { expose: true, method: "PUT", path: "/exchanges/:id" },
  async (req) => {
    const exchange = await salesDB.queryRow<Exchange>`
      UPDATE exchanges
      SET 
        status = COALESCE(${req.status}, status),
        new_product_id = COALESCE(${req.newProductId}, new_product_id),
        description = COALESCE(${req.description}, description)
      WHERE id = ${req.id}
      RETURNING id, sale_id as "saleId", product_id as "productId", reason, description, new_product_id as "newProductId", status, exchange_date as "exchangeDate"
    `;
    
    if (!exchange) {
      throw APIError.notFound("Exchange not found");
    }
    
    return exchange;
  }
);

// Deletes an exchange
export const deleteExchange = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/exchanges/:id" },
  async ({ id }) => {
    const result = await salesDB.queryRow<{ count: number }>`
      DELETE FROM exchanges WHERE id = ${id} RETURNING 1 as count
    `;
    
    if (!result) {
      throw APIError.notFound("Exchange not found");
    }
  }
);
