import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, RefreshCw } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Exchange, CreateExchangeRequest } from '~backend/sales/exchanges';
import type { Sale } from '~backend/sales/sales';
import type { Product } from '~backend/sales/products';

export function Exchanges() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateExchangeRequest>>({
    saleId: 0,
    productId: 0,
    reason: '',
    description: '',
    newProductId: undefined,
  });
  const { toast } = useToast();

  const exchangeReasons = [
    'Defeito de fabricação',
    'Tamanho/Modelo incorreto',
    'Não gostei do produto',
    'Outro motivo',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exchangesResponse, salesResponse, productsResponse] = await Promise.all([
        backend.sales.listExchanges(),
        backend.sales.listSales(),
        backend.sales.listProducts(),
      ]);
      
      setExchanges(exchangesResponse.exchanges);
      setSales(salesResponse.sales);
      setProducts(productsResponse.products);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.saleId || !formData.productId || !formData.reason) {
      toast({
        title: 'Erro',
        description: 'Venda, produto e motivo são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      await backend.sales.createExchange(formData as CreateExchangeRequest);
      toast({
        title: 'Sucesso',
        description: 'Troca criada com sucesso',
      });
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating exchange:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar troca',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = async (exchangeId: number) => {
    try {
      const exchange = await backend.sales.getExchange({ id: exchangeId });
      setSelectedExchange(exchange);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Error loading exchange details:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes da troca',
        variant: 'destructive',
      });
    }
  };

  const updateExchangeStatus = async (exchangeId: number, status: string) => {
    try {
      await backend.sales.updateExchange({ id: exchangeId, status });
      toast({
        title: 'Sucesso',
        description: 'Status da troca atualizado',
      });
      loadData();
      if (selectedExchange?.id === exchangeId) {
        setSelectedExchange({ ...selectedExchange, status });
      }
    } catch (error) {
      console.error('Error updating exchange status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status da troca',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      saleId: 0,
      productId: 0,
      reason: '',
      description: '',
      newProductId: undefined,
    });
  };

  const getProductsFromSale = (saleId: number) => {
    const sale = sales.find(s => s.id === saleId);
    return sale?.items.map(item => ({
      id: item.productId,
      name: item.product?.name || `Produto ${item.productId}`,
    })) || [];
  };

  const filteredExchanges = exchanges.filter(exchange =>
    exchange.id.toString().includes(searchTerm) ||
    exchange.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exchange.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trocas</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <NeumorphicButton onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Troca
            </NeumorphicButton>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Troca</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="saleId">Venda *</Label>
                  <Select
                    value={formData.saleId?.toString() || 'none'}
                    onValueChange={(value) => {
                      if (value === 'none') {
                        setFormData(prev => ({ ...prev, saleId: 0, productId: 0 }));
                      } else {
                        const saleId = parseInt(value);
                        setFormData(prev => ({ ...prev, saleId, productId: 0 }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar venda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecionar venda</SelectItem>
                      {sales.map((sale) => (
                        <SelectItem key={sale.id} value={sale.id.toString()}>
                          Venda #{sale.id} - {formatDate(sale.saleDate)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="productId">Produto *</Label>
                  <Select
                    value={formData.productId?.toString() || 'none'}
                    onValueChange={(value) => {
                      if (value === 'none') {
                        setFormData(prev => ({ ...prev, productId: 0 }));
                      } else {
                        setFormData(prev => ({ ...prev, productId: parseInt(value) }));
                      }
                    }}
                    disabled={!formData.saleId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecionar produto</SelectItem>
                      {getProductsFromSale(formData.saleId || 0).map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="reason">Motivo *</Label>
                  <Select
                    value={formData.reason || 'none'}
                    onValueChange={(value) => {
                      if (value === 'none') {
                        setFormData(prev => ({ ...prev, reason: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, reason: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecionar motivo</SelectItem>
                      {exchangeReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="newProductId">Novo Produto (Opcional)</Label>
                  <Select
                    value={formData.newProductId?.toString() || 'none'}
                    onValueChange={(value) => {
                      if (value === 'none') {
                        setFormData(prev => ({ ...prev, newProductId: undefined }));
                      } else {
                        setFormData(prev => ({ ...prev, newProductId: parseInt(value) }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar novo produto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os detalhes da troca..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <NeumorphicButton
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </NeumorphicButton>
                <NeumorphicButton type="submit">
                  Criar Troca
                </NeumorphicButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <NeumorphicCard className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar trocas..."
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
        ) : filteredExchanges.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhuma troca encontrada' : 'Nenhuma troca registrada'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExchanges.map((exchange) => (
              <NeumorphicCard key={exchange.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Troca #{exchange.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exchange.status)}`}>
                        {getStatusLabel(exchange.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <strong>Venda:</strong> #{exchange.saleId}
                      </div>
                      <div>
                        <strong>Produto:</strong> {exchange.product?.name}
                      </div>
                      <div>
                        <strong>Motivo:</strong> {exchange.reason}
                      </div>
                      <div>
                        <strong>Data:</strong> {formatDate(exchange.exchangeDate)}
                      </div>
                      {exchange.newProduct && (
                        <div>
                          <strong>Novo Produto:</strong> {exchange.newProduct.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <NeumorphicButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewDetails(exchange.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </NeumorphicButton>
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        )}
      </NeumorphicCard>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Troca #{selectedExchange?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedExchange && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Informações da Troca
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Data:</span>
                      <span>{formatDate(selectedExchange.exchangeDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedExchange.status)}`}>
                        {getStatusLabel(selectedExchange.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Motivo:</span>
                      <span>{selectedExchange.reason}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Produtos
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Produto Original:</span>
                      <span>{selectedExchange.product?.name}</span>
                    </div>
                    {selectedExchange.newProduct && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Novo Produto:</span>
                        <span>{selectedExchange.newProduct.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedExchange.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Descrição
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {selectedExchange.description}
                  </p>
                </div>
              )}
              
              {selectedExchange.status === 'pending' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <NeumorphicButton
                    variant="secondary"
                    onClick={() => updateExchangeStatus(selectedExchange.id, 'completed')}
                    className="flex-1"
                  >
                    Marcar como Concluída
                  </NeumorphicButton>
                  <NeumorphicButton
                    variant="danger"
                    onClick={() => updateExchangeStatus(selectedExchange.id, 'cancelled')}
                    className="flex-1"
                  >
                    Cancelar Troca
                  </NeumorphicButton>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
