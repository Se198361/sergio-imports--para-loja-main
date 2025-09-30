import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Smartphone, Banknote, QrCode, Receipt } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Product } from '~backend/sales/products';
import type { Client } from '~backend/sales/clients';
import type { CreateSaleRequest, Sale } from '~backend/sales/sales';
import type { CompanySettings } from '~backend/sales/settings';

interface CartItem {
  product: Product;
  quantity: number;
}

export function PDV() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [installments, setInstallments] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsResponse, clientsResponse, settingsResponse] = await Promise.all([
        backend.sales.listProducts(),
        backend.sales.listClients(),
        backend.sales.getCompanySettings(),
      ]);
      
      setProducts(productsResponse.products);
      setClients(clientsResponse.clients);
      setCompanySettings(settingsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    }
  };

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      toast({
        title: 'Erro',
        description: 'Produto sem estoque',
        variant: 'destructive',
      });
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stockQuantity) {
          toast({
            title: 'Erro',
            description: 'Quantidade excede o estoque disponível',
            variant: 'destructive',
          });
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stockQuantity) {
      toast({
        title: 'Erro',
        description: 'Quantidade excede o estoque disponível',
        variant: 'destructive',
      });
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient(null);
    setDiscount(0);
    setNotes('');
    setPaymentMethod('');
    setInstallments(1);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotal = () => {
    return getSubtotal() - discount;
  };

  const getInstallmentAmount = () => {
    return getTotal() / installments;
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Erro',
        description: 'Carrinho vazio',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: 'Erro',
        description: 'Selecione uma forma de pagamento',
        variant: 'destructive',
      });
      return;
    }

    try {
      const saleData: CreateSaleRequest = {
        clientId: selectedClient?.id,
        totalAmount: getTotal(),
        discountAmount: discount,
        paymentMethod,
        paymentInstallments: installments,
        installmentAmount: installments > 1 ? getInstallmentAmount() : undefined,
        notes: notes || undefined,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
        })),
      };

      const sale = await backend.sales.createSale(saleData);
      
      // Get the complete sale data with items
      const completeSale = await backend.sales.getSale({ id: sale.id });
      setLastSale(completeSale);
      
      setIsPaymentDialogOpen(false);
      setIsReceiptDialogOpen(true);
      clearCart();
      
      toast({
        title: 'Sucesso',
        description: 'Venda finalizada com sucesso',
      });
    } catch (error) {
      console.error('Error finalizing sale:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao finalizar venda',
        variant: 'destructive',
      });
    }
  };

  const printReceipt = () => {
    if (!lastSale || !companySettings) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = generateReceiptHtml(lastSale, companySettings);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo de Venda - ${lastSale.id}</title>
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const paymentMethods = [
    { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'debit', label: 'Cartão de Débito', icon: CreditCard },
    { value: 'pix', label: 'PIX', icon: QrCode },
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PDV - Ponto de Venda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <NeumorphicCard className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <NeumorphicCard
                  key={product.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {product.name}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                      {formatCurrency(product.price)}
                    </span>
                    <span className={`text-xs ${
                      product.stockQuantity <= (product.minStock || 0)
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Est: {product.stockQuantity}
                    </span>
                  </div>
                </NeumorphicCard>
              ))}
            </div>
          </NeumorphicCard>
        </div>

        {/* Cart Section */}
        <div>
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Carrinho</h2>
              {cart.length > 0 && (
                <NeumorphicButton
                  size="sm"
                  variant="danger"
                  onClick={clearCart}
                >
                  <Trash2 className="w-4 h-4" />
                </NeumorphicButton>
              )}
            </div>

            {/* Client Selection */}
            <div className="mb-4">
              <Label>Cliente (Opcional)</Label>
              <Select
                value={selectedClient?.id.toString() || 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    setSelectedClient(null);
                  } else {
                    const client = clients.find(c => c.id.toString() === value);
                    setSelectedClient(client || null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.product.price)} cada
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <NeumorphicButton
                        size="sm"
                        variant="secondary"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </NeumorphicButton>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <NeumorphicButton
                        size="sm"
                        variant="secondary"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </NeumorphicButton>
                      
                      <NeumorphicButton
                        size="sm"
                        variant="danger"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </NeumorphicButton>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount */}
            {cart.length > 0 && (
              <div className="mb-4">
                <Label>Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Total */}
            {cart.length > 0 && (
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm mb-1 text-red-600 dark:text-red-400">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>
            )}

            {/* Finalize Sale Button */}
            {cart.length > 0 && (
              <NeumorphicButton
                className="w-full"
                onClick={() => setIsPaymentDialogOpen(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Finalizar Venda
              </NeumorphicButton>
            )}
          </NeumorphicCard>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pagamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod || 'none'} onValueChange={(value) => {
                if (value === 'none') {
                  setPaymentMethod('');
                } else {
                  setPaymentMethod(value);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecionar forma de pagamento</SelectItem>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {method.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'credit' && (
              <div>
                <Label>Parcelas</Label>
                <Select
                  value={installments.toString()}
                  onValueChange={(value) => setInstallments(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x de {formatCurrency(getTotal() / num)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {paymentMethod === 'pix' && companySettings?.pixQrCodeUrl && (
              <div className="text-center">
                <img
                  src={companySettings.pixQrCodeUrl}
                  alt="QR Code PIX"
                  className="mx-auto max-w-48 max-h-48"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Escaneie o QR Code para pagar
                </p>
              </div>
            )}

            <div>
              <Label>Observações</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a venda..."
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total a Pagar:</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              
              <div className="flex space-x-2">
                <NeumorphicButton
                  variant="secondary"
                  onClick={() => setIsPaymentDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </NeumorphicButton>
                <NeumorphicButton
                  onClick={handleFinalizeSale}
                  className="flex-1"
                >
                  Confirmar Pagamento
                </NeumorphicButton>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Venda Finalizada</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Venda #{lastSale?.id} finalizada com sucesso!
              </h3>
            </div>
            
            <div className="flex space-x-2">
              <NeumorphicButton
                variant="secondary"
                onClick={() => setIsReceiptDialogOpen(false)}
                className="flex-1"
              >
                Fechar
              </NeumorphicButton>
              <NeumorphicButton
                onClick={printReceipt}
                className="flex-1"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Imprimir Recibo
              </NeumorphicButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
