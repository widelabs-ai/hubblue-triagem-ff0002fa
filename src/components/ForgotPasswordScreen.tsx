
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, LogIn, User } from 'lucide-react';
import { doRecuperarSenha } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await doRecuperarSenha({email});
      if (!success) {
        setError('Erro ao enviar email de recuperação de senha');
      } else {
        toast({
            title: "Email enviado",
            description: success.message,
          });
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação de senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
      <ArrowLeft onClick={() => navigate('/login')} className="h-5 w-5 cursor-pointer" />
          <div className="flex justify-center mb-2">
            <User className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Sistema Hospitalar</CardTitle>
          <p className="text-blue-100">Insira seu email para receber um link de recuperação de senha</p>
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
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
