
import React, { useState, useEffect } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Clock, User, Stethoscope, FileText, UserCheck } from 'lucide-react';

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

  // Separar pacientes por tipo de atendimento
  const triagePatients = {
    current: patients.find(patient => patient.status === 'in-triage'),
    recent: patients
      .filter(patient => patient.status === 'waiting-admin' && patient.timestamps.triageCompleted)
      .sort((a, b) => {
        const aTime = a.timestamps.triageCompleted?.getTime() || 0;
        const bTime = b.timestamps.triageCompleted?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 5)
  };

  const adminPatients = {
    current: patients.find(patient => patient.status === 'in-admin'),
    recent: patients
      .filter(patient => patient.status === 'waiting-doctor' && patient.timestamps.adminCompleted)
      .sort((a, b) => {
        const aTime = a.timestamps.adminCompleted?.getTime() || 0;
        const bTime = b.timestamps.adminCompleted?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 5)
  };

  const consultationPatients = {
    current: patients.find(patient => patient.status === 'in-consultation'),
    recent: patients
      .filter(patient => 
        (patient.status === 'completed' || patient.status === 'discharged' || patient.status === 'waiting-exam') && 
        patient.timestamps.consultationCompleted
      )
      .sort((a, b) => {
        const aTime = a.timestamps.consultationCompleted?.getTime() || 0;
        const bTime = b.timestamps.consultationCompleted?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 5)
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    current: any,
    recent: any[],
    bgColor: string
  ) => (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className={`text-2xl text-center text-white flex items-center justify-center ${bgColor} p-4 rounded-lg`}>
          {icon}
          <span className="ml-3">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chamada Atual */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <User className="h-5 w-5 mr-2" />
            SENDO ATENDIDA AGORA
          </h4>
          {current ? (
            <div className="bg-white/20 rounded-lg p-4 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-white">
                  {current.password}
                </span>
                <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                  ATUAL
                </Badge>
              </div>
              {current.triageData?.priority && (
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(current.triageData.priority)} mr-2`}></div>
                  <span className="text-white/80 capitalize text-sm">
                    Prioridade: {current.triageData.priority}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-4 border border-white/20 text-center">
              <p className="text-white/70">Nenhuma senha sendo atendida</p>
            </div>
          )}
        </div>

        {/* Últimas Chamadas */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            ÚLTIMAS CHAMADAS
          </h4>
          <div className="space-y-2">
            {recent.length > 0 ? (
              recent.map((patient, index) => (
                <div
                  key={patient.id}
                  className="bg-white/10 rounded-lg p-3 border border-white/20 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-white mr-3">
                      {patient.password}
                    </span>
                    {patient.triageData?.priority && (
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.triageData.priority)}`}></div>
                    )}
                  </div>
                  <span className="text-white/60 text-xs">
                    {index === 0 ? 'Mais recente' : `${index + 1}ª`}
                  </span>
                </div>
              ))
            ) : (
              <div className="bg-white/10 rounded-lg p-3 border border-white/20 text-center">
                <p className="text-white/70 text-sm">Nenhuma chamada realizada</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          triagePatients.current,
          triagePatients.recent,
          'bg-red-600'
        )}

        {/* Administrativo */}
        {renderSection(
          'ADMINISTRATIVO',
          <FileText className="h-6 w-6" />,
          adminPatients.current,
          adminPatients.recent,
          'bg-purple-600'
        )}

        {/* Consulta */}
        {renderSection(
          'CONSULTA',
          <UserCheck className="h-6 w-6" />,
          consultationPatients.current,
          consultationPatients.recent,
          'bg-green-600'
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
