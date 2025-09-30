import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Package, Users, DollarSign, FileText } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Sale } from '~backend/sales/sales';
import type { Product } from '~backend/sales/products';
import type { Client } from '~backend/sales/clients';
import type { CompanySettings } from '~backend/sales/settings';

interface ReportData {
  sales: Sale[];
  products: Product[];
  clients: Client[];
  companySettings: CompanySettings | null;
}

interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}

interface ProductsReport {
  totalProducts: number;
  lowStockProducts: Product[];
  topCategories: Array<{
    category: string;
    count: number;
    totalValue: number;
  }>;
  averagePrice: number;
  totalInventoryValue: number;
}

interface ClientsReport {
  totalClients: number;
  clientsByCity: Array<{
    city: string;
    count: number;
  }>;
  clientsByState: Array<{
    state: string;
    count: number;
  }>;
}

export function Reports() {
  const [data, setData] = useState<ReportData>({ sales: [], products: [], clients: [], companySettings: null });
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<string>('sales');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [productsReport, setProductsReport] = useState<ProductsReport | null>(null);
  const [clientsReport, setClientsReport] = useState<ClientsReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesResponse, productsResponse, clientsResponse, settingsResponse] = await Promise.all([
        backend.sales.listSales(),
        backend.sales.listProducts(),
        backend.sales.listClients(),
        backend.sales.getCompanySettings(),
      ]);
      
      setData({
        sales: salesResponse.sales,
        products: productsResponse.products,
        clients: clientsResponse.clients,
        companySettings: settingsResponse,
      });

      // Generate initial reports with loaded data
      if (startDate && endDate) {
        generateAllReports(salesResponse.sales, productsResponse.products, clientsResponse.clients);
      }
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

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Erro',
        description: 'Selecione as datas inicial e final',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      generateAllReports(data.sales, data.products, data.clients);
      toast({
        title: 'Sucesso',
        description: 'Relatório gerado com sucesso',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar relatório',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateAllReports = (salesData: Sale[], productsData: Product[], clientsData: Client[]) => {
    generateSalesReport(salesData, productsData);
    generateProductsReport(productsData);
    generateClientsReport(clientsData);
  };

  const generateSalesReport = (salesData: Sale[], productsData: Product[]) => {
    const filteredSales = salesData.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return saleDate >= start && saleDate <= end;
    });

    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Top products
    const productSales = new Map<number, { quantity: number; revenue: number }>();
    
    filteredSales.forEach(sale => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach(item => {
          const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
          productSales.set(item.productId, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.totalPrice,
          });
        });
      }
    });

    const topProducts = Array.from(productSales.entries())
      .map(([productId, stats]) => {
        const product = productsData.find(p => p.id === productId);
        return product ? {
          product,
          quantity: stats.quantity,
          revenue: stats.revenue,
        } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by payment method
    const paymentMethods = new Map<string, { count: number; revenue: number }>();
    
    filteredSales.forEach(sale => {
      const existing = paymentMethods.get(sale.paymentMethod) || { count: 0, revenue: 0 };
      paymentMethods.set(sale.paymentMethod, {
        count: existing.count + 1,
        revenue: existing.revenue + sale.totalAmount,
      });
    });

    const salesByPaymentMethod = Array.from(paymentMethods.entries())
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    setSalesReport({
      totalSales,
      totalRevenue,
      averageTicket,
      topProducts,
      salesByPaymentMethod,
    });
  };

  const generateProductsReport = (productsData: Product[]) => {
    const totalProducts = productsData.length;
    const lowStockProducts = productsData.filter(p => p.stockQuantity <= (p.minStock || 0));
    
    // Categories analysis
    const categories = new Map<string, { count: number; totalValue: number }>();
    let totalInventoryValue = 0;
    let totalPrice = 0;

    productsData.forEach(product => {
      const category = product.category || 'Sem categoria';
      const existing = categories.get(category) || { count: 0, totalValue: 0 };
      const productValue = product.price * product.stockQuantity;
      
      categories.set(category, {
        count: existing.count + 1,
        totalValue: existing.totalValue + productValue,
      });
      
      totalInventoryValue += productValue;
      totalPrice += product.price;
    });

    const topCategories = Array.from(categories.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        totalValue: stats.totalValue,
      }))
      .sort((a, b) => b.count - a.count);

    const averagePrice = totalProducts > 0 ? totalPrice / totalProducts : 0;

    setProductsReport({
      totalProducts,
      lowStockProducts,
      topCategories,
      averagePrice,
      totalInventoryValue,
    });
  };

  const generateClientsReport = (clientsData: Client[]) => {
    const totalClients = clientsData.length;
    
    // Clients by city
    const cities = new Map<string, number>();
    const states = new Map<string, number>();

    clientsData.forEach(client => {
      if (client.city) {
        cities.set(client.city, (cities.get(client.city) || 0) + 1);
      }
      if (client.state) {
        states.set(client.state, (states.get(client.state) || 0) + 1);
      }
    });

    const clientsByCity = Array.from(cities.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const clientsByState = Array.from(states.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);

    setClientsReport({
      totalClients,
      clientsByCity,
      clientsByState,
    });
  };

  // Auto-generate reports when dates change and data is available
  useEffect(() => {
    if (data.sales.length > 0 && startDate && endDate && !loading) {
      generateAllReports(data.sales, data.products, data.clients);
    }
  }, [startDate, endDate, data]);

  const exportToPDF = () => {
    const currentReport = getCurrentReport();
    if (!currentReport) {
      toast({
        title: 'Erro',
        description: 'Nenhum relatório para exportar',
        variant: 'destructive',
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pdfContent = generatePDFContent();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório ${getReportTypeLabel(reportType)} - ${formatDate(startDate)} a ${formatDate(endDate)}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 0;
              color: #333;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .report-period {
              font-size: 14px;
              color: #666;
            }
            
            .section {
              margin-bottom: 30px;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .stat-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
            }
            
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            
            .stat-label {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            .table th,
            .table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            .table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${pdfContent}
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

  const generatePDFContent = () => {
    const companyName = data.companySettings?.tradeName || data.companySettings?.companyName || 'SÉRGIO IMPORTS';
    
    let content = `
      <div class="header">
        <div class="company-name">${companyName}</div>
        <div class="report-title">Relatório de ${getReportTypeLabel(reportType)}</div>
        <div class="report-period">Período: ${formatDate(startDate)} a ${formatDate(endDate)}</div>
      </div>
    `;

    if (reportType === 'sales' && salesReport) {
      content += generateSalesPDFContent();
    } else if (reportType === 'products' && productsReport) {
      content += generateProductsPDFContent();
    } else if (reportType === 'clients' && clientsReport) {
      content += generateClientsPDFContent();
    } else if (reportType === 'financial' && salesReport) {
      content += generateFinancialPDFContent();
    }

    content += `
      <div class="footer">
        <div>Relatório gerado em ${formatDate(new Date())} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        <div>${companyName} - Sistema de Vendas</div>
      </div>
    `;

    return content;
  };

  const generateSalesPDFContent = () => {
    if (!salesReport) return '';

    return `
      <div class="section">
        <div class="section-title">Resumo de Vendas</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${salesReport.totalSales}</div>
            <div class="stat-label">Total de Vendas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(salesReport.totalRevenue)}</div>
            <div class="stat-label">Receita Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(salesReport.averageTicket)}</div>
            <div class="stat-label">Ticket Médio</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Top Produtos</div>
        <table class="table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Produto</th>
              <th>Quantidade Vendida</th>
              <th>Receita</th>
            </tr>
          </thead>
          <tbody>
            ${salesReport.topProducts.map((item, index) => `
              <tr>
                <td>${index + 1}º</td>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Vendas por Forma de Pagamento</div>
        <table class="table">
          <thead>
            <tr>
              <th>Forma de Pagamento</th>
              <th>Quantidade</th>
              <th>Receita</th>
              <th>Percentual</th>
            </tr>
          </thead>
          <tbody>
            ${salesReport.salesByPaymentMethod.map(item => `
              <tr>
                <td>${getPaymentMethodLabel(item.method)}</td>
                <td>${item.count}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td>${((item.revenue / salesReport.totalRevenue) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateProductsPDFContent = () => {
    if (!productsReport) return '';

    return `
      <div class="section">
        <div class="section-title">Resumo de Produtos</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${productsReport.totalProducts}</div>
            <div class="stat-label">Total de Produtos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${productsReport.lowStockProducts.length}</div>
            <div class="stat-label">Produtos em Baixo Estoque</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(productsReport.averagePrice)}</div>
            <div class="stat-label">Preço Médio</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(productsReport.totalInventoryValue)}</div>
            <div class="stat-label">Valor Total do Estoque</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Produtos por Categoria</div>
        <table class="table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Quantidade de Produtos</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            ${productsReport.topCategories.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${item.count}</td>
                <td>${formatCurrency(item.totalValue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${productsReport.lowStockProducts.length > 0 ? `
        <div class="section">
          <div class="section-title">Produtos em Baixo Estoque</div>
          <table class="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque Atual</th>
                <th>Estoque Mínimo</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              ${productsReport.lowStockProducts.slice(0, 20).map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.stockQuantity}</td>
                  <td>${product.minStock || 0}</td>
                  <td>${formatCurrency(product.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
  };

  const generateClientsPDFContent = () => {
    if (!clientsReport) return '';

    return `
      <div class="section">
        <div class="section-title">Resumo de Clientes</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${clientsReport.totalClients}</div>
            <div class="stat-label">Total de Clientes</div>
          </div>
        </div>
      </div>

      ${clientsReport.clientsByState.length > 0 ? `
        <div class="section">
          <div class="section-title">Clientes por Estado</div>
          <table class="table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Quantidade de Clientes</th>
                <th>Percentual</th>
              </tr>
            </thead>
            <tbody>
              ${clientsReport.clientsByState.map(item => `
                <tr>
                  <td>${item.state}</td>
                  <td>${item.count}</td>
                  <td>${((item.count / clientsReport.totalClients) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${clientsReport.clientsByCity.length > 0 ? `
        <div class="section">
          <div class="section-title">Top Cidades</div>
          <table class="table">
            <thead>
              <tr>
                <th>Cidade</th>
                <th>Quantidade de Clientes</th>
                <th>Percentual</th>
              </tr>
            </thead>
            <tbody>
              ${clientsReport.clientsByCity.map(item => `
                <tr>
                  <td>${item.city}</td>
                  <td>${item.count}</td>
                  <td>${((item.count / clientsReport.totalClients) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
  };

  const generateFinancialPDFContent = () => {
    if (!salesReport) return '';

    const filteredSales = data.sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    });

    const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discountAmount, 0);
    const grossRevenue = salesReport.totalRevenue + totalDiscount;

    return `
      <div class="section">
        <div class="section-title">Resumo Financeiro</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(grossRevenue)}</div>
            <div class="stat-label">Receita Bruta</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(totalDiscount)}</div>
            <div class="stat-label">Total de Descontos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(salesReport.totalRevenue)}</div>
            <div class="stat-label">Receita Líquida</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(salesReport.averageTicket)}</div>
            <div class="stat-label">Ticket Médio</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Receita por Forma de Pagamento</div>
        <table class="table">
          <thead>
            <tr>
              <th>Forma de Pagamento</th>
              <th>Receita</th>
              <th>Percentual</th>
              <th>Quantidade de Vendas</th>
            </tr>
          </thead>
          <tbody>
            ${salesReport.salesByPaymentMethod.map(item => `
              <tr>
                <td>${getPaymentMethodLabel(item.method)}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td>${((item.revenue / salesReport.totalRevenue) * 100).toFixed(1)}%</td>
                <td>${item.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const exportToCSV = () => {
    const currentReport = getCurrentReport();
    if (!currentReport) {
      toast({
        title: 'Erro',
        description: 'Nenhum relatório para exportar',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_${reportType}_${startDate}_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Sucesso',
        description: 'Relatório exportado com sucesso',
      });
    }
  };

  const generateCSVContent = () => {
    let csv = '\uFEFF'; // BOM for UTF-8
    csv += `Relatório de ${getReportTypeLabel(reportType)}\n\n`;
    csv += `Período:,${formatDate(startDate)} a ${formatDate(endDate)}\n\n`;

    if (reportType === 'sales' && salesReport) {
      csv += `Total de Vendas:,${salesReport.totalSales}\n`;
      csv += `Receita Total:,${formatCurrency(salesReport.totalRevenue)}\n`;
      csv += `Ticket Médio:,${formatCurrency(salesReport.averageTicket)}\n\n`;

      csv += 'Top Produtos\n';
      csv += 'Produto,Quantidade Vendida,Receita\n';
      salesReport.topProducts.forEach(item => {
        csv += `"${item.product.name}",${item.quantity},"${formatCurrency(item.revenue)}"\n`;
      });

      csv += '\nVendas por Forma de Pagamento\n';
      csv += 'Forma de Pagamento,Quantidade,Receita\n';
      salesReport.salesByPaymentMethod.forEach(item => {
        csv += `"${getPaymentMethodLabel(item.method)}",${item.count},"${formatCurrency(item.revenue)}"\n`;
      });
    }

    return csv;
  };

  const getCurrentReport = () => {
    switch (reportType) {
      case 'sales':
        return salesReport;
      case 'products':
        return productsReport;
      case 'clients':
        return clientsReport;
      case 'financial':
        return salesReport;
      default:
        return null;
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'sales': 'Vendas',
      'products': 'Produtos',
      'clients': 'Clientes',
      'financial': 'Financeiro',
    };
    return labels[type] || type;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
        
        <div className="flex space-x-2">
          <NeumorphicButton onClick={exportToCSV} disabled={!getCurrentReport()}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </NeumorphicButton>
          <NeumorphicButton onClick={exportToPDF} disabled={!getCurrentReport()}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </NeumorphicButton>
        </div>
      </div>

      <NeumorphicCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="reportType">Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="products">Produtos</SelectItem>
                <SelectItem value="clients">Clientes</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="endDate">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <NeumorphicButton 
              onClick={handleGenerateReport} 
              className="w-full"
              disabled={generating || !startDate || !endDate}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {generating ? 'Gerando...' : 'Gerar Relatório'}
            </NeumorphicButton>
          </div>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.sales.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total de Vendas no Sistema
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.products.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Produtos Cadastrados
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.clients.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Clientes Cadastrados
            </div>
          </div>
        </div>
      </NeumorphicCard>

      {/* Sales Report */}
      {reportType === 'sales' && salesReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Vendas (Período)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {salesReport.totalSales}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Receita Total (Período)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(salesReport.totalRevenue)}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ticket Médio
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(salesReport.averageTicket)}
                  </p>
                </div>
              </div>
            </NeumorphicCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeumorphicCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Top Produtos (Período)
              </h3>
              
              {salesReport.topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2" />
                  <p>Nenhuma venda no período selecionado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {salesReport.topProducts.slice(0, 5).map((item, index) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Formas de Pagamento (Período)
              </h3>
              
              {salesReport.salesByPaymentMethod.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DollarSign className="w-12 h-12 mx-auto mb-2" />
                  <p>Nenhuma venda no período selecionado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {salesReport.salesByPaymentMethod.map((item) => (
                    <div key={item.method} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getPaymentMethodLabel(item.method)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.count} vendas
                        </p>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </NeumorphicCard>
          </div>
        </>
      )}

      {/* Products Report */}
      {reportType === 'products' && productsReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Produtos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {productsReport.totalProducts}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Baixo Estoque
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {productsReport.lowStockProducts.length}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Preço Médio
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(productsReport.averagePrice)}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Valor do Estoque
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(productsReport.totalInventoryValue)}
                  </p>
                </div>
              </div>
            </NeumorphicCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeumorphicCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Produtos por Categoria
              </h3>
              <div className="space-y-3">
                {productsReport.topCategories.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count} produtos
                      </p>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(item.totalValue)}
                    </span>
                  </div>
                ))}
              </div>
            </NeumorphicCard>

            {productsReport.lowStockProducts.length > 0 && (
              <NeumorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Produtos em Baixo Estoque
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {productsReport.lowStockProducts.slice(0, 10).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Estoque: {product.stockQuantity} | Mínimo: {product.minStock || 0}
                        </p>
                      </div>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </NeumorphicCard>
            )}
          </div>
        </>
      )}

      {/* Clients Report */}
      {reportType === 'clients' && clientsReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Clientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {clientsReport.totalClients}
                  </p>
                </div>
              </div>
            </NeumorphicCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clientsReport.clientsByState.length > 0 && (
              <NeumorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Clientes por Estado
                </h3>
                <div className="space-y-3">
                  {clientsReport.clientsByState.map((item) => (
                    <div key={item.state} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.state}
                        </p>
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {item.count} clientes
                      </span>
                    </div>
                  ))}
                </div>
              </NeumorphicCard>
            )}

            {clientsReport.clientsByCity.length > 0 && (
              <NeumorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Cidades
                </h3>
                <div className="space-y-3">
                  {clientsReport.clientsByCity.slice(0, 5).map((item) => (
                    <div key={item.city} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.city}
                        </p>
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {item.count} clientes
                      </span>
                    </div>
                  ))}
                </div>
              </NeumorphicCard>
            )}
          </div>
        </>
      )}

      {/* Financial Report */}
      {reportType === 'financial' && salesReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Receita Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(salesReport.totalRevenue)}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ticket Médio
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(salesReport.averageTicket)}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Vendas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {salesReport.totalSales}
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Receita por Dia
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(salesReport.totalRevenue / Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))))}
                  </p>
                </div>
              </div>
            </NeumorphicCard>
          </div>

          <NeumorphicCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Receita por Forma de Pagamento
            </h3>
            <div className="space-y-3">
              {salesReport.salesByPaymentMethod.map((item) => (
                <div key={item.method} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getPaymentMethodLabel(item.method)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.count} vendas ({((item.revenue / salesReport.totalRevenue) * 100).toFixed(1)}%)
                    </p>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </>
      )}

      {!getCurrentReport() && !loading && (
        <NeumorphicCard className="p-6">
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Selecione o tipo de relatório, as datas e clique em "Gerar Relatório" para visualizar os dados
            </p>
          </div>
        </NeumorphicCard>
      )}

      {/* Period Information */}
      {getCurrentReport() && (
        <NeumorphicCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações do Período
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Período analisado:</span>
              <span className="ml-2 font-medium">{formatDate(startDate)} a {formatDate(endDate)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Relatório gerado em:</span>
              <span className="ml-2 font-medium">{formatDate(new Date())}</span>
            </div>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
}
