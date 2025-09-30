import { api, APIError } from "encore.dev/api";
import { salesDB } from "./db";

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

// Gets company settings
export const getCompanySettings = api<void, CompanySettings>(
  { expose: true, method: "GET", path: "/settings/company" },
  async () => {
    const settings = await salesDB.queryRow<CompanySettings>`
      SELECT 
        id, 
        company_name as "companyName", 
        trade_name as "tradeName", 
        cnpj, 
        state_registration as "stateRegistration", 
        address, 
        city, 
        state, 
        zip_code as "zipCode", 
        phone, 
        email, 
        website, 
        logo_url as "logoUrl", 
        pix_key as "pixKey", 
        pix_qr_code_url as "pixQrCodeUrl", 
        updated_at as "updatedAt"
      FROM company_settings
      ORDER BY id ASC
      LIMIT 1
    `;
    
    if (!settings) {
      throw APIError.notFound("Company settings not found");
    }
    
    return settings;
  }
);

// Updates company settings
export const updateCompanySettings = api<UpdateCompanySettingsRequest, CompanySettings>(
  { expose: true, method: "PUT", path: "/settings/company" },
  async (req) => {
    const now = new Date();
    
    const settings = await salesDB.queryRow<CompanySettings>`
      UPDATE company_settings
      SET 
        company_name = COALESCE(${req.companyName}, company_name),
        trade_name = COALESCE(${req.tradeName}, trade_name),
        cnpj = COALESCE(${req.cnpj}, cnpj),
        state_registration = COALESCE(${req.stateRegistration}, state_registration),
        address = COALESCE(${req.address}, address),
        city = COALESCE(${req.city}, city),
        state = COALESCE(${req.state}, state),
        zip_code = COALESCE(${req.zipCode}, zip_code),
        phone = COALESCE(${req.phone}, phone),
        email = COALESCE(${req.email}, email),
        website = COALESCE(${req.website}, website),
        logo_url = COALESCE(${req.logoUrl}, logo_url),
        pix_key = COALESCE(${req.pixKey}, pix_key),
        pix_qr_code_url = COALESCE(${req.pixQrCodeUrl}, pix_qr_code_url),
        updated_at = ${now}
      WHERE id = (SELECT id FROM company_settings ORDER BY id ASC LIMIT 1)
      RETURNING 
        id, 
        company_name as "companyName", 
        trade_name as "tradeName", 
        cnpj, 
        state_registration as "stateRegistration", 
        address, 
        city, 
        state, 
        zip_code as "zipCode", 
        phone, 
        email, 
        website, 
        logo_url as "logoUrl", 
        pix_key as "pixKey", 
        pix_qr_code_url as "pixQrCodeUrl", 
        updated_at as "updatedAt"
    `;
    
    if (!settings) {
      throw APIError.notFound("Company settings not found");
    }
    
    return settings;
  }
);
