
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const specialties = [
  { id: 'ortopedia', name: 'Ortopedia', icon: '🦴' },
  { id: 'cirurgia-geral', name: 'Cirurgia Geral', icon: '⚕️' },
  { id: 'clinica-medica', name: 'Clínica Médica', icon: '🩺' },
  { id: 'pediatria', name: 'Pediatria', icon: '👶' }
];

const TotemScreen: React.FC = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [phone, setPhone] = useState('');
  const { generatePassword } = useHospital();
  const navigate = useNavigate();

  const handleGeneratePassword = () => {
    if (!selectedSpecialty) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione uma especialidade.",
        variant: "destructive"
      });
      return;
    }

    const password = generatePassword(selectedSpecialty as any, phone || 'Não informado');
    
    toast({
      title: "Senha gerada com sucesso!",
      description: `Sua senha é: ${password}. Aguarde ser chamado para a triagem.`,
    });

    // Reset form
    setSelectedSpecialty('');
    setPhone('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">🏥 Totem de Atendimento</CardTitle>
              <p className="text-blue-100 mt-2">Selecione a especialidade e gere sua senha</p>
            </div>
            <div className="w-10"></div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Especialidade Médica</Label>
              <div className="grid grid-cols-2 gap-4">
                {specialties.map((specialty) => (
                  <Button
                    key={specialty.id}
                    variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                    className={`h-20 text-lg ${
                      selectedSpecialty === specialty.id 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedSpecialty(specialty.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{specialty.icon}</div>
                      <div>{specialty.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-lg font-semibold">
                Número de Celular (Opcional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-12 text-lg"
                maxLength={15}
              />
              <p className="text-sm text-gray-600 mt-1">
                Recomendado para comunicação sobre seu atendimento
              </p>
            </div>

            <Button
              onClick={handleGeneratePassword}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={!selectedSpecialty}
            >
              🎫 Gerar Senha de Atendimento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TotemScreen;
