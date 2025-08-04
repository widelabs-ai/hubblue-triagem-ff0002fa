
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from 'lucide-react';
import { doAlterarSenha } from '@/services/auth';
import { useNavigate, useParams } from 'react-router-dom';
import useUsuarioStore from '@/stores/usuario';

const UpdatePasswordScreen = () => {
  const [passwordCopy, setPasswordCopy] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { tokenEmail } = useParams();
  const { token, usuario, setUsuario } = useUsuarioStore()
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await doAlterarSenha({token: token, novaSenha: password});
      if (!success) {
        setError('Erro ao alterar senha');
        navigate('/');
      } else {
        setUsuario({
          ...usuario,
          atualizadoEm: new Date().toISOString()
        });
        navigate('/');
      }
    } catch (err) {
      setError('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-2">
            <User className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
          <p className="text-blue-100">Cadastre uma nova senha</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordCopy">Repita a senha</Label>
              <Input
                id="passwordCopy"
                type="password"
                placeholder="Confirme sua nova senha"
                value={passwordCopy}
                onChange={(e) => setPasswordCopy(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={isLoading || password !== passwordCopy}
            >
              {isLoading ? 'Entrando...' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePasswordScreen;
