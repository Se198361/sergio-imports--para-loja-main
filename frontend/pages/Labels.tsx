import React, { useState, useEffect } from 'react';
import { Search, Printer, Tag, Package } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Product } from '~backend/sales/products';
import type { CompanySettings } from '~backend/sales/settings';

export function Labels() {
  const [products, setProducts] = useState<Product[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, settingsResponse] = await Promise.all([
        backend.sales.listProducts(),
        backend.sales.getCompanySettings(),
      ]);
      setProducts(productsResponse.products);
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

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const generateLabels = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um produto',
        variant: 'destructive',
      });
      return;
    }

    const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
    printLabels(selectedProductsData);
  };

  const printLabels = (productsData: Product[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelsHtml = generateLabelsHtml(productsData);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiquetas de Produtos</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            
            .labels-container {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 2mm;
              width: 100%;
            }
            
            .label {
              width: 45mm;
              height: 25mm;
              border: 1px solid #000;
              padding: 2mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              background: #9ca3af;
              color: #000;
            }
            
            .label-header {
              text-align: center;
              font-weight: bold;
              font-size: 8px;
              margin-bottom: 1mm;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 2px;
            }
            
            .company-logo {
              max-width: 15px;
              max-height: 8px;
              object-fit: contain;
            }
            
            .product-name {
              font-size: 7px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 1mm;
              line-height: 1.1;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            
            .product-code {
              font-size: 6px;
              text-align: center;
              margin-bottom: 1mm;
            }
            
            .barcode {
              text-align: center;
              margin-bottom: 1mm;
            }
            
            .barcode-lines {
              display: inline-block;
              font-family: 'Courier New', monospace;
              font-size: 8px;
              letter-spacing: 1px;
              background: repeating-linear-gradient(
                90deg,
                #000 0px,
                #000 1px,
                #fff 1px,
                #fff 2px
              );
              color: transparent;
              padding: 2px 4px;
            }
            
            .price {
              font-size: 10px;
              font-weight: bold;
              text-align: center;
              background: #000;
              color: #fff;
              padding: 1mm;
              margin-top: auto;
            }
            
            @media print {
              body {
                background-color: #f5f5f5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .label {
                background: #9ca3af !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .labels-container {
                grid-template-columns: repeat(4, 1fr);
              }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelsHtml}
          </div>
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

  const generateLabelsHtml = (productsData: Product[]) => {
    const companyName = companySettings?.tradeName || companySettings?.companyName || 'SÉRGIO IMPORTS';
    const logoHtml = companySettings?.logoUrl 
      ? `<img src="${companySettings.logoUrl}" alt="Logo" class="company-logo" />`
      : '';

    return productsData.map(product => `
      <div class="label">
        <div class="label-header">
          ${logoHtml}
          ${companyName}
        </div>
        <div class="product-name">${product.name}</div>
        <div class="product-code">Cód: ${product.id.toString().padStart(6, '0')}</div>
        <div class="barcode">
          <div class="barcode-lines">${product.barcode || product.id.toString().padStart(13, '0')}</div>
        </div>
        <div class="price">${formatCurrency(product.price)}</div>
      </div>
    `).join('');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Etiquetas</h1>
        
        <div className="flex space-x-2">
          <NeumorphicButton
            variant="secondary"
            onClick={selectAllProducts}
            disabled={filteredProducts.length === 0}
          >
            {selectedProducts.size === filteredProducts.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </NeumorphicButton>
          
          <NeumorphicButton
            onClick={generateLabels}
            disabled={selectedProducts.size === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Gerar Etiquetas ({selectedProducts.size})
          </NeumorphicButton>
        </div>
      </div>

      <NeumorphicCard className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-600 h-32 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <NeumorphicCard key={product.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => toggleProductSelection(product.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Cód: {product.id.toString().padStart(6, '0')}
                    </p>
                    
                    {product.category && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        {product.category}
                      </p>
                    )}
                    
                    <div className="text-center">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        )}
      </NeumorphicCard>

      {selectedProducts.size > 0 && (
        <NeumorphicCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Preview das Etiquetas Selecionadas
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products
              .filter(p => selectedProducts.has(p.id))
              .slice(0, 12)
              .map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-300 dark:border-gray-600 p-2 text-center rounded"
                  style={{ 
                    width: '45mm', 
                    height: '25mm', 
                    fontSize: '8px',
                    backgroundColor: '#9ca3af',
                    color: '#000'
                  }}
                >
                  <div className="font-bold mb-1 flex items-center justify-center gap-1">
                    {companySettings?.logoUrl && (
                      <img 
                        src={companySettings.logoUrl} 
                        alt="Logo" 
                        style={{ maxWidth: '15px', maxHeight: '8px', objectFit: 'contain' }}
                      />
                    )}
                    {companySettings?.tradeName || companySettings?.companyName || 'SÉRGIO IMPORTS'}
                  </div>
                  <div className="font-bold text-xs mb-1 truncate">{product.name}</div>
                  <div className="text-xs mb-1">Cód: {product.id.toString().padStart(6, '0')}</div>
                  <div className="text-xs mb-1">|||||||||||||||</div>
                  <div className="bg-black text-white text-xs font-bold p-1">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              ))}
          </div>
          
          {selectedProducts.size > 12 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              E mais {selectedProducts.size - 12} etiquetas...
            </p>
          )}
        </NeumorphicCard>
      )}
    </div>
  );
}
