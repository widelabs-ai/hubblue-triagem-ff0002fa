
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const attendanceTypes = [
  { id: 'prioritario', name: 'Prioritário', icon: '🚨', description: 'Urgências e emergências' },
  { id: 'nao-prioritario', name: 'Não Prioritário', icon: '🏥', description: 'Consultas e exames de rotina' }
];

const TotemScreen: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { generatePassword } = useHospital();
  const navigate = useNavigate();

  const handleGeneratePassword = () => {
    if (!selectedType) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione um tipo de atendimento.",
        variant: "destructive"
      });
      return;
    }

    // Now we can use the selectedType directly since it matches our specialty types
    const password = generatePassword(selectedType as 'prioritario' | 'nao-prioritario', 'Não informado');
    
    setGeneratedPassword(password);
    setShowPasswordModal(true);

    // Reset form
    setSelectedType('');

    // Auto close modal after 5 seconds
    setTimeout(() => {
      setShowPasswordModal(false);
    }, 5000);
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
              <p className="text-blue-100 mt-2">Selecione o tipo de atendimento e gere sua senha</p>
            </div>
            <div className="w-10"></div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            <div>
              <Label className="text-xl font-semibold mb-6 block text-center">Tipo de Atendimento</Label>
              <div className="grid grid-cols-1 gap-6">
                {attendanceTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    className={`h-24 text-lg ${
                      selectedType === type.id 
                        ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-700' 
                        : 'hover:bg-blue-50 border-2 border-gray-300'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-bold">{type.name}</div>
                      <div className="text-sm opacity-80 mt-1">{type.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGeneratePassword}
              className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={!selectedType}
            >
              🎫 Gerar Senha de Atendimento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-md w-full mx-4 text-center relative">
            <Button
              variant="ghost"
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="text-6xl mb-6">🎫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Senha Gerada com Sucesso!
            </h2>
            <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6 mb-6">
              <p className="text-lg text-gray-600 mb-2">Sua senha é:</p>
              <p className="text-5xl font-bold text-blue-600 tracking-wider">
                {generatedPassword}
              </p>
            </div>
            <p className="text-gray-600">
              Aguarde ser chamado para o atendimento.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              Esta janela fechará automaticamente em alguns segundos
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotemScreen;
