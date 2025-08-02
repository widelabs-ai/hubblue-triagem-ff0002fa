
import React, { useState, useEffect } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Clock, User } from 'lucide-react';

const PanelScreen = () => {
  const { patients } = useHospital();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Pacientes atualmente sendo atendidos
  const currentlyBeingServed = patients.filter(patient => 
    patient.status === 'in-triage' || 
    patient.status === 'in-admin' || 
    patient.status === 'in-consultation'
  );

  // Pacientes recentemente chamados (últimos 10 completados)
  const recentlyCompleted = patients
    .filter(patient => patient.status === 'completed')
    .sort((a, b) => {
      const aTime = a.timestamps.consultationCompleted?.getTime() || 0;
      const bTime = b.timestamps.consultationCompleted?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'in-triage':
        return { label: 'TRIAGEM', color: 'bg-red-500' };
      case 'in-admin':
        return { label: 'ADMINISTRATIVO', color: 'bg-purple-500' };
      case 'in-consultation':
        return { label: 'CONSULTA', color: 'bg-green-500' };
      default:
        return { label: 'ATENDIMENTO', color: 'bg-blue-500' };
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Monitor className="h-12 w-12 mr-4" />
          <h1 className="text-6xl font-bold">PAINEL DE SENHAS</h1>
        </div>
        <div className="flex items-center justify-center text-2xl">
          <Clock className="h-6 w-6 mr-2" />
          <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Senhas Sendo Atendidas */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-white flex items-center justify-center">
              <User className="h-8 w-8 mr-3" />
              SENDO ATENDIDAS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentlyBeingServed.length > 0 ? (
              currentlyBeingServed.map((patient) => {
                const statusInfo = getStatusDisplay(patient.status);
                return (
                  <div
                    key={patient.id}
                    className="bg-white/20 rounded-lg p-6 border border-white/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl font-bold text-white">
                        {patient.password}
                      </span>
                      <Badge className={`${statusInfo.color} text-white text-lg px-4 py-2`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    {patient.triageData?.priority && (
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(patient.triageData.priority)} mr-2`}></div>
                        <span className="text-white/80 capitalize">
                          Prioridade: {patient.triageData.priority}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl text-white/70">
                  Nenhuma senha sendo atendida no momento
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Senhas Recentemente Chamadas */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-white flex items-center justify-center">
              <Clock className="h-8 w-8 mr-3" />
              ATENDIDAS RECENTEMENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.triageData.priority)}`}></div>
                    )}
                  </div>
                  <span className="text-white/60 text-sm">
                    {patient.timestamps.consultationCompleted?.toLocaleTimeString('pt-BR')}
                  </span>
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

      {/* Rodapé com informações */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-white/60">
        <p className="text-lg">
          🏥 Sistema Hospitalar - Painel de Atendimento | Atualizado automaticamente
        </p>
      </div>
    </div>
  );
};

export default PanelScreen;
