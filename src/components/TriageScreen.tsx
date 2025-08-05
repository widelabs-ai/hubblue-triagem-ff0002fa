
import React, { useState } from 'react';
import { useHospital } from '../contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Phone, User, AlertCircle, Volume2 } from 'lucide-react';
import { format } from 'date-fns';
import TriageChat from './TriageChat';
import CancellationModal from './CancellationModal';

const TriageScreen = () => {
  const { 
    getPatientsByStatus, 
    updatePatientStatus, 
    getTimeElapsed, 
    isOverSLA, 
    callPatient 
  } = useHospital();
  
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [cancellationModal, setCancellationModal] = useState<{ isOpen: boolean; patientId: string }>({
    isOpen: false,
    patientId: ''
  });

  const waitingPatients = getPatientsByStatus('waiting-triage');
  const inTriagePatients = getPatientsByStatus('in-triage');

  const getPriorityColor = (specialty: string) => {
    return specialty === 'prioritario' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const handleCallPatient = (patientId: string) => {
    callPatient(patientId);
  };

  const handleStartTriage = (patientId: string) => {
    updatePatientStatus(patientId, 'in-triage');
  };

  const handleOpenCancellation = (patientId: string) => {
    setCancellationModal({ isOpen: true, patientId });
  };

  if (selectedPatient) {
    return (
      <TriageChat
        patientId={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Central de Triagem</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Aguardando: {waitingPatients.length}</span>
          <span>Em atendimento: {inTriagePatients.length}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fila de Espera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Fila de Espera ({waitingPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitingPatients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum paciente aguardando triagem
                </p>
              ) : (
                waitingPatients
                  .sort((a, b) => {
                    // Prioridade primeiro, depois por ordem de chegada
                    if (a.specialty !== b.specialty) {
                      return a.specialty === 'prioritario' ? -1 : 1;
                    }
                    return new Date(a.timestamps.generated).getTime() - new Date(b.timestamps.generated).getTime();
                  })
                  .map((patient) => {
                    const slaStatus = isOverSLA(patient);
                    const waitTime = getTimeElapsed(patient, 'generated');

                    return (
                      <div
                        key={patient.id}
                        className={`p-4 border rounded-lg ${slaStatus.triageSLA ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-lg">{patient.password}</span>
                              <Badge className={getPriorityColor(patient.specialty)}>
                                {patient.specialty === 'prioritario' ? 'Prioritário' : 'Normal'}
                              </Badge>
                              {slaStatus.triageSLA && (
                                <Badge variant="destructive">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Atrasado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {patient.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(patient.timestamps.generated)} ({waitTime}min)
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCallPatient(patient.id)}
                              className="flex items-center gap-1"
                            >
                              <Volume2 className="w-3 h-3" />
                              Chamar no painel
                              {(patient.callCount || 0) > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                  {patient.callCount}
                                </Badge>
                              )}
                            </Button>
                            
                            <Button
                              onClick={() => handleStartTriage(patient.id)}
                              size="sm"
                            >
                              Iniciar Triagem
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCancellation(patient.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Em Atendimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Em Atendimento ({inTriagePatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inTriagePatients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum paciente em atendimento
                </p>
              ) : (
                inTriagePatients.map((patient) => {
                  const triageTime = getTimeElapsed(patient, 'triageStarted');

                  return (
                    <div
                      key={patient.id}
                      className="p-4 border border-blue-200 bg-blue-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg">{patient.password}</span>
                            <Badge className={getPriorityColor(patient.specialty)}>
                              {patient.specialty === 'prioritario' ? 'Prioritário' : 'Normal'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {patient.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Em triagem há {triageTime}min
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => setSelectedPatient(patient.id)}
                          size="sm"
                        >
                          Abrir formulário
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CancellationModal
        isOpen={cancellationModal.isOpen}
        onClose={() => setCancellationModal({ isOpen: false, patientId: '' })}
        patientId={cancellationModal.patientId}
      />
    </div>
  );
};

export default TriageScreen;
