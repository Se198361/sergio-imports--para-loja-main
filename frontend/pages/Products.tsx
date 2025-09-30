import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Upload } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Product, CreateProductRequest, UpdateProductRequest } from '~backend/sales/products';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<CreateProductRequest>>({
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    minStock: 0,
    category: '',
    barcode: '',
    imageUrl: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await backend.sales.listProducts();
      setProducts(response.products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: 'Erro',
        description: 'Nome e preço são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingProduct) {
        await backend.sales.updateProduct({
          id: editingProduct.id,
          ...formData,
        } as UpdateProductRequest);
        toast({
          title: 'Sucesso',
          description: 'Produto atualizado com sucesso',
        });
      } else {
        await backend.sales.createProduct(formData as CreateProductRequest);
        toast({
          title: 'Sucesso',
          description: 'Produto criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      stockQuantity: product.stockQuantity,
      minStock: product.minStock,
      category: product.category,
      barcode: product.barcode,
      imageUrl: product.imageUrl,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await backend.sales.deleteProduct({ id });
      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso',
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir produto',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      costPrice: 0,
      stockQuantity: 0,
      minStock: 0,
      category: '',
      barcode: '',
      imageUrl: '',
    });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produtos</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <NeumorphicButton onClick={() => { resetForm(); setEditingProduct(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </NeumorphicButton>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Preço de Venda *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="costPrice">Preço de Custo</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="stockQuantity">Quantidade em Estoque</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="minStock">Estoque Mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="image">Imagem do Produto</Label>
                <div className="mt-2">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Clique para fazer upload da imagem
                        </span>
                      </div>
                    )}
                  </label>
                </div>
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
                  {editingProduct ? 'Atualizar' : 'Criar'}
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
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-600 h-48 rounded-lg mb-4"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <NeumorphicCard key={product.id} className="p-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  
                  {product.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.category}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(product.price)}
                    </span>
                    <span className={`text-sm ${
                      product.stockQuantity <= (product.minStock || 0)
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Estoque: {product.stockQuantity}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <NeumorphicButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </NeumorphicButton>
                    <NeumorphicButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </NeumorphicButton>
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        )}
      </NeumorphicCard>
    </div>
  );
}
