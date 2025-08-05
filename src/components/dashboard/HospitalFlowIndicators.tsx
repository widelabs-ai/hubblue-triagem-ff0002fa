import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { Clock, Users, AlertCircle } from 'lucide-react';

const HospitalFlowIndicators: React.FC = () => {
  const { patients, getPatientsByStatus, getPatientsByStatusAndSpecialty, getTimeElapsed, isOverSLA } = useHospital();
  const [selectedIndicator, setSelectedIndicator] = useState<{
    title: string;
    patients: any[];
    isOpen: boolean;
  }>({ title: '', patients: [], isOpen: false });

  const checkSLAViolation = (patientList: any[]) => {
    return patientList.some(patient => {
      const sla = isOverSLA(patient);
      return sla.triageSLA || sla.totalSLA;
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins + 'min' : ''}`;
  };

  const handleIndicatorClick = (title: string, patientList: any[]) => {
    setSelectedIndicator({
      title,
      patients: patientList,
      isOpen: true
    });
  };

  const waitingTriagePatients = getPatientsByStatus('waiting-triage');
  const inTriagePatients = getPatientsByStatus('in-triage');
  const waitingAdminPatients = getPatientsByStatus('waiting-admin');
  const inAdminPatients = getPatientsByStatus('in-admin');
  const waitingExamPatients = getPatientsByStatus('waiting-exam');
  const inExamPatients = getPatientsByStatus('in-exam');
  const waitingMedicationPatients = getPatientsByStatus('waiting-medication');
  const inMedicationPatients = getPatientsByStatus('in-medication');
  const waitingHospitalizationPatients = getPatientsByStatus('waiting-hospitalization');
  const inHospitalizationPatients = getPatientsByStatus('in-hospitalization');

  // Medical specialties data
  const specialties = [
    { key: 'clinica-medica', name: 'Clínica Médica', icon: '🩺' },
    { key: 'cirurgia-geral', name: 'Cirurgia Geral', icon: '🔪' },
    { key: 'ortopedia', name: 'Ortopedia', icon: '🦴' },
    { key: 'pediatria', name: 'Pediatria', icon: '👶' }
  ];

  return (
    <>
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">🚀 Fluxo de Pacientes - Indicadores em Tempo Real</h3>
        
        {/* Triagem e Recepção */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${checkSLAViolation(waitingTriagePatients) ? 'animate-pulse border-red-500 bg-red-50' : ''}`}
            onClick={() => handleIndicatorClick('Aguardando Triagem', waitingTriagePatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{waitingTriagePatients.length}</div>
              <div className="text-sm text-gray-600">Aguardando Triagem</div>
              {checkSLAViolation(waitingTriagePatients) && (
                <AlertCircle className="w-4 h-4 text-red-500 mx-auto mt-1" />
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleIndicatorClick('Em Triagem', inTriagePatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{inTriagePatients.length}</div>
              <div className="text-sm text-gray-600">Em Triagem</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${checkSLAViolation(waitingAdminPatients) ? 'animate-pulse border-red-500 bg-red-50' : ''}`}
            onClick={() => handleIndicatorClick('Aguardando Recepção', waitingAdminPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{waitingAdminPatients.length}</div>
              <div className="text-sm text-gray-600">Aguardando Recepção</div>
              {checkSLAViolation(waitingAdminPatients) && (
                <AlertCircle className="w-4 h-4 text-red-500 mx-auto mt-1" />
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleIndicatorClick('Atendimento Recepção', inAdminPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{inAdminPatients.length}</div>
              <div className="text-sm text-gray-600">Atendimento Recepção</div>
            </CardContent>
          </Card>
        </div>

        {/* Especialidades Médicas - Linha única */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-3">👩‍⚕️ Consultório Médico por Especialidade</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {specialties.map((specialty) => {
              const waitingPatients = getPatientsByStatusAndSpecialty('waiting-doctor', specialty.key as any);
              const inConsultationPatients = getPatientsByStatusAndSpecialty('in-consultation', specialty.key as any);
              const hasWaitingSLAViolation = checkSLAViolation(waitingPatients);
              
              return (
                <Card key={specialty.key} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                      <span>{specialty.icon}</span>
                      <span>{specialty.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Aguardando Médico */}
                    <div 
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                        hasWaitingSLAViolation ? 'animate-pulse border border-red-500 bg-red-50' : 'bg-gray-50'
                      }`}
                      onClick={() => handleIndicatorClick(`Aguardando ${specialty.name}`, waitingPatients)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-orange-600">{waitingPatients.length}</div>
                          <div className="text-xs text-gray-600">Aguardando médico</div>
                        </div>
                        {hasWaitingSLAViolation && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Em Atendimento */}
                    <div 
                      className="p-3 rounded-lg bg-green-50 cursor-pointer transition-all hover:shadow-sm"
                      onClick={() => handleIndicatorClick(`Em Atendimento ${specialty.name}`, inConsultationPatients)}
                    >
                      <div className="text-lg font-bold text-green-600">{inConsultationPatients.length}</div>
                      <div className="text-xs text-gray-600">Em atendimento</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Exames, Medicação e Internação */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${checkSLAViolation(waitingExamPatients) ? 'animate-pulse border-red-500 bg-red-50' : ''}`}
            onClick={() => handleIndicatorClick('Aguardando Exame', waitingExamPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{waitingExamPatients.length}</div>
              <div className="text-sm text-gray-600">Aguardando Exame</div>
              {checkSLAViolation(waitingExamPatients) && (
                <AlertCircle className="w-4 h-4 text-red-500 mx-auto mt-1" />
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleIndicatorClick('Em Exame', inExamPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{inExamPatients.length}</div>
              <div className="text-sm text-gray-600">Em Exame</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${checkSLAViolation(waitingMedicationPatients) ? 'animate-pulse border-red-500 bg-red-50' : ''}`}
            onClick={() => handleIndicatorClick('Aguardando Medicação', waitingMedicationPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{waitingMedicationPatients.length}</div>
              <div className="text-sm text-gray-600">Aguardando Medicação</div>
              {checkSLAViolation(waitingMedicationPatients) && (
                <AlertCircle className="w-4 h-4 text-red-500 mx-auto mt-1" />
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleIndicatorClick('Em Medicação', inMedicationPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">{inMedicationPatients.length}</div>
              <div className="text-sm text-gray-600">Em Medicação</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${checkSLAViolation(waitingHospitalizationPatients) ? 'animate-pulse border-red-500 bg-red-50' : ''}`}
            onClick={() => handleIndicatorClick('Aguardando Internação', waitingHospitalizationPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{waitingHospitalizationPatients.length}</div>
              <div className="text-sm text-gray-600">Aguardando Internação</div>
              {checkSLAViolation(waitingHospitalizationPatients) && (
                <AlertCircle className="w-4 h-4 text-red-500 mx-auto mt-1" />
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleIndicatorClick('Internados', inHospitalizationPatients)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{inHospitalizationPatients.length}</div>
              <div className="text-sm text-gray-600">Internados</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Patient Details Modal */}
      <Dialog open={selectedIndicator.isOpen} onOpenChange={(open) => setSelectedIndicator(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedIndicator.title} ({selectedIndicator.patients.length} pacientes)
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedIndicator.patients.length > 0 ? (
              <div className="grid gap-3">
                {selectedIndicator.patients.map((patient) => {
                  const slaStatus = isOverSLA(patient);
                  const timeInCurrentStatus = getTimeElapsed(patient, 'generated');
                  
                  return (
                    <Card key={patient.id} className={`p-4 ${slaStatus.triageSLA || slaStatus.totalSLA ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {patient.password}
                            </Badge>
                            <Badge variant={patient.specialty === 'prioritario' ? 'destructive' : 'secondary'}>
                              {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não Prioritário'}
                            </Badge>
                            {patient.medicalSpecialty && (
                              <Badge variant="outline">
                                {patient.medicalSpecialty.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <div>Nome: {patient.personalData?.fullName || patient.personalData?.name || patient.triageData?.personalData?.fullName || patient.triageData?.personalData?.name || 'Não informado'}</div>
                            <div>Telefone: {patient.phone}</div>
                            <div>Status: {patient.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(timeInCurrentStatus)}</span>
                          </div>
                          {(slaStatus.triageSLA || slaStatus.totalSLA) && (
                            <Badge variant="destructive" className="mt-1">
                              Fora do prazo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum paciente encontrado nesta categoria.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HospitalFlowIndicators;
