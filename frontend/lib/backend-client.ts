// Mock backend client for development
// This will be replaced with actual Encore.ts generated client

interface BackendClient {
  sales: {
    // Products
    listProducts: () => Promise<{ products: any[] }>;
    createProduct: (data: any) => Promise<any>;
    getProduct: (params: { id: number }) => Promise<any>;
    updateProduct: (data: any) => Promise<any>;
    deleteProduct: (params: { id: number }) => Promise<void>;
    updateProductStock: (params: { id: number; quantity: number }) => Promise<any>;

    // Clients
    listClients: () => Promise<{ clients: any[] }>;
    createClient: (data: any) => Promise<any>;
    getClient: (params: { id: number }) => Promise<any>;
    updateClient: (data: any) => Promise<any>;
    deleteClient: (params: { id: number }) => Promise<void>;

    // Sales
    listSales: () => Promise<{ sales: any[] }>;
    createSale: (data: any) => Promise<any>;
    getSale: (params: { id: number }) => Promise<any>;
    getSalesStats: () => Promise<any>;

    // Exchanges
    listExchanges: () => Promise<{ exchanges: any[] }>;
    createExchange: (data: any) => Promise<any>;
    getExchange: (params: { id: number }) => Promise<any>;
    updateExchange: (data: any) => Promise<any>;
    deleteExchange: (params: { id: number }) => Promise<void>;

    // Settings
    getCompanySettings: () => Promise<any>;
    updateCompanySettings: (data: any) => Promise<any>;
  };
}

