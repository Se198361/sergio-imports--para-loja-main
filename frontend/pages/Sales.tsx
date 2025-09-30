import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, User, DollarSign, Printer } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Sale } from '~backend/sales/sales';
import type { CompanySettings } from '~backend/sales/settings';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesResponse, settingsResponse] = await Promise.all([
        backend.sales.listSales(),
        backend.sales.getCompanySettings(),
      ]);
      setSales(salesResponse.sales);
      setCompanySettings(settingsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (saleId: number) => {
    try {
      const sale = await backend.sales.getSale({ id: saleId });
      setSelectedSale(sale);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Error loading sale details:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes da venda',
        variant: 'destructive',
      });
    }
  };

  const handlePrintSale = async (saleId: number) => {
    try {
      const sale = await backend.sales.getSale({ id: saleId });
      printSaleReceipt(sale);
    } catch (error) {
      console.error('Error loading sale for printing:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar venda para impressão',
        variant: 'destructive',
      });
    }
  };

  const printSaleReceipt = (sale: Sale) => {
    if (!companySettings) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = generateReceiptHtml(sale, companySettings);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo de Venda - ${sale.id}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 10px;
              background-color: #fffbf0;
              color: #333;
            }
            
            .receipt {
              max-width: 70mm;
              margin: 0 auto;
              background-color: #fffbf0;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .company-info {
              font-size: 10px;
              margin-bottom: 2px;
            }
            
            .sale-info {
              margin-bottom: 15px;
              border-bottom: 1px dashed #333;
              padding-bottom: 10px;
            }
            
            .sale-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            
            .items {
              margin-bottom: 15px;
            }
            
            .item {
              margin-bottom: 8px;
              border-bottom: 1px dotted #666;
              padding-bottom: 5px;
            }
            
            .item-name {
              font-weight: bold;
              margin-bottom: 2px;
            }
            
            .item-details {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
            }
            
            .totals {
              border-top: 2px solid #333;
              padding-top: 10px;
              margin-top: 15px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            
            .total-final {
              font-size: 14px;
              font-weight: bold;
              border-top: 1px solid #333;
              padding-top: 5px;
              margin-top: 5px;
            }
            
            .payment-info {
              margin-top: 15px;
              border-top: 1px dashed #333;
              padding-top: 10px;
            }
            
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px dashed #333;
              padding-top: 10px;
              font-size: 10px;
            }
            
            @media print {
              body {
                background-color: #fffbf0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .receipt {
                background-color: #fffbf0 !important;
              }
            }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generateReceiptHtml = (sale: Sale, settings: CompanySettings) => {
    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getPaymentMethodLabel = (method: string) => {
      const methods: Record<string, string> = {
        'credit': 'Cartão de Crédito',
        'debit': 'Cartão de Débito',
        'pix': 'PIX',
        'cash': 'Dinheiro',
      };
      return methods[method] || method;
    };

    return `
      <div class="receipt">
        <div class="header">
          <div class="company-name">${settings.tradeName || settings.companyName || 'SÉRGIO IMPORTS'}</div>
          ${settings.cnpj ? `<div class="company-info">CNPJ: ${settings.cnpj}</div>` : ''}
          ${settings.address ? `<div class="company-info">${settings.address}</div>` : ''}
          ${settings.city && settings.state ? `<div class="company-info">${settings.city} - ${settings.state}</div>` : ''}
          ${settings.phone ? `<div class="company-info">Tel: ${settings.phone}</div>` : ''}
          ${settings.email ? `<div class="company-info">${settings.email}</div>` : ''}
        </div>
        
        <div class="sale-info">
          <div class="sale-info-row">
            <span>Venda:</span>
            <span>#${sale.id}</span>
          </div>
          <div class="sale-info-row">
            <span>Data:</span>
            <span>${formatDate(sale.saleDate)}</span>
          </div>
          ${sale.client ? `
            <div class="sale-info-row">
              <span>Cliente:</span>
              <span>${sale.client.name}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="items">
          ${sale.items.map(item => `
            <div class="item">
              <div class="item-name">${item.product?.name || `Produto ${item.productId}`}</div>
              <div class="item-details">
                <span>${item.quantity}x ${formatCurrency(item.unitPrice)}</span>
                <span>${formatCurrency(item.totalPrice)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(sale.totalAmount + sale.discountAmount)}</span>
          </div>
          ${sale.discountAmount > 0 ? `
            <div class="total-row">
              <span>Desconto:</span>
              <span>-${formatCurrency(sale.discountAmount)}</span>
            </div>
          ` : ''}
          <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>${formatCurrency(sale.totalAmount)}</span>
          </div>
        </div>
        
        <div class="payment-info">
          <div class="total-row">
            <span>Pagamento:</span>
            <span>${getPaymentMethodLabel(sale.paymentMethod)}</span>
          </div>
          ${sale.paymentInstallments > 1 ? `
            <div class="total-row">
              <span>Parcelas:</span>
              <span>${sale.paymentInstallments}x ${formatCurrency(sale.installmentAmount || 0)}</span>
            </div>
          ` : ''}
        </div>
        
        ${sale.notes ? `
          <div class="payment-info">
            <div style="margin-bottom: 5px;"><strong>Observações:</strong></div>
            <div style="font-size: 11px;">${sale.notes}</div>
          </div>
        ` : ''}
        
        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div>Volte sempre!</div>
        </div>
      </div>
    `;
  };

  const filteredSales = sales.filter(sale =>
    sale.id.toString().includes(searchTerm) ||
    sale.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'credit': 'Cartão de Crédito',
      'debit': 'Cartão de Débito',
      'pix': 'PIX',
      'cash': 'Dinheiro',
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendas</h1>
      </div>

      <NeumorphicCard className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhuma venda encontrada' : 'Nenhuma venda registrada'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <NeumorphicCard key={sale.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Venda #{sale.id}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                        {sale.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(sale.saleDate)}
                      </div>
                      
                      {sale.client && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {sale.client.name}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {formatCurrency(sale.totalAmount)}
                      </div>
                      
                      <div>
                        {getPaymentMethodLabel(sale.paymentMethod)}
                        {sale.paymentInstallments > 1 && (
                          <span className="ml-1">
                            ({sale.paymentInstallments}x)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <NeumorphicButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewDetails(sale.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </NeumorphicButton>
                    <NeumorphicButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handlePrintSale(sale.id)}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </NeumorphicButton>
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        )}
      </NeumorphicCard>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Venda #{selectedSale?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Informações da Venda
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Data:</span>
                      <span>{formatDate(selectedSale.saleDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                        {selectedSale.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Forma de Pagamento:</span>
                      <span>{getPaymentMethodLabel(selectedSale.paymentMethod)}</span>
                    </div>
                    {selectedSale.paymentInstallments > 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Parcelas:</span>
                        <span>{selectedSale.paymentInstallments}x de {formatCurrency(selectedSale.installmentAmount || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedSale.client && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Cliente
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                        <span>{selectedSale.client.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Itens da Venda
                </h3>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <span className="font-medium">{item.product?.name || `Produto ${item.productId}`}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(item.unitPrice)} cada
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedSale.totalAmount)}</span>
                </div>
                {selectedSale.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                  </div>
                )}
              </div>
              
              {selectedSale.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Observações
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {selectedSale.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <NeumorphicButton
                  onClick={() => printSaleReceipt(selectedSale)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Recibo
                </NeumorphicButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
