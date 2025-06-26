
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [triageData, setTriageData] = useState({
    priority: '',
    vitals: '',
    complaints: ''
  });

  const waitingPatients = getPatientsByStatus('waiting-triage');
  const currentPatient = getPatientsByStatus('in-triage')[0];

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-triage');
    setSelectedPatient(patientId);
    toast({
      title: "Paciente chamado",
      description: "Paciente está sendo atendido na triagem.",
    });
  };

  const handleCompleteTriagem = () => {
    if (!currentPatient || !triageData.priority || !triageData.vitals || !triageData.complaints) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos da triagem.",
        variant: "destructive"
      });
      return;
    }

    updatePatientStatus(currentPatient.id, 'waiting-admin', { triageData });
    setTriageData({ priority: '', vitals: '', complaints: '' });
    
    toast({
      title: "Triagem concluída",
      description: "Paciente encaminhado para o administrativo.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle className="text-2xl">🩺 Sistema de Triagem</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fila de Espera */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Triagem</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <Card 
                        key={patient.id} 
                        className={`cursor-pointer hover:shadow-md transition-all ${
                          slaStatus.triageSLA ? 'border-red-500 bg-red-50' : 
                          timeWaiting > 7 ? 'border-yellow-500 bg-yellow-50' : 
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
                              <div className={`text-sm font-medium ${
                                slaStatus.triageSLA ? 'text-red-600' : 
                                timeWaiting > 7 ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                Aguardando: {timeWaiting} min
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
                    <p className="text-gray-500 text-center py-8">Nenhum paciente aguardando triagem</p>
                  )}
                </div>
              </div>

              {/* Triagem Atual */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Triagem em Andamento</h3>
                {currentPatient ? (
                  <Card className="border-blue-500">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-xl">{currentPatient.password}</div>
                          <div className="text-gray-600 capitalize">
                            {currentPatient.specialty.replace('-', ' ')}
                          </div>
                          <div className="text-sm text-blue-600">
                            Telefone: {currentPatient.phone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Tempo na triagem:</div>
                          <div className="font-bold">
                            {getTimeElapsed(currentPatient, 'triageStarted')} min
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Prioridade</Label>
                          <Select onValueChange={(value) => setTriageData({...triageData, priority: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixa">🟢 Baixa</SelectItem>
                              <SelectItem value="media">🟡 Média</SelectItem>
                              <SelectItem value="alta">🟠 Alta</SelectItem>
                              <SelectItem value="urgente">🔴 Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Sinais Vitais</Label>
                          <Input
                            placeholder="PA: 120x80, FC: 70, T: 36.5°C"
                            value={triageData.vitals}
                            onChange={(e) => setTriageData({...triageData, vitals: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label>Queixas Principais</Label>
                          <Textarea
                            placeholder="Descreva as queixas do paciente..."
                            value={triageData.complaints}
                            onChange={(e) => setTriageData({...triageData, complaints: e.target.value})}
                            rows={3}
                          />
                        </div>

                        <Button 
                          onClick={handleCompleteTriagem}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Concluir Triagem
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-gray-300">
                    <CardContent className="p-6 text-center text-gray-500">
                      <p>Nenhum paciente em triagem</p>
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

export default TriageScreen;
