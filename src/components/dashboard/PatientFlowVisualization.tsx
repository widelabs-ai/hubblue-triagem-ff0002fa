
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';
import { Progress } from '@/components/ui/progress';

const PatientFlowVisualization: React.FC = () => {
  const { patients, getPatientsByStatus, getTimeElapsed } = useHospital();

  const flowStages = [
    { status: 'waiting-triage', label: 'Aguardando Triagem', color: 'bg-yellow-100', icon: '🏥' },
    { status: 'in-triage', label: 'Em Triagem', color: 'bg-orange-100', icon: '🩺' },
    { status: 'waiting-admin', label: 'Aguard. Recepção', color: 'bg-purple-100', icon: '📋' },
    { status: 'in-admin', label: 'Atend. Recepção', color: 'bg-indigo-100', icon: '📝' },
    { status: 'waiting-doctor', label: 'Aguardando Médico', color: 'bg-blue-100', icon: '⏳' },
    { status: 'in-consultation', label: 'Em Atendimento', color: 'bg-teal-100', icon: '👨‍⚕️' },
  ] as const;

  const additionalStages = [
    { status: 'waiting-exam', label: 'Aguardando Exame', color: 'bg-cyan-100', icon: '🔬' },
    { status: 'in-exam', label: 'Em Exame', color: 'bg-sky-100', icon: '🧪' },
    { status: 'waiting-medication', label: 'Aguardando Medicação', color: 'bg-pink-100', icon: '💊' },
    { status: 'in-medication', label: 'Em Medicação', color: 'bg-rose-100', icon: '💉' },
    { status: 'waiting-hospitalization', label: 'Aguard. Repouso no Leito', color: 'bg-red-100', icon: '🛏️' },
    { status: 'in-hospitalization', label: 'Internado', color: 'bg-amber-100', icon: '🏥' },
  ] as const;

  const finalStages = [
    { status: 'prescription-issued', label: 'Prescrição Emitida', color: 'bg-violet-100', icon: '📄' },
    { status: 'discharged', label: 'Alta Hospitalar', color: 'bg-green-100', icon: '✅' },
    { status: 'transferred', label: 'Transferido', color: 'bg-blue-100', icon: '↗️' },
    { status: 'deceased', label: 'Óbito', color: 'bg-gray-100', icon: '💔' },
  ] as const;

  const activePatients = patients.filter(p => !['completed', 'cancelled', 'discharged', 'deceased', 'transferred'].includes(p.status));
  const totalPatients = patients.length;

  const calculateStageProgress = () => {
    if (totalPatients === 0) return 0;
    const processedPatients = patients.filter(p => ['discharged', 'transferred', 'completed'].includes(p.status)).length;
    return (processedPatients / totalPatients) * 100;
  };

  const getAverageTimeInStage = (status: string) => {
    const patientsInStage = getPatientsByStatus(status as any);
    if (patientsInStage.length === 0) return 0;
    
    const totalTime = patientsInStage.reduce((acc, patient) => {
      return acc + getTimeElapsed(patient, 'generated');
    }, 0);
    
    return Math.round(totalTime / patientsInStage.length);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            Visualização do Fluxo de Pacientes
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total de Pacientes: {totalPatients}</span>
            <span>Ativos: {activePatients.length}</span>
            <span>Taxa de Conclusão: {Math.round(calculateStageProgress())}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progresso Geral</span>
              <span>{Math.round(calculateStageProgress())}%</span>
            </div>
            <Progress value={calculateStageProgress()} className="h-2" />
          </div>

          {/* Fluxo Principal */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800">🏥 Fluxo Principal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flowStages.map((stage) => {
                const count = getPatientsByStatus(stage.status).length;
                const avgTime = getAverageTimeInStage(stage.status);
                return (
                  <Card key={stage.status} className={`${stage.color} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{stage.icon}</span>
                        <span className="text-2xl font-bold">{count}</span>
                      </div>
                      <div className="text-sm font-medium">{stage.label}</div>
                      {count > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Tempo médio: {avgTime} min
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Procedimentos Adicionais */}
          {additionalStages.some(stage => getPatientsByStatus(stage.status).length > 0) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-800">🔬 Procedimentos Adicionais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {additionalStages.filter(stage => getPatientsByStatus(stage.status).length > 0).map((stage) => {
                  const count = getPatientsByStatus(stage.status).length;
                  const avgTime = getAverageTimeInStage(stage.status);
                  return (
                    <Card key={stage.status} className={`${stage.color} border`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{stage.icon}</span>
                          <span className="text-xl font-bold">{count}</span>
                        </div>
                        <div className="text-xs font-medium">{stage.label}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Tempo médio: {avgTime} min
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Desfechos Finais */}
          {finalStages.some(stage => getPatientsByStatus(stage.status).length > 0) && (
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800">📊 Desfechos Finais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {finalStages.filter(stage => getPatientsByStatus(stage.status).length > 0).map((stage) => {
                  const count = getPatientsByStatus(stage.status).length;
                  return (
                    <Card key={stage.status} className={`${stage.color} border`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{stage.icon}</span>
                          <span className="text-xl font-bold">{count}</span>
                        </div>
                        <div className="text-xs font-medium">{stage.label}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {Math.round((count / totalPatients) * 100)}% do total
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientFlowVisualization;
