
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, User } from 'lucide-react';
import { doLogin } from '@/services/auth';
import useUsuarioStore from '@/stores/usuario';
import { useNavigate } from 'react-router-dom';
import { getUser } from '@/services/user';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUsuario, setToken, usuario, primeiroAcesso } = useUsuarioStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await doLogin({email, senha: password});
      if (!success) {
        setError('Email ou senha incorretos');
      } else {
        setToken(success.access_token, success.refresh_token);
        const user = await getUser({id: success.usuario.id});
       
        if (!user) {
          setError('Erro ao buscar usuário');
         } else {
          setUsuario(user);
        }
      }
    } catch (err) {
      console.log(err);
      
      setError('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (usuario && primeiroAcesso) {
      navigate('/primeiro-acesso');
    }
  }, [primeiroAcesso, usuario, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-2">
            <User className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Sistema Hospitalar</CardTitle>
          <p className="text-blue-100">Faça login para continuar</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
            <span onClick={() => navigate('/recuperar-senha')} className="cursor-pointer text-sm text-blue-500">Esqueci minha senha</span>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={isLoading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
