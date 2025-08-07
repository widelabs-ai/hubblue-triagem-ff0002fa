
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { UserRole } from '@/types/user';
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileModal } from './PerfisModal';
import { listaPerfis } from '@/services/profiles';
import { createUser, deleteUser, getAllUsers, updateUser } from '@/services/user';
import useUsuarioStore from '@/stores/usuario';
import { UpdateUserRequest, AddUserRequest } from '@/shared/contracts/authentication';

const UserManagement = () => {
  const { usuario:currentUser } = useUsuarioStore();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatePerfilDialogOpen, setIsCreatePerfilDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<AddUserRequest | UpdateUserRequest>({
    nome: '',
    email: '',
    perfilId: 1,
  });

  const roleColors = {
    enfermeiro: 'bg-green-100 text-green-800',
    administrativo: 'bg-blue-100 text-blue-800',
    medico: 'bg-purple-100 text-purple-800',
    administrador: 'bg-red-100 text-red-800'
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      perfilId:  1,
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateRequest(formData as UpdateUserRequest);
    } else {
      createRequest(formData as AddUserRequest);
    }
    
    resetForm();
    setIsCreateDialogOpen(false);
  };

  const updateRequest = async (user: UpdateUserRequest) => {
   try {
    await updateUser({
      nome: user.nome,
      email: user.email,
      perfilId: user.perfilId,
      status: user.status,
    }, editingUser);
    toast({
      title: "Usuário atualizado",
      description: "As informações do usuário foram atualizadas com sucesso."
    });
    fetchUsers();
   } catch (error) {
    console.error(error);
    toast({
      title: "Erro ao atualizar usuário",
      description: error.message,
      variant: "destructive"
    });
   }
  }

  const createRequest = async (user: AddUserRequest ) => {
    try{
      const data = await createUser(user);
      toast({
        title: "Usuário criado",
        description: data.message
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const fetchProfiles = async () => {
    const data = await listaPerfis();
    setProfiles(data.perfis);
  }

  const fetchUsers = async (currentPage:number = 1) => {
    const data = await getAllUsers(currentPage);
    console.log(data);
    setTotalPages(data.pagination.totalPages);
    setUsers(data.usuarios);
  }

  useEffect(() => {
    fetchProfiles();
    fetchUsers(currentPage);
  }, [currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEdit = (user: any) => {
    
    setFormData({
      nome: user.nome,
      email: user.email,
      perfilId: user.perfilId,
      status: user.status,
      perfil: user.perfil
    });
    setEditingUser(user.id);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir seu próprio usuário.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await deleteUser({id: userId});
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido do sistema.",
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestão de Usuários</h1>
              <p className="text-gray-600">Gerencie usuários e permissões do sistema</p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Button onClick={() => setIsCreatePerfilDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Gerenciar Perfis
            </Button>
          <ProfileModal 
            isOpen={isCreatePerfilDialogOpen}
            onClose={() => setIsCreatePerfilDialogOpen(false)}
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                onClick={resetForm}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="perfilId">Perfil</Label>
                  <Select 
                    value={formData.perfilId.toString() || ''} 
                    onValueChange={(value: UserRole) => setFormData({ ...formData, perfilId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {
                  editingUser && currentUser?.id !== editingUser && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.status === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 1 : 0 })}
                    />
                    <Label htmlFor="isActive">Usuário ativo</Label>
                  </div>
                  )
                }
                
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Usuários do Sistema ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.perfil.nome]}>
                        {user.perfil.nome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={user.status === 1 ? 'text-green-600' : 'text-red-600'}>
                          {user.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Componente de Paginação */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={goToPrevious}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={goToNext}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="text-center mt-4 text-sm text-gray-600">
              Mostrando {startIndex + 1} a {Math.min(endIndex, users.length)} de {users.length} usuários
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
