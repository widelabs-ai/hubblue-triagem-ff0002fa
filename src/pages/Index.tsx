
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HospitalProvider } from '@/contexts/HospitalContext';

const Index = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'totem',
      title: '🎫 Totem de Senhas',
      description: 'Geração de senhas por especialidade',
      color: 'from-blue-600 to-green-600',
      route: '/totem'
    },
    {
      id: 'triagem',
      title: '🩺 Triagem',
      description: 'Sistema de triagem de enfermagem',
      color: 'from-green-600 to-blue-600',
      route: '/triagem'
    },
    {
      id: 'administrativo',
      title: '📋 Administrativo',
      description: 'Coleta de dados pessoais',
      color: 'from-blue-600 to-purple-600',
      route: '/administrativo'
    },
    {
      id: 'medico',
      title: '👨‍⚕️ Atendimento Médico',
      description: 'Consultas médicas',
      color: 'from-green-600 to-teal-600',
      route: '/medico'
    },
    {
      id: 'monitoramento',
      title: '📊 Monitoramento',
      description: 'Dashboard de acompanhamento',
      color: 'from-purple-600 to-pink-600',
      route: '/monitoramento'
    }
  ];

  return (
    <HospitalProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-white shadow-lg border-b-4 border-blue-600">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🏥 Sistema de Gestão Hospitalar
              </h1>
              <p className="text-xl text-gray-600">
                Gerenciamento completo de filas e atendimentos
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => (
              <Card 
                key={module.id} 
                className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 overflow-hidden"
                onClick={() => navigate(module.route)}
              >
                <CardHeader className={`bg-gradient-to-r ${module.color} text-white pb-6`}>
                  <CardTitle className="text-2xl font-bold text-center">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <p className="text-gray-600 text-center text-lg mb-6">
                    {module.description}
                  </p>
                  <Button 
                    className="w-full h-12 text-lg font-semibold bg-gray-800 hover:bg-gray-900 transition-colors"
                  >
                    Acessar Módulo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                <CardTitle className="text-2xl text-center">
                  ⚡ Funcionalidades Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-3">⏱️</div>
                    <h3 className="font-bold text-lg mb-2">Controle de Tempo</h3>
                    <p className="text-gray-600">Monitoramento em tempo real com SLA de atendimento</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">🚨</div>
                    <h3 className="font-bold text-lg mb-2">Alertas de SLA</h3>
                    <p className="text-gray-600">Notificações quando os tempos limites são ultrapassados</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">📱</div>
                    <h3 className="font-bold text-lg mb-2">Interface Responsiva</h3>
                    <p className="text-gray-600">Funciona perfeitamente em qualquer dispositivo</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">🔄</div>
                    <h3 className="font-bold text-lg mb-2">Fluxo Completo</h3>
                    <p className="text-gray-600">Da geração da senha até a consulta médica</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SLA Information */}
          <div className="mt-12">
            <Card className="shadow-xl border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                <CardTitle className="text-xl text-center">
                  📋 Metas de Atendimento (SLA)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">🎯 Triagem</h4>
                    <p className="text-green-700">
                      Máximo de <strong>10 minutos</strong> da geração da senha até conclusão da triagem
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">🏁 Atendimento Completo</h4>
                    <p className="text-blue-700">
                      Máximo de <strong>1h50 (110 minutos)</strong> para concluir todo o atendimento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HospitalProvider>
  );
};

export default Index;
