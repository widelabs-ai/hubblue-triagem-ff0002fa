
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    treatment: '',
    prescription: '',
    recommendations: '',
    followUp: ''
  });

  const navigate = useNavigate();
  const waitingPatients = getPatientsByStatus('waiting-doctor');
  const currentPatient = getPatientsByStatus('in-consultation')[0];

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-consultation');
    setIsDialogOpen(true);
    toast({
      title: "Paciente chamado",
      description: "Paciente está em consulta médica.",
    });
  };

  const handleCompleteConsultation = () => {
    if (!currentPatient) return;

    if (!consultationData.diagnosis || !consultationData.treatment) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha pelo menos o diagnóstico e tratamento.",
        variant: "destructive"
      });
      return;
    }

    updatePatientStatus(currentPatient.id, 'completed', { consultationData });
    setConsultationData({
      diagnosis: '',
      treatment: '',
      prescription: '',
      recommendations: '',
      followUp: ''
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Consulta finalizada",
      description: "Atendimento concluído com sucesso.",
    });
  };

  const handleCloseDialog = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-doctor');
    }
    setIsDialogOpen(false);
    setConsultationData({
      diagnosis: '',
      treatment: '',
      prescription: '',
      recommendations: '',
      followUp: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'azul': return 'text-blue-600';
      case 'verde': return 'text-green-600';
      case 'amarelo': return 'text-yellow-600';
      case 'laranja': return 'text-orange-600';
      case 'vermelho': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">👨‍⚕️ Atendimento Médico</CardTitle>
              <div className="w-10"></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Consulta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            Classificação: <span className={`font-medium ${getPriorityColor(patient.triageData?.priority || '')}`}>
                              {patient.triageData?.priority?.toUpperCase() || 'N/A'}
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
                <div className="col-span-full">
                  <p className="text-gray-500 text-center py-8">Nenhum paciente aguardando consulta</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Consulta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Consulta em Andamento</DialogTitle>
              <Button variant="ghost" onClick={handleCloseDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {currentPatient && (
            <div className="space-y-6">
              {/* Dados do Paciente */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-bold text-xl">{currentPatient.password}</div>
                <div className="text-lg font-semibold">
                  {currentPatient.personalData?.name}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><strong>Idade:</strong> {currentPatient.personalData?.age} anos</div>
                  <div><strong>Gênero:</strong> {currentPatient.personalData?.gender || 'N/I'}</div>
                  <div><strong>CPF:</strong> {currentPatient.personalData?.cpf}</div>
                  <div><strong>Telefone:</strong> {currentPatient.phone}</div>
                  <div className="col-span-2">
                    <strong>Especialidade:</strong> 
                    <span className="capitalize ml-1">
                      {currentPatient.specialty.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <strong>Convênio:</strong> {currentPatient.personalData?.healthInsurance || 'Particular'}
                  </div>
                </div>
              </div>

              {/* Dados da Triagem */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Dados da Triagem</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Classificação:</strong> 
                    <span className={`ml-1 font-medium ${getPriorityColor(currentPatient.triageData?.priority || '')}`}>
                      {currentPatient.triageData?.priority?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                  <div><strong>Dor (0-10):</strong> {currentPatient.triageData?.painScale || 'N/A'}</div>
                  <div><strong>PA:</strong> {currentPatient.triageData?.vitals?.bloodPressure || 'N/A'}</div>
                  <div><strong>FC:</strong> {currentPatient.triageData?.vitals?.heartRate || 'N/A'}</div>
                  <div><strong>Temp:</strong> {currentPatient.triageData?.vitals?.temperature || 'N/A'}</div>
                  <div><strong>Sat O₂:</strong> {currentPatient.triageData?.vitals?.oxygenSaturation || 'N/A'}</div>
                  <div className="col-span-2"><strong>Queixas:</strong> {currentPatient.triageData?.complaints}</div>
                  <div className="col-span-2"><strong>Sintomas:</strong> {currentPatient.triageData?.symptoms || 'N/A'}</div>
                  <div><strong>Alergias:</strong> {currentPatient.triageData?.allergies || 'Nenhuma informada'}</div>
                  <div><strong>Medicamentos:</strong> {currentPatient.triageData?.medications || 'Nenhum informado'}</div>
                  {currentPatient.triageData?.observations && (
                    <div className="col-span-2"><strong>Observações:</strong> {currentPatient.triageData.observations}</div>
                  )}
                </div>
              </div>

              {/* Formulário de Consulta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Diagnóstico *</Label>
                    <Textarea
                      placeholder="Diagnóstico principal e secundários..."
                      value={consultationData.diagnosis}
                      onChange={(e) => setConsultationData({...consultationData, diagnosis: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Plano de Tratamento *</Label>
                    <Textarea
                      placeholder="Descrição do tratamento proposto..."
                      value={consultationData.treatment}
                      onChange={(e) => setConsultationData({...consultationData, treatment: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Recomendações</Label>
                    <Textarea
                      placeholder="Orientações gerais, repouso, atividades..."
                      value={consultationData.recommendations}
                      onChange={(e) => setConsultationData({...consultationData, recommendations: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Prescrição Médica</Label>
                    <Textarea
                      placeholder="Medicamentos prescritos, dosagens e orientações..."
                      value={consultationData.prescription}
                      onChange={(e) => setConsultationData({...consultationData, prescription: e.target.value})}
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label>Acompanhamento</Label>
                    <Textarea
                      placeholder="Retorno, exames de controle, encaminhamentos..."
                      value={consultationData.followUp}
                      onChange={(e) => setConsultationData({...consultationData, followUp: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  <div>Tempo na consulta: {getTimeElapsed(currentPatient, 'consultationStarted')} min</div>
                  <div>Tempo total: {getTimeElapsed(currentPatient, 'generated')} min</div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCompleteConsultation}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar Consulta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorScreen;
