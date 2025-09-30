-- Products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  cost_price DOUBLE PRECISION,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  category TEXT,
  barcode TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf_cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id),
  total_amount DOUBLE PRECISION NOT NULL,
  discount_amount DOUBLE PRECISION DEFAULT 0,
  payment_method TEXT NOT NULL,
  payment_installments INTEGER DEFAULT 1,
  installment_amount DOUBLE PRECISION,
  status TEXT DEFAULT 'completed',
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Sale items table
CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  total_price DOUBLE PRECISION NOT NULL
);

-- Exchanges table
CREATE TABLE exchanges (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT REFERENCES sales(id),
  product_id BIGINT REFERENCES products(id),
  reason TEXT NOT NULL,
  description TEXT,
  new_product_id BIGINT REFERENCES products(id),
  status TEXT DEFAULT 'pending',
  exchange_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company settings table
CREATE TABLE company_settings (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT,
  trade_name TEXT,
  cnpj TEXT,
  state_registration TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  pix_key TEXT,
  pix_qr_code_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default company settings
INSERT INTO company_settings (company_name, trade_name) VALUES ('Sérgio Imports', 'Sérgio Imports');

-- Create indexes for better performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_exchanges_sale ON exchanges(sale_id);
