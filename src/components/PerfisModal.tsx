import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Shield, Edit, Trash2, Plus, X } from "lucide-react";
import { listaPermissoes } from "@/services/permissions";
import { atualizaPerfil, buscaPerfil, criaPerfil, deletaPerfil, listaPerfis } from "@/services/profiles";

interface Profile {
  id: string;
  nome: string;
  permissoes: string[];
  status: number;
  created_at: string;
  updated_at: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({
  isOpen,
  onClose,
}: ProfileModalProps) => {
  const [profileName, setProfileName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<{id: string, nome: string}[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<{id: string, nome: string}[]>([]);
  const [perfilEdicao, setPerfilEdicao] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (perfilEdicao) {
      setProfileName(perfilEdicao.nome);
      const permissoesDoPerfil = perfilEdicao.permissoes.map((p: any) => ({nome: p.nome, id: p.id}));
      setSelectedPermissions(permissoesDoPerfil);
      setIsCreating(true);
    } else {
      setProfileName("");
      setSelectedPermissions([]);
      setPerfilEdicao(null);
    }
  }, [perfilEdicao, availablePermissions]);
  
  const fetchPerfis = async () => {
    const data = await listaPerfis();
   const perfis = data.perfis.map((perfil: any) => ({
     nome: perfil.nome,
     id: perfil.id,
   }));
   setProfiles(perfis);
  };

  useEffect(() => {
      fetchPerfis();
    }, []);
    
    useEffect(() => {
        const fetchPermissoes = async () => {
        const data = await listaPermissoes();
       const permissoes = data.permissoes.map((permissao: any) => ({nome: permissao.nome, id: permissao.id}));
       setAvailablePermissions(permissoes);
      };
      fetchPermissoes();
    }, []);
    

  const handlePermissionChange = (permission: {id: string, nome: string}, checked: boolean) => {
    if (permission.nome === 'Acesso Total' && checked) {
      setSelectedPermissions([permission]);
      return;
    }
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p.id !== permission.id));
    }
  };

  const handleSubmit = () => {
    if (!profileName.trim() || selectedPermissions.length === 0) return;
    if (perfilEdicao) {
      onEditProfile(perfilEdicao.id, profileName, selectedPermissions.map(p => p.id));
    } else {
      onCreateProfile(profileName, selectedPermissions.map(p => p.id));
    }

    setProfileName("");
    setSelectedPermissions([]);
    setIsCreating(false);
    setPerfilEdicao(null);
  };

  const onEditProfile = async (id: string, nome: string, permissoes: string[]) => {
    try { 
      await atualizaPerfil(id, nome, permissoes);
      fetchPerfis();
    } catch (error) {
      console.error(error);
    }
  }

  const onCreateProfile = async (nome: string, permissoes: string[]) => {
    try {
      await criaPerfil(nome, permissoes);
      fetchPerfis();
    } catch (error) {
      console.error(error);
    }
  }

  const onDeleteProfile = async (id: string) => {
    try {
      await deletaPerfil(id);
      fetchPerfis();
    } catch (error) {
      console.error(error);
    }
  }

  const handleCancel = () => {
    setProfileName("");
    setSelectedPermissions([]);
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setProfileName("");
    setSelectedPermissions([]);
    setPerfilEdicao(null);
  };
  
  const onEditClick = async (profile: Profile) => {
    const perfil = await buscaPerfil(profile.id);
    setPerfilEdicao(perfil);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Gerenciar Perfis de Acesso
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Lista de Perfis Existentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Perfis Existentes</h3>
              <Button onClick={startCreating} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Perfil
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {profiles.map((profile) => (
                <Card key={profile.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{profile.nome}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditClick(profile)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteProfile(profile.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Área de Criação/Edição */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {perfilEdicao ? "Editar Perfil" : "Criar Novo Perfil"}
              </h3>
              {isCreating && (
                <Button onClick={handleCancel} size="sm" variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isCreating ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileName">Nome do Perfil</Label>
                    <Input
                      id="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Digite o nome do perfil"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Permissões</Label>
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {availablePermissions.map((permission, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            disabled={selectedPermissions.some(p => p.nome === 'Acesso Total') && permission.nome !== 'Acesso Total'}
                            id={permission.id}
                            checked={selectedPermissions.some(p => p.id === permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={permission.nome} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleSubmit}
                      disabled={!profileName.trim() || selectedPermissions.length === 0}
                      className="flex-1"
                    >
                      {perfilEdicao ? "Atualizar" : "Criar"}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Selecione um perfil para editar ou clique em "Novo Perfil" para criar um novo
                    </p>
                    <Button onClick={startCreating} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Novo Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};