import { api, APIError } from "encore.dev/api";
import { salesDB } from "./db";

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  birthDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  birthDate?: Date;
}

export interface UpdateClientRequest {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  birthDate?: Date;
}

export interface ListClientsResponse {
  clients: Client[];
}

// Creates a new client
export const createClient = api<CreateClientRequest, Client>(
  { expose: true, method: "POST", path: "/clients" },
  async (req) => {
    const now = new Date();
    const client = await salesDB.queryRow<Client>`
      INSERT INTO clients (name, email, phone, cpf_cnpj, address, city, state, zip_code, birth_date, created_at, updated_at)
      VALUES (${req.name}, ${req.email}, ${req.phone}, ${req.cpfCnpj}, ${req.address}, ${req.city}, ${req.state}, ${req.zipCode}, ${req.birthDate}, ${now}, ${now})
      RETURNING id, name, email, phone, cpf_cnpj as "cpfCnpj", address, city, state, zip_code as "zipCode", birth_date as "birthDate", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!client) {
      throw APIError.internal("Failed to create client");
    }
    
    return client;
  }
);

// Lists all clients
export const listClients = api<void, ListClientsResponse>(
  { expose: true, method: "GET", path: "/clients" },
  async () => {
    const clients = await salesDB.queryAll<Client>`
      SELECT id, name, email, phone, cpf_cnpj as "cpfCnpj", address, city, state, zip_code as "zipCode", birth_date as "birthDate", created_at as "createdAt", updated_at as "updatedAt"
      FROM clients
      ORDER BY name ASC
    `;
    
    return { clients };
  }
);

// Gets a client by ID
export const getClient = api<{ id: number }, Client>(
  { expose: true, method: "GET", path: "/clients/:id" },
  async ({ id }) => {
    const client = await salesDB.queryRow<Client>`
      SELECT id, name, email, phone, cpf_cnpj as "cpfCnpj", address, city, state, zip_code as "zipCode", birth_date as "birthDate", created_at as "createdAt", updated_at as "updatedAt"
      FROM clients
      WHERE id = ${id}
    `;
    
    if (!client) {
      throw APIError.notFound("Client not found");
    }
    
    return client;
  }
);

// Updates a client
export const updateClient = api<UpdateClientRequest, Client>(
  { expose: true, method: "PUT", path: "/clients/:id" },
  async (req) => {
    const now = new Date();
    const client = await salesDB.queryRow<Client>`
      UPDATE clients
      SET 
        name = COALESCE(${req.name}, name),
        email = COALESCE(${req.email}, email),
        phone = COALESCE(${req.phone}, phone),
        cpf_cnpj = COALESCE(${req.cpfCnpj}, cpf_cnpj),
        address = COALESCE(${req.address}, address),
        city = COALESCE(${req.city}, city),
        state = COALESCE(${req.state}, state),
        zip_code = COALESCE(${req.zipCode}, zip_code),
        birth_date = COALESCE(${req.birthDate}, birth_date),
        updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING id, name, email, phone, cpf_cnpj as "cpfCnpj", address, city, state, zip_code as "zipCode", birth_date as "birthDate", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!client) {
      throw APIError.notFound("Client not found");
    }
    
    return client;
  }
);

// Deletes a client
export const deleteClient = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/clients/:id" },
  async ({ id }) => {
    const result = await salesDB.queryRow<{ count: number }>`
      DELETE FROM clients WHERE id = ${id} RETURNING 1 as count
    `;
    
    if (!result) {
      throw APIError.notFound("Client not found");
    }
  }
);
