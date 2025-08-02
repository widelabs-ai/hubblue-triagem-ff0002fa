
import React, { useState, useEffect } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PanelScreen = () => {
  const { patients, getPatientsByStatus } = useHospital();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get patients currently being attended
  const currentPatients = [
    ...getPatientsByStatus('in-triage'),
    ...getPatientsByStatus('in-admin'),
    ...getPatientsByStatus('in-consultation')
  ];

  // Get recently called patients (completed or in process)
  const recentlyCalledPatients = patients
    .filter(patient => 
      patient.status === 'completed' || 
      patient.status === 'in-consultation' ||
      patient.status === 'in-admin' ||
      patient.status === 'in-triage'
    )
    .sort((a, b) => {
      const aTime = a.timestamps.triageStarted || a.timestamps.adminStarted || a.timestamps.consultationStarted;
      const bTime = b.timestamps.triageStarted || b.timestamps.adminStarted || b.timestamps.consultationStarted;
      if (!aTime) return 1;
      if (!bTime) return -1;
      return bTime.getTime() - aTime.getTime();
    })
    .slice(0, 10); // Show last 10 called passwords

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'in-triage':
        return { text: 'TRIAGEM', color: 'bg-blue-500' };
      case 'in-admin':
        return { text: 'ADMINISTRATIVO', color: 'bg-yellow-500' };
      case 'in-consultation':
        return { text: 'CONSULTA MÉDICA', color: 'bg-green-500' };
      case 'completed':
        return { text: 'ATENDIDO', color: 'bg-gray-500' };
      default:
        return { text: status.toUpperCase(), color: 'bg-gray-400' };
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'azul': return 'text-blue-600 border-blue-600';
      case 'verde': return 'text-green-600 border-green-600';
      case 'amarelo': return 'text-yellow-600 border-yellow-600';
      case 'laranja': return 'text-orange-600 border-orange-600';
      case 'vermelho': return 'text-red-600 border-red-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            PAINEL DE SENHAS
          </h1>
          <div className="text-2xl text-blue-100">
            {currentTime.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} - {currentTime.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Current Patients Being Called */}
          <Card className="bg-white/95 shadow-2xl">
            <CardHeader className="bg-green-600 text-white">
              <CardTitle className="text-3xl text-center font-bold">
                SENHAS SENDO CHAMADAS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {currentPatients.length > 0 ? (
                <div className="space-y-6">
                  {currentPatients.map((patient) => {
                    const statusInfo = getStatusDisplay(patient.status);
                    return (
                      <div key={patient.id} className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border-l-8 border-green-500">
                        <div className="flex items-center space-x-6">
                          <div className="text-6xl font-bold text-gray-800">
                            {patient.password}
                          </div>
                          {patient.triageData?.priority && (
                            <Badge className={`text-lg px-4 py-2 border-2 ${getPriorityColor(patient.triageData.priority)} bg-white`}>
                              {patient.triageData.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={`${statusInfo.color} text-white text-xl px-4 py-2`}>
                            {statusInfo.text}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl text-gray-500 font-medium">
                    Nenhuma senha sendo chamada no momento
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Called Patients */}
          <Card className="bg-white/95 shadow-2xl">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-3xl text-center font-bold">
                ÚLTIMAS SENHAS CHAMADAS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {recentlyCalledPatients.length > 0 ? (
                <div className="space-y-4">
                  {recentlyCalledPatients.map((patient, index) => {
                    const statusInfo = getStatusDisplay(patient.status);
                    const callTime = patient.timestamps.triageStarted || 
                                   patient.timestamps.adminStarted || 
                                   patient.timestamps.consultationStarted;
                    
                    return (
                      <div key={patient.id} className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl font-bold text-gray-800">
                            {patient.password}
                          </div>
                          {patient.triageData?.priority && (
                            <Badge className={`text-sm px-2 py-1 border ${getPriorityColor(patient.triageData.priority)} bg-white`}>
                              {patient.triageData.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
                            {statusInfo.text}
                          </Badge>
                          {callTime && (
                            <div className="text-sm text-gray-600 mt-1">
                              {callTime.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-2xl text-gray-500 font-medium">
                    Nenhuma senha foi chamada ainda
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="text-xl text-blue-100">
            Sistema de Gestão Hospitalar - Painel de Monitoramento
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelScreen;
