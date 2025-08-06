
import React, { startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Home } from 'lucide-react';
import { logout } from '@/stores/usuario';
import useUsuarioStore from '@/stores/usuario';

const Header = () => {
  const {usuario, token, refreshToken} = useUsuarioStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(token, refreshToken);
    // Não precisa navegar aqui pois o logout já faz isso
  };

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

  if (!usuario) return null;

  return (
    <header className="bg-white shadow-lg border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span className="font-semibold">Sistema Hospitalar</span>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Bem-vindo,</span>
              <span className="font-medium">{usuario.nome}</span>
              <Badge className={roleColors[usuario.perfil?.nome.toLowerCase()]}>
                {roleLabels[usuario.perfil?.nome.toLowerCase()]}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {usuario?.perfil?.nome === 'administrador' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/usuarios')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Gestão de Usuários
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
