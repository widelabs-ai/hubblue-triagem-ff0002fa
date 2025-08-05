
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

  const mockData = {
    triagem: {
      current: {
        password: 'PR007'
      },
      recent: [
        { password: 'NP024' },
        { password: 'PR006' },
        { password: 'NP023' },
        { password: 'NP022' },
        { password: 'PR005' }
      ]
    },
    administrativo: {
      current: {
        password: 'NP021'
      },
      recent: [
        { password: 'PR004' },
        { password: 'NP020' },
        { password: 'NP019' },
        { password: 'PR003' },
        { password: 'NP018' }
      ]
    },
    consulta: {
      current: {
        password: 'PR002'
      },
      recent: [
        { password: 'NP017' },
        { password: 'NP016' },
        { password: 'PR001' },
        { password: 'NP015' },
        { password: 'NP014' }
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
      <Card className="bg-white/90 border-gray-200 backdrop-blur-sm h-full shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg sm:text-xl lg:text-2xl text-center text-white flex items-center justify-center ${bgColor} p-3 lg:p-4 rounded-lg`}>
            <span className="hidden sm:inline">{icon}</span>
            <span className="ml-0 sm:ml-3 font-bold">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 lg:space-y-8 px-3 sm:px-6">
          {/* Chamada Atual - DESTAQUE MAIOR */}
          <div>
            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-700 mb-3 lg:mb-4 flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 w-5 lg:h-6 w-6 mr-2" />
              <span className="text-xs sm:text-base lg:text-xl">SENDO ATENDIDA AGORA</span>
            </h4>
            {currentData ? (
              <div className="bg-gray-50 rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-300 shadow-lg">
                {/* Senha Principal */}
                <div className="text-center mb-4 lg:mb-6">
                  <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-800 mb-2 tracking-wider drop-shadow-lg">
                    {currentData.password}
                  </div>
                  <Badge className="bg-gray-600 text-white text-sm sm:text-base lg:text-lg px-3 sm:px-4 py-1 sm:py-2 font-bold">
                    ATUAL
                  </Badge>
                </div>
                
                {/* Localização */}
                <div className="bg-gray-100 rounded-lg lg:rounded-xl p-3 lg:p-4 mb-3 lg:mb-4">
                  <div className="flex items-center justify-center text-gray-700">
                    <MapPin className="h-4 w-4 sm:h-5 w-5 lg:h-6 w-6 mr-2 lg:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-lg lg:text-2xl font-bold text-center">
                      DIRIJA-SE À {locationInfo.location}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg lg:rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-300 text-center">
                <p className="text-gray-500 text-base sm:text-lg lg:text-xl">Nenhuma senha sendo atendida</p>
              </div>
            )}
          </div>

          {/* Últimas Chamadas - MENOS DESTAQUE */}
          <div>
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-600 mb-2 lg:mb-3 flex items-center">
              <Clock className="h-3 w-3 sm:h-4 w-4 mr-2 flex-shrink-0" />
              <span>ÚLTIMAS CHAMADAS</span>
            </h4>
            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
              {recentData.length > 0 ? (
                recentData.map((item, index) => (
                  <div
                    key={`${item.password}-${index}`}
                    className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mr-2 sm:mr-3 flex-shrink-0">
                          {item.password}
                        </span>
                        <div className="flex items-center text-gray-500 text-xs min-w-0">
                          <MapPin className="h-2 w-2 sm:h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{locationInfo.location}</span>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                        {index === 0 ? 'Mais recente' : `${index + 1}ª`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 text-center">
                  <p className="text-gray-400 text-xs sm:text-sm">Nenhuma chamada realizada</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 pb-20 sm:pb-16">
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <Monitor className="h-6 w-6 sm:h-8 w-8 lg:h-10 w-10 mr-2 sm:mr-4 text-gray-700" />
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-800">PAINEL DE SENHAS</h1>
          </div>
          <div className="flex items-center justify-center text-sm sm:text-base lg:text-xl text-gray-600">
            <Clock className="h-4 w-4 sm:h-5 w-5 mr-2" />
            <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
          {/* Triagem */}
          {renderSection(
            'TRIAGEM',
            <Stethoscope className="h-5 w-5 sm:h-6 w-6" />,
            mockData.triagem.current,
            mockData.triagem.recent,
            'bg-gray-600',
            'triagem'
          )}

          {/* Administrativo */}
          {renderSection(
            'ADMINISTRATIVO',
            <FileText className="h-5 w-5 sm:h-6 w-6" />,
            mockData.administrativo.current,
            mockData.administrativo.recent,
            'bg-gray-700',
            'administrativo'
          )}

          {/* Consulta */}
          {renderSection(
            'CONSULTA',
            <UserCheck className="h-5 w-5 sm:h-6 w-6" />,
            mockData.consulta.current,
            mockData.consulta.recent,
            'bg-gray-800',
            'consulta'
          )}
        </div>
      </div>

      {/* Rodapé com informações - Fixed position melhorada */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800/80 to-transparent p-2 sm:p-4">
        <div className="text-center text-white">
          <p className="text-xs sm:text-sm lg:text-lg font-medium">
            🏥 LIA - Leitura Inteligente de Avaliação | Painel de Atendimento | Atualizado automaticamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default PanelScreen;
