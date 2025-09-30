import React, { useState, useEffect } from 'react';
import { Save, Upload, Building, CreditCard } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { CompanySettings, UpdateCompanySettingsRequest } from '~backend/sales/settings';

export function Settings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateCompanySettingsRequest>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await backend.sales.getCompanySettings();
      setSettings(response);
      setFormData({
        companyName: response.companyName || '',
        tradeName: response.tradeName || '',
        cnpj: response.cnpj || '',
        stateRegistration: response.stateRegistration || '',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        zipCode: response.zipCode || '',
        phone: response.phone || '',
        email: response.email || '',
        website: response.website || '',
        logoUrl: response.logoUrl || '',
        pixKey: response.pixKey || '',
        pixQrCodeUrl: response.pixQrCodeUrl || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await backend.sales.updateCompanySettings(formData);
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso',
      });
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePixQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, pixQrCodeUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center mb-6">
            <Building className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Informações da Empresa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="companyName">Razão Social</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Nome completo da empresa"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={(e) => setFormData(prev => ({ ...prev, tradeName: e.target.value }))}
                placeholder="Nome comercial da empresa"
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
              <Input
                id="stateRegistration"
                value={formData.stateRegistration}
                onChange={(e) => setFormData(prev => ({ ...prev, stateRegistration: e.target.value }))}
                placeholder="Inscrição estadual"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Cidade"
              />
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="UF"
                maxLength={2}
              />
            </div>

            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="00000-000"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.empresa.com"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="logo">Logo da Empresa</Label>
            <div className="mt-2">
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <label
                htmlFor="logo"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Clique para fazer upload do logo
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>
        </NeumorphicCard>

        {/* PIX Configuration */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center mb-6">
            <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configurações PIX
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={formData.pixKey}
                onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                placeholder="Chave PIX (CPF, CNPJ, e-mail, telefone ou chave aleatória)"
              />
            </div>

            <div>
              <Label htmlFor="pixQrCode">QR Code PIX</Label>
              <div className="mt-2">
                <input
                  id="pixQrCode"
                  type="file"
                  accept="image/*"
                  onChange={handlePixQrCodeUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pixQrCode"
                  className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  {formData.pixQrCodeUrl ? (
                    <img
                      src={formData.pixQrCodeUrl}
                      alt="QR Code PIX"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Clique para fazer upload do QR Code PIX
                      </span>
                    </div>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Este QR Code será exibido no PDV quando o cliente escolher PIX como forma de pagamento
              </p>
            </div>
          </div>
        </NeumorphicCard>

        <div className="flex justify-end">
          <NeumorphicButton
            type="submit"
            disabled={saving}
            className="min-w-32"
          >
            {saving ? (
              'Salvando...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </NeumorphicButton>
        </div>
      </form>
    </div>
  );
}
