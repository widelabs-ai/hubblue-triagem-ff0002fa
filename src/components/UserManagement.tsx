
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
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types/user';
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listaPerfis } from '@/services/permissions';

const UserManagement = () => {
  const { users, createUser, updateUser, deleteUser, currentUser } = useUser();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatePerfilDialogOpen, setIsCreatePerfilDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingPerfil, setEditingPerfil] = useState<string | null>(null);
  const [perfis, setPerfis] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'enfermeiro' as UserRole,
    isActive: true
  });

  const [perfilData, setPerfilData] = useState({
    name: '',
    permissions: [],
  });

  const roleLabels = {
    enfermeiro: 'Enfermeiro',
    administrativo: 'Administrativo',
    medico: 'Médico',
    administrador: 'Administrador'
  };

  const roleColors = {
    enfermeiro: 'bg-green-100 text-green-800',
    administrativo: 'bg-blue-100 text-blue-800',
    medico: 'bg-purple-100 text-purple-800',
    administrador: 'bg-red-100 text-red-800'
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'enfermeiro',
      isActive: true
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser(editingUser, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive
      });
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso."
      });
    } else {
      createUser(formData);
      toast({
        title: "Usuário criado",
        description: "Novo usuário foi criado com sucesso."
      });
    }
    
    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setEditingUser(user.id);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir seu próprio usuário.",
        variant: "destructive"
      });
      return;
    }
    
    deleteUser(userId);
    toast({
      title: "Usuário excluído",
      description: "O usuário foi removido do sistema."
    });
  };

  const handleToggleActive = (userId: string, isActive: boolean) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Erro",
        description: "Você não pode desativar seu próprio usuário.",
        variant: "destructive"
      });
      return;
    }
    
    updateUser(userId, { isActive });
    toast({
      title: isActive ? "Usuário ativado" : "Usuário desativado",
      description: `O usuário foi ${isActive ? 'ativado' : 'desativado'} com sucesso.`
    });
  };

  useEffect(() => {
    const fetchPerfis = async () => {
      const data = await listaPerfis();
     const perfis = data.perfis.map((perfil: any) => ({
       [perfil.nome]: perfil.id,
     }));
     setPerfis(perfis);
    };
    fetchPerfis();
  }, []);

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
          <Dialog open={isCreatePerfilDialogOpen} onOpenChange={setIsCreatePerfilDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={resetForm}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Gerenciar Perfis
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPerfil ? 'Editar Perfil' : 'Criar Perfil'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Perfis</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingPerfil ? 'Atualizar' : 'Criar'}
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="role">Perfil</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Usuário ativo</Label>
                </div>
                
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
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={(checked) => handleToggleActive(user.id, checked)}
                          disabled={user.id === currentUser?.id}
                        />
                        <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
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
      </div>
    </div>
  );
};

export default UserManagement;
