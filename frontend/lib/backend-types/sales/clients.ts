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
