
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';

const AdminScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [personalData, setPersonalData] = useState({
    name: '',
    cpf: '',
    age: '',
    canBeAttended: true
  });

  const waitingPatients = getPatientsByStatus('waiting-admin');
  const currentPatient = getPatientsByStatus('in-admin')[0];

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-admin');
    toast({
      title: "Paciente chamado",
      description: "Paciente está sendo atendido no administrativo.",
    });
  };

  const handleCompleteAdmin = () => {
    if (!currentPatient || !personalData.name || !personalData.cpf || !personalData.age) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const dataToSave = {
      ...personalData,
      age: parseInt(personalData.age)
    };

    updatePatientStatus(currentPatient.id, 'waiting-doctor', { personalData: dataToSave });
    setPersonalData({ name: '', cpf: '', age: '', canBeAttended: true });
    
    toast({
      title: "Dados coletados",
      description: personalData.canBeAttended ? 
        "Paciente encaminhado para consulta médica." : 
        "Paciente não pode ser atendido no momento.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl">📋 Área Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fila de Espera */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Atendimento</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'triageCompleted');
                    const totalTime = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <Card 
                        key={patient.id} 
                        className={`cursor-pointer hover:shadow-md transition-all ${
                          slaStatus.totalSLA ? 'border-red-500 bg-red-50' : 
                          totalTime > 80 ? 'border-yellow-500 bg-yellow-50' : 
                          'border-green-500 bg-green-50'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-lg">{patient.password}</div>
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
                                totalTime > 80 ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                Tempo total: {totalTime} min
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleCallPatient(patient.id)}
                              disabled={!!currentPatient}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Chamar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Nenhum paciente aguardando atendimento</p>
                  )}
                </div>
              </div>

              {/* Atendimento Atual */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Coleta de Dados</h3>
                {currentPatient ? (
                  <Card className="border-blue-500">
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-bold text-xl">{currentPatient.password}</div>
                        <div className="text-gray-600 capitalize">
                          {currentPatient.specialty.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-blue-600">
                          Telefone: {currentPatient.phone}
                        </div>
                        <div className="text-sm text-gray-600">
                          Queixas: {currentPatient.triageData?.complaints}
                        </div>
                        <div className="text-sm">
                          Tempo no administrativo: {getTimeElapsed(currentPatient, 'adminStarted')} min
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Nome Completo *</Label>
                          <Input
                            placeholder="Nome do paciente"
                            value={personalData.name}
                            onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label>CPF *</Label>
                          <Input
                            placeholder="000.000.000-00"
                            value={personalData.cpf}
                            onChange={(e) => setPersonalData({...personalData, cpf: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label>Idade *</Label>
                          <Input
                            type="number"
                            placeholder="Idade em anos"
                            value={personalData.age}
                            onChange={(e) => setPersonalData({...personalData, age: e.target.value})}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={personalData.canBeAttended}
                            onCheckedChange={(checked) => setPersonalData({...personalData, canBeAttended: checked})}
                          />
                          <Label>Paciente pode ser atendido</Label>
                        </div>

                        <Button 
                          onClick={handleCompleteAdmin}
                          className={`w-full ${
                            personalData.canBeAttended ? 
                            'bg-green-600 hover:bg-green-700' : 
                            'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {personalData.canBeAttended ? 'Encaminhar para Consulta' : 'Finalizar (Não Atendido)'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-gray-300">
                    <CardContent className="p-6 text-center text-gray-500">
                      <p>Nenhum paciente sendo atendido</p>
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

export default AdminScreen;
