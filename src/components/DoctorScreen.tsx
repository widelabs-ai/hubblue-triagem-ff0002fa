
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';

const DoctorScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, isOverSLA } = useHospital();

  const waitingPatients = getPatientsByStatus('waiting-doctor');
  const currentPatient = getPatientsByStatus('in-consultation')[0];

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-consultation');
    toast({
      title: "Paciente chamado",
      description: "Paciente está em consulta médica.",
    });
  };

  const handleCompleteConsultation = () => {
    if (!currentPatient) return;

    updatePatientStatus(currentPatient.id, 'completed');
    
    toast({
      title: "Consulta finalizada",
      description: "Atendimento concluído com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CardTitle className="text-2xl">👨‍⚕️ Atendimento Médico</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fila de Espera */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Consulta</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {waitingPatients.map((patient) => {
                    const totalTime = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <Card 
                        key={patient.id} 
                        className={`cursor-pointer hover:shadow-md transition-all ${
                          slaStatus.totalSLA ? 'border-red-500 bg-red-50' : 
                          totalTime > 90 ? 'border-yellow-500 bg-yellow-50' : 
                          'border-green-500 bg-green-50'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-lg">{patient.password}</div>
                              <div className="text-sm text-gray-600">
                                {patient.personalData?.name} - {patient.personalData?.age} anos
                              </div>
                              <div className="text-sm text-gray-600 capitalize">
                                {patient.specialty.replace('-', ' ')}
                              </div>
                              <div className="text-sm">
                                Prioridade: <span className={`font-medium ${
                                  patient.triageData?.priority === 'urgente' ? 'text-red-600' :
                                  patient.triageData?.priority === 'alta' ? 'text-orange-600' :
                                  patient.triageData?.priority === 'media' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {patient.triageData?.priority}
                                </span>
                              </div>
                              <div className={`text-sm font-medium ${
                                slaStatus.totalSLA ? 'text-red-600' : 
                                totalTime > 90 ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                Tempo total: {totalTime} min
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleCallPatient(patient.id)}
                              disabled={!!currentPatient}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Chamar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Nenhum paciente aguardando consulta</p>
                  )}
                </div>
              </div>

              {/* Consulta Atual */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Consulta em Andamento</h3>
                {currentPatient ? (
                  <Card className="border-green-500">
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="font-bold text-xl">{currentPatient.password}</div>
                        <div className="text-lg font-semibold">
                          {currentPatient.personalData?.name}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <strong>Idade:</strong> {currentPatient.personalData?.age} anos
                          </div>
                          <div>
                            <strong>CPF:</strong> {currentPatient.personalData?.cpf}
                          </div>
                          <div className="col-span-2">
                            <strong>Telefone:</strong> {currentPatient.phone}
                          </div>
                          <div className="col-span-2">
                            <strong>Especialidade:</strong> 
                            <span className="capitalize ml-1">
                              {currentPatient.specialty.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Dados da Triagem</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Prioridade:</strong> 
                            <span className={`ml-1 ${
                              currentPatient.triageData?.priority === 'urgente' ? 'text-red-600' :
                              currentPatient.triageData?.priority === 'alta' ? 'text-orange-600' :
                              currentPatient.triageData?.priority === 'media' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {currentPatient.triageData?.priority}
                            </span>
                          </div>
                          <div>
                            <strong>Sinais Vitais:</strong> {currentPatient.triageData?.vitals}
                          </div>
                          <div>
                            <strong>Queixas:</strong> {currentPatient.triageData?.complaints}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Tempos</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Tempo na consulta: {getTimeElapsed(currentPatient, 'consultationStarted')} min</div>
                          <div>Tempo total: {getTimeElapsed(currentPatient, 'generated')} min</div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleCompleteConsultation}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Finalizar Consulta
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-gray-300">
                    <CardContent className="p-6 text-center text-gray-500">
                      <p>Nenhum paciente em consulta</p>
                      <p className="text-sm">Chame um paciente da fila de espera</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorScreen;
