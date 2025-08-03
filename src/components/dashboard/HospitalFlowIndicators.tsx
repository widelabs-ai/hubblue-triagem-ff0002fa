import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { getPatientName } from '@/utils/patientUtils';

const HospitalFlowIndicators: React.FC = () => {
  const { getPatientFlowStats, getPatientsByStatus, patients, getTimeElapsed, isOverSLA } = useHospital();
  const flowStats = getPatientFlowStats();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const indicators = [
    { key: 'waitingTriage', label: 'Aguard. Triagem', icon: '🏥', color: 'bg-yellow-50 border-yellow-200 text-yellow-600', slaMinutes: 10 },
    { key: 'inTriage', label: 'Em Triagem', icon: '🩺', color: 'bg-orange-50 border-orange-200 text-orange-600', slaMinutes: 15 },
    { key: 'waitingAdmin', label: 'Aguard. Admin', icon: '📋', color: 'bg-purple-50 border-purple-200 text-purple-600', slaMinutes: 15 },
    { key: 'inAdmin', label: 'Em Admin', icon: '📝', color: 'bg-indigo-50 border-indigo-200 text-indigo-600', slaMinutes: 20 },
    { key: 'waitingDoctor', label: 'Aguard. Médico', icon: '⏳', color: 'bg-blue-50 border-blue-200 text-blue-600', slaMinutes: 30 },
    { key: 'inConsultation', label: 'Em Consulta', icon: '👨‍⚕️', color: 'bg-teal-50 border-teal-200 text-teal-600', slaMinutes: 45 },
    { key: 'waitingExam', label: 'Aguard. Exame', icon: '🔬', color: 'bg-cyan-50 border-cyan-200 text-cyan-600', slaMinutes: 60 },
    { key: 'inExam', label: 'Em Exame', icon: '🧪', color: 'bg-sky-50 border-sky-200 text-sky-600', slaMinutes: 30 },
    { key: 'waitingMedication', label: 'Aguard. Medicação', icon: '💊', color: 'bg-pink-50 border-pink-200 text-pink-600', slaMinutes: 20 },
    { key: 'inMedication', label: 'Em Medicação', icon: '💉', color: 'bg-rose-50 border-rose-200 text-rose-600', slaMinutes: 15 },
    { key: 'waitingHospitalization', label: 'Aguard. Internação', icon: '🏥', color: 'bg-red-50 border-red-200 text-red-600', slaMinutes: 120 },
    { key: 'inHospitalization', label: 'Em Internação', icon: '🛏️', color: 'bg-amber-50 border-amber-200 text-amber-600', slaMinutes: 1440 },
    { key: 'waitingInterConsultation', label: 'Aguard. Inter-consulta', icon: '🔄', color: 'bg-lime-50 border-lime-200 text-lime-600', slaMinutes: 90 },
    { key: 'inInterConsultation', label: 'Em Inter-consulta', icon: '🤝', color: 'bg-green-50 border-green-200 text-green-600', slaMinutes: 60 },
    { key: 'waitingTransfer', label: 'Aguard. Transfer.', icon: '🚑', color: 'bg-emerald-50 border-emerald-200 text-emerald-600', slaMinutes: 30 },
    { key: 'readyForReassessment', label: 'Prontos p/ Reavaliação', icon: '🔄', color: 'bg-violet-50 border-violet-200 text-violet-600', slaMinutes: 60 },
    { key: 'prescriptionIssued', label: 'Prescrição Emitida', icon: '📄', color: 'bg-slate-50 border-slate-200 text-slate-600', slaMinutes: 0 },
  ];

  const finalOutcomes = [
    { key: 'discharged', label: 'Alta', icon: '✅', color: 'bg-green-50 border-green-200 text-green-600' },
    { key: 'transferred', label: 'Transferido', icon: '↗️', color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { key: 'deceased', label: 'Óbito', icon: '💔', color: 'bg-gray-50 border-gray-200 text-gray-600' },
    { key: 'completed', label: 'Concluído', icon: '🏁', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  ];

  const checkSLAViolations = (statusKey: string, slaMinutes: number) => {
    if (statusKey === 'readyForReassessment') {
      const readyPatients = getReadyForReassessmentPatients();
      return readyPatients.some(patient => {
        const timeElapsed = getTimeElapsed(patient, 'generated');
        return timeElapsed > slaMinutes;
      });
    }
    
    const patientsInStatus = getPatientsByStatus(statusKey as any);
    return patientsInStatus.some(patient => {
      const timeElapsed = getTimeElapsed(patient, 'generated');
      return timeElapsed > slaMinutes;
    });
  };

  const getReadyForReassessmentPatients = () => {
    return patients.filter(p => {
      return p.timestamps.examCompleted || 
             p.timestamps.medicationCompleted || 
             p.timestamps.interConsultationCompleted;
    });
  };

  const getPatientsInStage = (statusKey: string) => {
    if (statusKey === 'readyForReassessment') {
      return getReadyForReassessmentPatients();
    }
    return getPatientsByStatus(statusKey as any);
  };

  const getPatientTimeInStage = (patient: any) => {
    return getTimeElapsed(patient, 'generated');
  };

  const getIndicatorCount = (key: string) => {
    if (key === 'readyForReassessment') {
      return flowStats.byStatus.readyForReassessment;
    }
    return flowStats.byStatus[key as keyof typeof flowStats.byStatus] || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          🏥 Fluxo de Pacientes - Indicadores em Tempo Real
        </h3>
        
        {/* Indicadores do Fluxo */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
          {indicators.map(indicator => {
            const count = getIndicatorCount(indicator.key);
            const hasSLAViolation = checkSLAViolations(indicator.key, indicator.slaMinutes);
            
            return (
              <Dialog key={indicator.key}>
                <DialogTrigger asChild>
                  <Card 
                    className={`${indicator.color} cursor-pointer hover:shadow-md transition-shadow ${
                      hasSLAViolation ? 'ring-2 ring-red-500 animate-pulse' : ''
                    }`}
                  >
                    <CardContent className="p-3 text-center relative">
                      {hasSLAViolation && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <div className="text-lg mb-1">{indicator.icon}</div>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs leading-tight">{indicator.label}</div>
                      {hasSLAViolation && (
                        <div className="text-xs text-red-600 font-bold mt-1">⚠️ SLA</div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-2xl">{indicator.icon}</span>
                      {indicator.label} - {count} paciente(s)
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {count > 0 ? (
                      <div className="grid gap-3">
                        {getPatientsInStage(indicator.key).map((patient: any) => {
                          const timeElapsed = getPatientTimeInStage(patient);
                          const isOverSLA = timeElapsed > indicator.slaMinutes;
                          
                          return (
                            <Card key={patient.id} className={`${isOverSLA ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-lg">{patient.password}</div>
                                    <div className="text-sm text-gray-600">
                                      {getPatientName(patient)}
                                    </div>
                                    <div className="text-sm">
                                      {patient.triageData?.priority && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          patient.triageData.priority === 'vermelho' ? 'bg-red-100 text-red-800' :
                                          patient.triageData.priority === 'laranja' ? 'bg-orange-100 text-orange-800' :
                                          patient.triageData.priority === 'amarelo' ? 'bg-yellow-100 text-yellow-800' :
                                          patient.triageData.priority === 'verde' ? 'bg-green-100 text-green-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {patient.triageData.priority.toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${isOverSLA ? 'text-red-600' : 'text-green-600'}`}>
                                      {timeElapsed} min
                                    </div>
                                    {isOverSLA && (
                                      <div className="text-xs text-red-600 font-bold">
                                        ⚠️ {timeElapsed - indicator.slaMinutes} min acima do SLA
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum paciente nesta etapa no momento
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* Desfechos Finais */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-700">📊 Desfechos Finais</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {finalOutcomes.map(outcome => {
              const count = getIndicatorCount(outcome.key);
              
              return (
                <Dialog key={outcome.key}>
                  <DialogTrigger asChild>
                    <Card className={`${outcome.color} cursor-pointer hover:shadow-md transition-shadow`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{outcome.icon}</div>
                        <div className="text-3xl font-bold">{count}</div>
                        <div className="text-sm">{outcome.label}</div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">{outcome.icon}</span>
                        {outcome.label} - {count} paciente(s)
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {count > 0 ? (
                        <div className="grid gap-3">
                          {getPatientsInStage(outcome.key).map((patient: any) => (
                            <Card key={patient.id} className="border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-lg">{patient.password}</div>
                                    <div className="text-sm text-gray-600">
                                      {getPatientName(patient)}
                                    </div>
                                    <div className="text-sm">
                                      {patient.triageData?.priority && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          patient.triageData.priority === 'vermelho' ? 'bg-red-100 text-red-800' :
                                          patient.triageData.priority === 'laranja' ? 'bg-orange-100 text-orange-800' :
                                          patient.triageData.priority === 'amarelo' ? 'bg-yellow-100 text-yellow-800' :
                                          patient.triageData.priority === 'verde' ? 'bg-green-100 text-green-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {patient.triageData.priority.toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {getPatientTimeInStage(patient)} min total
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Nenhum paciente nesta categoria no momento
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalFlowIndicators;
