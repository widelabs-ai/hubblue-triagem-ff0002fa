
import React, { useState, useEffect } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Clock, User, Stethoscope, UserCheck, FileText } from 'lucide-react';

const PanelScreen = () => {
  const { patients } = useHospital();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Pacientes sendo atendidos em cada estação
  const currentlyInTriage = patients.filter(patient => patient.status === 'in-triage');
  const currentlyInAdmin = patients.filter(patient => patient.status === 'in-admin');
  const currentlyInConsultation = patients.filter(patient => patient.status === 'in-consultation');

  // Pacientes recentemente atendidos (últimos 15)
  const recentlyCompleted = patients
    .filter(patient => patient.status === 'completed')
    .sort((a, b) => {
      const aTime = a.timestamps.consultationCompleted?.getTime() || 0;
      const bTime = b.timestamps.consultationCompleted?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 15);

  const getStationDisplay = (station: string) => {
    switch (station) {
      case 'triage':
        return { 
          label: 'TRIAGEM', 
          color: 'bg-red-500', 
          icon: <Stethoscope className="h-6 w-6" /> 
        };
      case 'admin':
        return { 
          label: 'ADMINISTRATIVO', 
          color: 'bg-purple-500', 
          icon: <FileText className="h-6 w-6" /> 
        };
      case 'consultation':
        return { 
          label: 'CONSULTA', 
          color: 'bg-green-500', 
          icon: <UserCheck className="h-6 w-6" /> 
        };
      default:
        return { 
          label: 'ATENDIMENTO', 
          color: 'bg-blue-500', 
          icon: <User className="h-6 w-6" /> 
        };
    }
  };

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

  const StationCard = ({ station, patients, stationInfo }: { 
    station: string, 
    patients: any[], 
    stationInfo: { label: string, color: string, icon: React.ReactNode } 
  }) => (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl text-center text-white flex items-center justify-center">
          {stationInfo.icon}
          <span className="ml-2">{stationInfo.label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white/20 rounded-lg p-4 border border-white/30 mb-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-white">
                  {patient.password}
                </span>
                <Badge className={`${stationInfo.color} text-white text-sm px-3 py-1`}>
                  CHAMADO AGORA
                </Badge>
              </div>
              {patient.triageData?.priority && (
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.triageData.priority)} mr-2`}></div>
                  <span className="text-white/80 capitalize text-sm">
                    Classificação: {patient.triageData.priority}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-lg text-white/70">
              Nenhuma senha sendo atendida
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Monitor className="h-10 w-10 mr-4" />
          <h1 className="text-5xl font-bold">PAINEL DE SENHAS</h1>
        </div>
        <div className="flex items-center justify-center text-xl">
          <Clock className="h-5 w-5 mr-2" />
          <span>{currentTime.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Coluna Esquerda - Senhas Sendo Atendidas */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-6 text-white">
            🔴 SENHAS SENDO CHAMADAS
          </h2>
          
          <StationCard 
            station="triage" 
            patients={currentlyInTriage} 
            stationInfo={getStationDisplay('triage')} 
          />
          
          <StationCard 
            station="admin" 
            patients={currentlyInAdmin} 
            stationInfo={getStationDisplay('admin')} 
          />
          
          <StationCard 
            station="consultation" 
            patients={currentlyInConsultation} 
            stationInfo={getStationDisplay('consultation')} 
          />
        </div>

        {/* Coluna Direita - Senhas Recentemente Atendidas */}
        <div>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-white flex items-center justify-center">
                <Clock className="h-8 w-8 mr-3" />
                ATENDIMENTOS CONCLUÍDOS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {recentlyCompleted.length > 0 ? (
                recentlyCompleted.map((patient, index) => (
                  <div
                    key={patient.id}
                    className="bg-white/10 rounded-lg p-4 border border-white/20 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-white mr-4">
                        {patient.password}
                      </span>
                      {patient.triageData?.priority && (
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.triageData.priority)} mr-2`}></div>
                          <span className="text-white/60 text-sm capitalize">
                            {patient.triageData.priority}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-sm">
                        {patient.timestamps.consultationCompleted?.toLocaleTimeString('pt-BR')}
                      </div>
                      <Badge className="bg-green-600 text-white text-xs mt-1">
                        CONCLUÍDO
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl text-white/70">
                    Nenhum atendimento concluído ainda
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rodapé com informações */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-white/60">
        <p className="text-lg">
          🏥 Sistema Hospitalar - Painel de Atendimento | Atualizado automaticamente a cada segundo
        </p>
      </div>
    </div>
  );
};

export default PanelScreen;
