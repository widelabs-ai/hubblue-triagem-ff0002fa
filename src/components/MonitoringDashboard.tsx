
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useHospital } from '@/contexts/HospitalContext';
import KPICards from './dashboard/KPICards';
import PatientList from './dashboard/PatientList';
import ChartSection from './dashboard/ChartSection';
import HospitalFlowIndicators from './dashboard/HospitalFlowIndicators';
import InsightsSection from './dashboard/InsightsSection';
import FloatingChatAgent from './dashboard/FloatingChatAgent';

const MonitoringDashboard: React.FC = () => {
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [showSlaViolationsModal, setShowSlaViolationsModal] = useState(false);

  const slaViolations = patients.filter(patient => {
    const sla = isOverSLA(patient);
    return sla.triageSLA || sla.totalSLA;
  });

  const handleSlaViolationsClick = () => {
    setShowSlaViolationsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-2xl">🏥 Painel de Monitoramento do Pronto Socorro em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Indicadores do Fluxo Completo */}
            <HospitalFlowIndicators />
            
            {/* KPIs Principais */}
            <KPICards 
              slaViolations={slaViolations.length}
              onSlaViolationsClick={handleSlaViolationsClick}
            />
            
            {/* Nova Seção de Insights */}
            <InsightsSection />
            
            {/* Seção de Gráficos */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Análises Visuais</h3>
              <ChartSection />
            </div>
            
            {/* Lista de Pacientes */}
            <PatientList 
              patients={patients}
              getTimeElapsed={getTimeElapsed}
              isOverSLA={isOverSLA}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal para exibir violações de SLA */}
      <Dialog open={showSlaViolationsModal} onOpenChange={setShowSlaViolationsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🚨</span>
              Violações de SLA
              <Badge variant="destructive">{slaViolations.length} pacientes</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {slaViolations.map((patient) => {
              const sla = isOverSLA(patient);
              const timeElapsed = getTimeElapsed(patient, 'generated');
              const triageTime = getTimeElapsed(patient, 'generated', patient.timestamps.triageCompleted ? 'triageCompleted' : undefined);
              
              return (
                <div 
                  key={patient.id} 
                  className="p-4 rounded-lg border bg-red-50 border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={patient.specialty === 'prioritario' ? 'destructive' : 'secondary'}>
                        {patient.password}
                      </Badge>
                      <span className="font-medium">
                        {patient.personalData?.fullName || patient.personalData?.name || 'Nome não informado'}
                      </span>
                      <span className="text-red-500 animate-pulse">🚨</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {timeElapsed} min no hospital
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <div>Telefone: {patient.phone}</div>
                    <div>Status atual: {
                      patient.status === 'waiting-triage' ? 'Aguardando Triagem' :
                      patient.status === 'in-triage' ? 'Em Triagem' :
                      patient.status === 'waiting-admin' ? 'Aguardando Recepção' :
                      patient.status === 'in-admin' ? 'Em Atendimento Recepção' :
                      patient.status === 'waiting-doctor' ? 'Aguardando Médico' :
                      patient.status === 'in-consultation' ? 'Em Consulta' :
                      patient.status === 'waiting-exam' ? 'Aguardando Exame' :
                      patient.status === 'in-exam' ? 'Em Exame' :
                      patient.status === 'waiting-medication' ? 'Aguardando Medicação' :
                      patient.status === 'in-medication' ? 'Em Medicação' :
                      patient.status === 'waiting-hospitalization' ? 'Aguardando Internação' :
                      patient.status === 'in-hospitalization' ? 'Internado' :
                      patient.status === 'waiting-transfer' ? 'Aguardando Transferência' :
                      patient.status
                    }</div>
                    <div>Especialidade: {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não Prioritário'}</div>
                    {patient.medicalSpecialty && (
                      <div>Área Médica: {
                        patient.medicalSpecialty === 'clinica-medica' ? 'Clínica Médica' :
                        patient.medicalSpecialty === 'cirurgia-geral' ? 'Cirurgia Geral' :
                        patient.medicalSpecialty === 'ortopedia' ? 'Ortopedia' :
                        patient.medicalSpecialty === 'pediatria' ? 'Pediatria' : patient.medicalSpecialty
                      }</div>
                    )}
                    {patient.triageData?.priority && (
                      <div>Classificação: 
                        <Badge 
                          variant="outline" 
                          className={`ml-1 ${
                            patient.triageData.priority === 'vermelho' ? 'bg-red-100 text-red-800' :
                            patient.triageData.priority === 'laranja' ? 'bg-orange-100 text-orange-800' :
                            patient.triageData.priority === 'amarelo' ? 'bg-yellow-100 text-yellow-800' :
                            patient.triageData.priority === 'verde' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {patient.triageData.priority.charAt(0).toUpperCase() + patient.triageData.priority.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {sla.triageSLA && (
                      <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                        ⚠️ Violação SLA Triagem: {triageTime} min (meta: 10 min)
                      </div>
                    )}
                    {sla.totalSLA && (
                      <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                        ⚠️ Violação SLA Total: {timeElapsed} min (meta: 240 min)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {slaViolations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">✅</span>
                Nenhuma violação de SLA no momento
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Agente Conversacional Suspenso */}
      <FloatingChatAgent />
    </div>
  );
};

export default MonitoringDashboard;
