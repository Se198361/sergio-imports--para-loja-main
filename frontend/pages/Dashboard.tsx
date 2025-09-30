import React, { useState, useEffect } from 'react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import backend from '~backend/client';
import { useToast } from '@/components/ui/use-toast';

interface DashboardStats {
  totalProducts: number;
  totalClients: number;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesThisMonth: number;
  revenueThisMonth: number;
  lowStockProducts: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalClients: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    salesThisMonth: 0,
    revenueThisMonth: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [salesStats, products, clients] = await Promise.all([
        backend.sales.getSalesStats(),
        backend.sales.listProducts(),
        backend.sales.listClients(),
      ]);

      const lowStockProducts = products.products.filter(
        product => product.stockQuantity <= (product.minStock || 0)
      ).length;

      setStats({
        totalProducts: products.products.length,
        totalClients: clients.clients.length,
        totalSales: salesStats.totalSales,
        totalRevenue: salesStats.totalRevenue,
        averageTicket: salesStats.averageTicket,
        salesThisMonth: salesStats.salesThisMonth,
        revenueThisMonth: salesStats.revenueThisMonth,
        lowStockProducts,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statCards = [
    {
      title: 'Total de Produtos',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClients.toString(),
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total de Vendas',
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(stats.averageTicket),
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Produtos em Baixo Estoque',
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <NeumorphicCard key={index} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <NeumorphicCard key={index} className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              </div>
            </NeumorphicCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeumorphicCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vendas Este Mês
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Quantidade de Vendas</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.salesThisMonth}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Receita do Mês</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.revenueThisMonth)}
              </span>
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumo Geral
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Produtos Cadastrados</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.totalProducts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Clientes Cadastrados</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.totalClients}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Produtos em Baixo Estoque</span>
              <span className={`font-semibold ${stats.lowStockProducts > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {stats.lowStockProducts}
              </span>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}
