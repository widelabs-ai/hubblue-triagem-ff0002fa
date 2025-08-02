
import React, { useState, useEffect } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Clock } from 'lucide-react';

const PanelScreen = () => {
  const { patients, getPatientsByStatus } = useHospital();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Pacientes atualmente sendo atendidos
  const currentPatients = [
    ...getPatientsByStatus('in-triage'),
    ...getPatientsByStatus('in-admin'),
    ...getPatientsByStatus('in-consultation')
  ];

  // Últimas senhas chamadas (completadas recentemente)
  const recentlyCompleted = patients
    .filter(p => p.status === 'completed')
    .sort((a, b) => {
      const aTime = a.timestamps.consultationCompleted || a.timestamps.triageCompleted || a.timestamps.generated;
      const bTime = b.timestamps.consultationCompleted || b.timestamps.triageCompleted || b.timestamps.generated;
      return bTime.getTime() - aTime.getTime();
    })
    .slice(0, 10);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-triage': return 'TRIAGEM';
      case 'in-admin': return 'ADMINISTRATIVO';
      case 'in-consultation': return 'CONSULTA MÉDICA';
      default: return 'ATENDIMENTO';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-triage': return 'bg-red-500';
      case 'in-admin': return 'bg-purple-500';
      case 'in-consultation': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'azul': return 'bg-blue-500';
      case 'verde': return 'bg-green-500';
      case 'amarelo': return 'bg-yellow-500';
      case 'laranja': return 'bg-orange-500';
      case 'vermelho': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Monitor className="h-12 w-12 text-blue-300" />
          <h1 className="text-6xl font-bold text-white">🏥 PAINEL DE SENHAS</h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-300">
            {currentTime.toLocaleTimeString('pt-BR')}
          </div>
          <div className="text-xl text-blue-200">
            {currentTime.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
        {/* Senhas Sendo Atendidas */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
          <CardHeader className="bg-green-600/20 border-b border-white/20">
            <CardTitle className="text-4xl font-bold text-center text-white flex items-center justify-center space-x-3">
              <Clock className="h-10 w-10" />
              <span>SENDO ATENDIDAS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-full overflow-y-auto">
            {currentPatients.length === 0 ? (
              <div className="flex items-center justify-center h-full text-3xl text-white/70">
                Nenhuma senha sendo atendida
              </div>
            ) : (
              <div className="space-y-6">
                {currentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white/20 rounded-xl p-6 border border-white/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-6xl font-bold text-white">
                        {patient.password}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          className={`${getStatusColor(patient.status)} text-white text-lg px-4 py-2`}
                        >
                          {getStatusText(patient.status)}
                        </Badge>
                        {patient.triageData?.priority && (
                          <Badge 
                            className={`${getPriorityColor(patient.triageData.priority)} text-white text-sm px-3 py-1`}
                          >
                            {patient.triageData.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xl text-white/80">
                      Tipo: {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimas Senhas Chamadas */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
          <CardHeader className="bg-blue-600/20 border-b border-white/20">
            <CardTitle className="text-4xl font-bold text-center text-white">
              ÚLTIMAS CHAMADAS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-full overflow-y-auto">
            {recentlyCompleted.length === 0 ? (
              <div className="flex items-center justify-center h-full text-3xl text-white/70">
                Nenhuma senha atendida ainda
              </div>
            ) : (
              <div className="space-y-4">
                {recentlyCompleted.map((patient, index) => (
                  <div
                    key={patient.id}
                    className={`bg-white/15 rounded-lg p-4 border border-white/20 ${
                      index === 0 ? 'ring-2 ring-yellow-400 bg-yellow-400/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-4xl font-bold text-white">
                        {patient.password}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                          ATENDIDA
                        </Badge>
                        {patient.triageData?.priority && (
                          <Badge 
                            className={`${getPriorityColor(patient.triageData.priority)} text-white text-xs px-2 py-1`}
                          >
                            {patient.triageData.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-white/70 mt-2">
                      {patient.timestamps.consultationCompleted?.toLocaleTimeString('pt-BR') ||
                       patient.timestamps.triageCompleted?.toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PanelScreen;
