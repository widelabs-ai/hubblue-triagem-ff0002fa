import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { getPatientName } from '@/utils/patientUtils';
import type { Patient } from '@/contexts/HospitalContext';

const HospitalFlowIndicators: React.FC = () => {
  const { getPatientFlowStats, getPatientsByStatus, patients, getTimeElapsed, isOverSLA } = useHospital();
  const flowStats = getPatientFlowStats();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Mock data to ensure we always have some data to display
  const mockPatients: Patient[] = [
    { 
      id: 'mock1', 
      password: 'PR001', 
      status: 'waiting-triage', 
      specialty: 'prioritario', 
      phone: '(11) 99999-9999', 
      timestamps: { 
        generated: new Date(Date.now() - 15 * 60000),
        triageStarted: undefined,
        triageCompleted: undefined,
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      }, 
      personalData: { name: 'João Silva', age: 45, gender: 'masculino', cpf: '123.456.789-00', canBeAttended: true },
      triageData: { priority: 'amarelo', complaints: 'Dor no peito' }
    },
    { 
      id: 'mock2', 
      password: 'NP002', 
      status: 'in-consultation', 
      specialty: 'nao-prioritario', 
      phone: '(11) 88888-8888',
      timestamps: { 
        generated: new Date(Date.now() - 45 * 60000), 
        consultationStarted: new Date(Date.now() - 20 * 60000),
        triageStarted: undefined,
        triageCompleted: new Date(Date.now() - 40 * 60000),
        adminStarted: undefined,
        adminCompleted: new Date(Date.now() - 30 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Maria Santos', age: 32, gender: 'feminino', cpf: '987.654.321-00', canBeAttended: true },
      triageData: { priority: 'verde', complaints: 'Febre e dor de cabeça' }
    },
    { 
      id: 'mock3', 
      password: 'PR003', 
      status: 'waiting-exam', 
      specialty: 'prioritario', 
      phone: '(11) 77777-7777',
      timestamps: { 
        generated: new Date(Date.now() - 90 * 60000), 
        consultationCompleted: new Date(Date.now() - 30 * 60000),
        triageStarted: undefined,
        triageCompleted: new Date(Date.now() - 80 * 60000),
        adminStarted: undefined,
        adminCompleted: new Date(Date.now() - 70 * 60000),
        consultationStarted: new Date(Date.now() - 50 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Carlos Oliveira', age: 67, gender: 'masculino', cpf: '456.789.123-00', canBeAttended: true },
      triageData: { priority: 'laranja', complaints: 'Dificuldade para respirar' }
    },
    { 
      id: 'mock4', 
      password: 'NP004', 
      status: 'in-medication', 
      specialty: 'nao-prioritario', 
      phone: '(11) 66666-6666',
      timestamps: { 
        generated: new Date(Date.now() - 60 * 60000), 
        medicationStarted: new Date(Date.now() - 15 * 60000),
        triageStarted: undefined,
        triageCompleted: new Date(Date.now() - 55 * 60000),
        adminStarted: undefined,
        adminCompleted: new Date(Date.now() - 45 * 60000),
        consultationStarted: new Date(Date.now() - 35 * 60000),
        consultationCompleted: new Date(Date.now() - 25 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Ana Costa', age: 28, gender: 'feminino', cpf: '654.321.987-00', canBeAttended: true },
      triageData: { priority: 'azul', complaints: 'Dor nas costas' }
    },
    { 
      id: 'mock5', 
      password: 'PR005', 
      status: 'discharged', 
      specialty: 'prioritario', 
      phone: '(11) 55555-5555',
      timestamps: { 
        generated: new Date(Date.now() - 120 * 60000), 
        discharged: new Date(Date.now() - 10 * 60000),
        triageStarted: undefined,
        triageCompleted: new Date(Date.now() - 110 * 60000),
        adminStarted: undefined,
        adminCompleted: new Date(Date.now() - 100 * 60000),
        consultationStarted: new Date(Date.now() - 80 * 60000),
        consultationCompleted: new Date(Date.now() - 60 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Roberto Lima', age: 55, gender: 'masculino', cpf: '321.987.654-00', canBeAttended: true },
      triageData: { priority: 'verde', complaints: 'Check-up de rotina' }
    }
  ];

  // Combine real and mock data
  const allPatients: Patient[] = [...patients, ...mockPatients];

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
  ];

  const checkSLAViolations = (statusKey: string, slaMinutes: number) => {
    if (statusKey === 'readyForReassessment') {
      const readyPatients = getReadyForReassessmentPatients();
      return readyPatients.some(patient => {
        const timeElapsed = getTimeElapsed(patient, 'generated');
        return timeElapsed > slaMinutes;
      });
    }
    
    const patientsInStatus = getPatientsInStage(statusKey);
    return patientsInStatus.some(patient => {
      const timeElapsed = getTimeElapsed(patient, 'generated');
      return timeElapsed > slaMinutes;
    });
  };

  const getReadyForReassessmentPatients = (): Patient[] => {
    return allPatients.filter(p => {
      return p.timestamps.examCompleted || 
             p.timestamps.medicationCompleted || 
             p.timestamps.interConsultationCompleted;
    });
  };

  const getPatientsInStage = (statusKey: string): Patient[] => {
    if (statusKey === 'readyForReassessment') {
      return getReadyForReassessmentPatients();
    }
    return allPatients.filter(p => p.status === statusKey);
  };

  const getPatientTimeInStage = (patient: Patient) => {
    return getTimeElapsed(patient, 'generated');
  };

  const getIndicatorCount = (key: string) => {
    if (key === 'readyForReassessment') {
      return getReadyForReassessmentPatients().length;
    }
    return getPatientsInStage(key).length;
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
                        {getPatientsInStage(indicator.key).map((patient: Patient) => {
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                          {getPatientsInStage(outcome.key).map((patient: Patient) => (
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
