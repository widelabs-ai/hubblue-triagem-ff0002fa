
import React, { useState, useEffect } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Clock, User, Stethoscope, FileText, UserCheck, MapPin } from 'lucide-react';

const PanelScreen = () => {
  const { patients } = useHospital();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'vermelho':
        return 'bg-red-500';
      case 'laranja':
        return 'bg-orange-500';
      case 'amarelo':
        return 'bg-yellow-500';
      case 'verde':
        return 'bg-green-500';
      case 'azul':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLocationInfo = (serviceType: string) => {
    switch (serviceType) {
      case 'triagem':
        return { location: 'SALA 2', icon: <Stethoscope className="h-5 w-5" /> };
      case 'administrativo':
        return { location: 'MESA 1', icon: <FileText className="h-5 w-5" /> };
      case 'consulta':
        return { location: 'CONSULTÓRIO 3', icon: <UserCheck className="h-5 w-5" /> };
      default:
        return { location: '', icon: null };
    }
  };

  // Dados mockados para simular um dia típico no hospital
  const mockData = {
    triagem: {
      current: {
        password: 'PR007',
        priority: 'laranja'
      },
      recent: [
        { password: 'NP024', priority: 'verde' },
        { password: 'PR006', priority: 'vermelho' },
        { password: 'NP023', priority: 'amarelo' },
        { password: 'NP022', priority: 'verde' },
        { password: 'PR005', priority: 'laranja' }
      ]
    },
    administrativo: {
      current: {
        password: 'NP021',
        priority: 'verde'
      },
      recent: [
        { password: 'PR004', priority: 'vermelho' },
        { password: 'NP020', priority: 'azul' },
        { password: 'NP019', priority: 'verde' },
        { password: 'PR003', priority: 'amarelo' },
        { password: 'NP018', priority: 'verde' }
      ]
    },
    consulta: {
      current: {
        password: 'PR002',
        priority: 'vermelho'
      },
      recent: [
        { password: 'NP017', priority: 'verde' },
        { password: 'NP016', priority: 'azul' },
        { password: 'PR001', priority: 'laranja' },
        { password: 'NP015', priority: 'amarelo' },
        { password: 'NP014', priority: 'verde' }
      ]
    }
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    currentData: any,
    recentData: any[],
    bgColor: string,
    serviceType: string
  ) => {
    const locationInfo = getLocationInfo(serviceType);
    
    return (
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className={`text-2xl text-center text-white flex items-center justify-center ${bgColor} p-4 rounded-lg`}>
            {icon}
            <span className="ml-3">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Chamada Atual - DESTAQUE MAIOR */}
          <div>
            <h4 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
              <User className="h-6 w-6 mr-2" />
              SENDO ATENDIDA AGORA
            </h4>
            {currentData ? (
              <div className="bg-white/30 rounded-2xl p-8 border-2 border-white/50 shadow-2xl">
                {/* Senha Principal */}
                <div className="text-center mb-6">
                  <div className="text-8xl font-black text-white mb-2 tracking-wider drop-shadow-lg">
                    {currentData.password}
                  </div>
                  <Badge className="bg-green-500 text-white text-lg px-4 py-2 font-bold">
                    ATUAL
                  </Badge>
                </div>
                
                {/* Localização */}
                <div className="bg-white/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center text-white">
                    <MapPin className="h-6 w-6 mr-3" />
                    <span className="text-2xl font-bold">DIRIJA-SE À {locationInfo.location}</span>
                  </div>
                </div>

                {/* Prioridade */}
                {currentData.priority && (
                  <div className="flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full ${getPriorityColor(currentData.priority)} mr-3`}></div>
                    <span className="text-white/90 capitalize text-lg font-semibold">
                      Prioridade: {currentData.priority}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/15 rounded-xl p-8 border border-white/30 text-center">
                <p className="text-white/70 text-xl">Nenhuma senha sendo atendida</p>
              </div>
            )}
          </div>

          {/* Últimas Chamadas - MENOS DESTAQUE */}
          <div>
            <h4 className="text-lg font-semibold text-white/80 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              ÚLTIMAS CHAMADAS
            </h4>
            <div className="space-y-2">
              {recentData.length > 0 ? (
                recentData.map((item, index) => (
                  <div
                    key={`${item.password}-${index}`}
                    className="bg-white/10 rounded-lg p-3 border border-white/20 opacity-80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-white/80 mr-3">
                          {item.password}
                        </span>
                        {item.priority && (
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)} mr-2`}></div>
                        )}
                        <div className="flex items-center text-white/60 text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{locationInfo.location}</span>
                        </div>
                      </div>
                      <span className="text-white/50 text-xs">
                        {index === 0 ? 'Mais recente' : `${index + 1}ª`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/10 rounded-lg p-3 border border-white/20 text-center opacity-60">
                  <p className="text-white/60 text-sm">Nenhuma chamada realizada</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Monitor className="h-10 w-10 mr-4" />
          <h1 className="text-5xl font-bold">PAINEL DE SENHAS</h1>
        </div>
        <div className="flex items-center justify-center text-xl">
          <Clock className="h-5 w-5 mr-2" />
          <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Triagem */}
        {renderSection(
          'TRIAGEM',
          <Stethoscope className="h-6 w-6" />,
          mockData.triagem.current,
          mockData.triagem.recent,
          'bg-red-600',
          'triagem'
        )}

        {/* Administrativo */}
        {renderSection(
          'ADMINISTRATIVO',
          <FileText className="h-6 w-6" />,
          mockData.administrativo.current,
          mockData.administrativo.recent,
          'bg-purple-600',
          'administrativo'
        )}

        {/* Consulta */}
        {renderSection(
          'CONSULTA',
          <UserCheck className="h-6 w-6" />,
          mockData.consulta.current,
          mockData.consulta.recent,
          'bg-green-600',
          'consulta'
        )}
      </div>

      {/* Rodapé com informações */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-white/60">
        <p className="text-lg">
          🏥 LIA - Leitura Inteligente de Avaliação | Painel de Atendimento | Atualizado automaticamente
        </p>
      </div>
    </div>
  );
};

export default PanelScreen;