// Mock data for development
const mockData = {
  products: [
    {
      id: 1,
      name: "Produto Exemplo 1",
      description: "Descrição do produto exemplo",
      price: 99.99,
      costPrice: 50.00,
      stockQuantity: 100,
      minStock: 10,
      category: "Eletrônicos",
      barcode: "1234567890123",
      imageUrl: "",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: "Produto Exemplo 2",
      description: "Outro produto exemplo",
      price: 149.99,
      costPrice: 75.00,
      stockQuantity: 50,
      minStock: 5,
      category: "Roupas",
      barcode: "1234567890124",
      imageUrl: "",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  clients: [
    {
      id: 1,
      name: "Cliente Exemplo",
      email: "cliente@exemplo.com",
      phone: "(11) 99999-9999",
      cpfCnpj: "123.456.789-00",
      address: "Rua Exemplo, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      birthDate: new Date("1990-01-01"),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  sales: [
    {
      id: 1,
      clientId: 1,
      totalAmount: 99.99,
      discountAmount: 0,
      paymentMethod: "credit",
      paymentInstallments: 1,
      status: "completed",
      saleDate: new Date(),
      notes: "",
      items: [
        {
          id: 1,
          saleId: 1,
          productId: 1,
          quantity: 1,
          unitPrice: 99.99,
          totalPrice: 99.99,
          product: {
            id: 1,
            name: "Produto Exemplo 1"
          }
        }
      ],
      client: {
        id: 1,
        name: "Cliente Exemplo"
      }
    }
  ],
  exchanges: [],
  settings: {
    id: 1,
    companyName: "Sérgio Imports Ltda",
    tradeName: "Sérgio Imports",
    cnpj: "12.345.678/0001-90",
    stateRegistration: "123456789",
    address: "Rua do Comércio, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    phone: "(11) 3333-4444",
    email: "contato@sergioimports.com",
    website: "https://www.sergioimports.com",
    logoUrl: "",
    pixKey: "12345678000190",
    pixQrCodeUrl: "",
    updatedAt: new Date()
  }
};

// Mock API implementation
const mockApi = {
  async get(url: string) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    if (url.includes('/products')) {
      if (url.includes('/products/')) {
        const id = parseInt(url.split('/').pop() || '0');
        const product = mockData.products.find(p => p.id === id);
        if (!product) throw new Error('Product not found');
        return product;
      }
      return { products: mockData.products };
    }
    
    if (url.includes('/clients')) {
      if (url.includes('/clients/')) {
        const id = parseInt(url.split('/').pop() || '0');
        const client = mockData.clients.find(c => c.id === id);
        if (!client) throw new Error('Client not found');
        return client;
      }
      return { clients: mockData.clients };
    }
    
    if (url.includes('/sales')) {
      if (url.includes('/stats')) {
        return {
          totalSales: mockData.sales.length,
          totalRevenue: mockData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
          averageTicket: mockData.sales.length > 0 ? mockData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / mockData.sales.length : 0,
          salesThisMonth: mockData.sales.length,
          revenueThisMonth: mockData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
        };
      }
      if (url.includes('/sales/')) {
        const id = parseInt(url.split('/').pop() || '0');
        const sale = mockData.sales.find(s => s.id === id);
        if (!sale) throw new Error('Sale not found');
        return sale;
      }
      return { sales: mockData.sales };
    }
    
    if (url.includes('/exchanges')) {
      if (url.includes('/exchanges/')) {
        const id = parseInt(url.split('/').pop() || '0');
        const exchange = mockData.exchanges.find((e: any) => e.id === id);
        if (!exchange) throw new Error('Exchange not found');
        return exchange;
      }
      return { exchanges: mockData.exchanges };
    }
    
    if (url.includes('/settings/company')) {
      return mockData.settings;
    }
    
    throw new Error(`Unknown endpoint: ${url}`);
  },

  async post(url: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url.includes('/products')) {
      const newProduct = {
        ...data,
        id: Math.max(...mockData.products.map(p => p.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockData.products.push(newProduct);
      return newProduct;
    }
    
    if (url.includes('/clients')) {
      const newClient = {
        ...data,
        id: Math.max(...mockData.clients.map(c => c.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockData.clients.push(newClient);
      return newClient;
    }
    
    if (url.includes('/sales')) {
      const newSale = {
        ...data,
        id: Math.max(...mockData.sales.map(s => s.id), 0) + 1,
        saleDate: new Date(),
        status: 'completed',
        items: data.items.map((item: any, index: number) => ({
          ...item,
          id: index + 1,
          saleId: Math.max(...mockData.sales.map(s => s.id), 0) + 1
        }))
      };
      
      if (newSale.clientId) {
        newSale.client = mockData.clients.find(c => c.id === newSale.clientId);
      }
      
      mockData.sales.push(newSale);
      return newSale;
    }
    
    if (url.includes('/exchanges')) {
      const newExchange = {
        ...data,
        id: Math.max(...mockData.exchanges.map((e: any) => e.id), 0) + 1,
        status: 'pending',
        exchangeDate: new Date()
      };
      mockData.exchanges.push(newExchange);
      return newExchange;
    }
    
    throw new Error(`Unknown endpoint: ${url}`);
  },

  async put(url: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url.includes('/products/')) {
      const id = data.id;
      const index = mockData.products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      
      mockData.products[index] = {
        ...mockData.products[index],
        ...data,
        updatedAt: new Date()
      };
      return mockData.products[index];
    }
    
    if (url.includes('/clients/')) {
      const id = data.id;
      const index = mockData.clients.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Client not found');
      
      mockData.clients[index] = {
        ...mockData.clients[index],
        ...data,
        updatedAt: new Date()
      };
      return mockData.clients[index];
    }
    
    if (url.includes('/settings/company')) {
      mockData.settings = {
        ...mockData.settings,
        ...data,
        updatedAt: new Date()
      };
      return mockData.settings;
    }
    
    throw new Error(`Unknown endpoint: ${url}`);
  },

  async delete(url: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url.includes('/products/')) {
      const id = parseInt(url.split('/').pop() || '0');
      const index = mockData.products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      mockData.products.splice(index, 1);
      return;
    }
    
    if (url.includes('/clients/')) {
      const id = parseInt(url.split('/').pop() || '0');
      const index = mockData.clients.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Client not found');
      mockData.clients.splice(index, 1);
      return;
    }
    
    throw new Error(`Unknown endpoint: ${url}`);
  }
};

// Create backend client
const backend: BackendClient = {
  sales: {
    // Products
    listProducts: () => mockApi.get('/products'),
    createProduct: (data) => mockApi.post('/products', data),
    getProduct: ({ id }) => mockApi.get(`/products/${id}`),
    updateProduct: (data) => mockApi.put(`/products/${data.id}`, data),
    deleteProduct: ({ id }) => mockApi.delete(`/products/${id}`),
    updateProductStock: ({ id, quantity }) => mockApi.put(`/products/${id}/stock`, { id, quantity }),

    // Clients
    listClients: () => mockApi.get('/clients'),
    createClient: (data) => mockApi.post('/clients', data),
    getClient: ({ id }) => mockApi.get(`/clients/${id}`),
    updateClient: (data) => mockApi.put(`/clients/${data.id}`, data),
    deleteClient: ({ id }) => mockApi.delete(`/clients/${id}`),

    // Sales
    listSales: () => mockApi.get('/sales'),
    createSale: (data) => mockApi.post('/sales', data),
    getSale: ({ id }) => mockApi.get(`/sales/${id}`),
    getSalesStats: () => mockApi.get('/sales/stats'),

    // Exchanges
    listExchanges: () => mockApi.get('/exchanges'),
    createExchange: (data) => mockApi.post('/exchanges', data),
    getExchange: ({ id }) => mockApi.get(`/exchanges/${id}`),
    updateExchange: (data) => mockApi.put(`/exchanges/${data.id}`, data),
    deleteExchange: ({ id }) => mockApi.delete(`/exchanges/${id}`),

    // Settings
    getCompanySettings: () => mockApi.get('/settings/company'),
    updateCompanySettings: (data) => mockApi.put('/settings/company', data)
  }
};

export default backend;
