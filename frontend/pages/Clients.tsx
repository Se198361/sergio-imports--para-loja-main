import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Client, CreateClientRequest, UpdateClientRequest } from '~backend/sales/clients';

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<CreateClientRequest>>({
    name: '',
    email: '',
    phone: '',
    cpfCnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    birthDate: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await backend.sales.listClients();
      setClients(response.clients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingClient) {
        await backend.sales.updateClient({
          id: editingClient.id,
          ...formData,
        } as UpdateClientRequest);
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso',
        });
      } else {
        await backend.sales.createClient(formData as CreateClientRequest);
        toast({
          title: 'Sucesso',
          description: 'Cliente criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      setEditingClient(null);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar cliente',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpfCnpj: client.cpfCnpj,
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      birthDate: client.birthDate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await backend.sales.deleteClient({ id });
      toast({
        title: 'Sucesso',
        description: 'Cliente excluído com sucesso',
      });
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cliente',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpfCnpj: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      birthDate: undefined,
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpfCnpj?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clientes</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <NeumorphicButton onClick={() => { resetForm(); setEditingClient(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </NeumorphicButton>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpfCnpj: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      birthDate: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
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
                  {editingClient ? 'Atualizar' : 'Criar'}
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
              placeholder="Buscar clientes..."
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
                <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <NeumorphicCard key={client.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {client.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {client.email && (
                        <span>📧 {client.email}</span>
                      )}
                      {client.phone && (
                        <span>📞 {client.phone}</span>
                      )}
                      {client.cpfCnpj && (
                        <span>🆔 {client.cpfCnpj}</span>
                      )}
                      {client.city && client.state && (
                        <span>📍 {client.city}, {client.state}</span>
                      )}
                      {client.birthDate && (
                        <span>🎂 {formatDate(client.birthDate)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <NeumorphicButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </NeumorphicButton>
                    <NeumorphicButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(client.id)}
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
