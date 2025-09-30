export interface CompanySettings {
  id: number;
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  stateRegistration?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  pixKey?: string;
  pixQrCodeUrl?: string;
  updatedAt: Date;
}

export interface UpdateCompanySettingsRequest {
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  stateRegistration?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  pixKey?: string;
  pixQrCodeUrl?: string;
}
