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
