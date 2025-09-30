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
