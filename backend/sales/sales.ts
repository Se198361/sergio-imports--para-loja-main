import { api, APIError } from "encore.dev/api";
import { salesDB } from "./db";

export interface Sale {
  id: number;
  clientId?: number;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  paymentInstallments: number;
  installmentAmount?: number;
  status: string;
  saleDate: Date;
  notes?: string;
  items: SaleItem[];
  client?: {
    id: number;
    name: string;
  };
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: number;
    name: string;
  };
}

export interface CreateSaleRequest {
  clientId?: number;
  totalAmount: number;
  discountAmount?: number;
  paymentMethod: string;
  paymentInstallments?: number;
  installmentAmount?: number;
  notes?: string;
  items: CreateSaleItemRequest[];
}

export interface CreateSaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ListSalesResponse {
  sales: Sale[];
}

export interface SalesStatsResponse {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesThisMonth: number;
  revenueThisMonth: number;
}

// Creates a new sale
export const createSale = api<CreateSaleRequest, Sale>(
  { expose: true, method: "POST", path: "/sales" },
  async (req) => {
    const tx = await salesDB.begin();
    
    try {
      const now = new Date();
      
      // Create the sale
      const sale = await tx.queryRow<Sale>`
        INSERT INTO sales (client_id, total_amount, discount_amount, payment_method, payment_installments, installment_amount, status, sale_date, notes)
        VALUES (${req.clientId}, ${req.totalAmount}, ${req.discountAmount || 0}, ${req.paymentMethod}, ${req.paymentInstallments || 1}, ${req.installmentAmount}, 'completed', ${now}, ${req.notes})
        RETURNING id, client_id as "clientId", total_amount as "totalAmount", discount_amount as "discountAmount", payment_method as "paymentMethod", payment_installments as "paymentInstallments", installment_amount as "installmentAmount", status, sale_date as "saleDate", notes
      `;
      
      if (!sale) {
        throw APIError.internal("Failed to create sale");
      }
      
      // Create sale items and update stock
      const items: SaleItem[] = [];
      for (const item of req.items) {
        // Check stock availability
        const product = await tx.queryRow<{ stockQuantity: number }>`
          SELECT stock_quantity as "stockQuantity" FROM products WHERE id = ${item.productId}
        `;
        
        if (!product || product.stockQuantity < item.quantity) {
          throw APIError.invalidArgument(`Insufficient stock for product ${item.productId}`);
        }
        
        // Create sale item
        const saleItem = await tx.queryRow<SaleItem>`
          INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
          VALUES (${sale.id}, ${item.productId}, ${item.quantity}, ${item.unitPrice}, ${item.totalPrice})
          RETURNING id, sale_id as "saleId", product_id as "productId", quantity, unit_price as "unitPrice", total_price as "totalPrice"
        `;
        
        if (!saleItem) {
          throw APIError.internal("Failed to create sale item");
        }
        
        // Update product stock
        await tx.exec`
          UPDATE products 
          SET stock_quantity = stock_quantity - ${item.quantity}, updated_at = ${now}
          WHERE id = ${item.productId}
        `;
        
        items.push(saleItem);
      }
      
      await tx.commit();
      
      return { ...sale, items };
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
);

// Lists all sales
export const listSales = api<void, ListSalesResponse>(
  { expose: true, method: "GET", path: "/sales" },
  async () => {
    const sales = await salesDB.queryAll<Sale>`
      SELECT 
        s.id, 
        s.client_id as "clientId", 
        s.total_amount as "totalAmount", 
        s.discount_amount as "discountAmount", 
        s.payment_method as "paymentMethod", 
        s.payment_installments as "paymentInstallments", 
        s.installment_amount as "installmentAmount", 
        s.status, 
        s.sale_date as "saleDate", 
        s.notes,
        c.name as "clientName"
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      ORDER BY s.sale_date DESC
    `;
    
    // Get items for each sale
    for (const sale of sales) {
      const items = await salesDB.queryAll<SaleItem>`
        SELECT 
          si.id, 
          si.sale_id as "saleId", 
          si.product_id as "productId", 
          si.quantity, 
          si.unit_price as "unitPrice", 
          si.total_price as "totalPrice",
          p.name as "productName"
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ${sale.id}
      `;
      
      sale.items = items;
      if (sale.clientId) {
        sale.client = { id: sale.clientId, name: (sale as any).clientName };
      }
    }
    
    return { sales };
  }
);

// Gets a sale by ID
export const getSale = api<{ id: number }, Sale>(
  { expose: true, method: "GET", path: "/sales/:id" },
  async ({ id }) => {
    const sale = await salesDB.queryRow<Sale>`
      SELECT 
        s.id, 
        s.client_id as "clientId", 
        s.total_amount as "totalAmount", 
        s.discount_amount as "discountAmount", 
        s.payment_method as "paymentMethod", 
        s.payment_installments as "paymentInstallments", 
        s.installment_amount as "installmentAmount", 
        s.status, 
        s.sale_date as "saleDate", 
        s.notes,
        c.name as "clientName"
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.id = ${id}
    `;
    
    if (!sale) {
      throw APIError.notFound("Sale not found");
    }
    
    // Get sale items
    const items = await salesDB.queryAll<SaleItem>`
      SELECT 
        si.id, 
        si.sale_id as "saleId", 
        si.product_id as "productId", 
        si.quantity, 
        si.unit_price as "unitPrice", 
        si.total_price as "totalPrice",
        p.name as "productName"
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ${id}
    `;
    
    sale.items = items;
    if (sale.clientId) {
      sale.client = { id: sale.clientId, name: (sale as any).clientName };
    }
    
    return sale;
  }
);

// Gets sales statistics
export const getSalesStats = api<void, SalesStatsResponse>(
  { expose: true, method: "GET", path: "/sales/stats" },
  async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = await salesDB.queryRow<{
      totalSales: number;
      totalRevenue: number;
      salesThisMonth: number;
      revenueThisMonth: number;
    }>`
      SELECT 
        COUNT(*)::INTEGER as "totalSales",
        COALESCE(SUM(total_amount), 0) as "totalRevenue",
        COUNT(CASE WHEN sale_date >= ${startOfMonth} THEN 1 END)::INTEGER as "salesThisMonth",
        COALESCE(SUM(CASE WHEN sale_date >= ${startOfMonth} THEN total_amount ELSE 0 END), 0) as "revenueThisMonth"
      FROM sales
      WHERE status = 'completed'
    `;
    
    if (!stats) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageTicket: 0,
        salesThisMonth: 0,
        revenueThisMonth: 0,
      };
    }
    
    const averageTicket = stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0;
    
    return {
      ...stats,
      averageTicket,
    };
  }
);
