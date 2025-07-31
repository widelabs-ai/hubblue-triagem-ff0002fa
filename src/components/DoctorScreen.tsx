import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CancellationModal from './CancellationModal';

const DoctorScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, cancelPatient, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    treatment: '',
    prescription: '',
    recommendations: '',
    followUp: ''
  });

  const navigate = useNavigate();
  const waitingPatients = getPatientsByStatus('waiting-doctor').sort((a, b) => {
    // Primeiro ordena por prioridade (vermelho > laranja > amarelo > verde > azul)
    const priorityOrder = { 'vermelho': 5, 'laranja': 4, 'amarelo': 3, 'verde': 2, 'azul': 1 };
    const priorityA = priorityOrder[a.triageData?.priority as keyof typeof priorityOrder] || 0;
    const priorityB = priorityOrder[b.triageData?.priority as keyof typeof priorityOrder] || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Maior prioridade primeiro
    }
    
    // Se a prioridade for igual, ordena por tempo de espera (mais tempo primeiro)
    const timeA = getTimeElapsed(a, 'adminCompleted');
    const timeB = getTimeElapsed(b, 'adminCompleted');
    return timeB - timeA;
  });
  const currentPatient = getPatientsByStatus('in-consultation')[0];

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-consultation');
    setIsDialogOpen(true);
    toast({
      title: "Paciente chamado",
      description: "Paciente está em consulta médica.",
    });
  };

  const handleReturnToQueue = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-doctor');
      resetConsultationData();
      setIsDialogOpen(false);
      toast({
        title: "Paciente retornado",
        description: "Paciente foi retornado para a fila de consulta.",
      });
    }
  };

  const handleCancelPatient = (reason: string, cancelledBy: string) => {
    if (currentPatient) {
      cancelPatient(currentPatient.id, reason, cancelledBy);
      resetConsultationData();
      setIsDialogOpen(false);
      setIsCancellationModalOpen(false);
      toast({
        title: "Paciente cancelado",
        description: "Atendimento foi cancelado com sucesso.",
      });
    }
  };

  const resetConsultationData = () => {
    setConsultationData({
      diagnosis: '',
      treatment: '',
      prescription: '',
      recommendations: '',
      followUp: ''
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
    resetConsultationData();
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
    resetConsultationData();
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
      <div className="max-w-6xl mx-auto space-y-6">
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
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Senha</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead className="w-32">Tempo Aguardando</TableHead>
                    <TableHead className="w-32">Tempo Total</TableHead>
                    <TableHead className="w-32">Status SLA</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'adminCompleted');
                    const totalTime = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <TableRow 
                        key={patient.id}
                        className={`${
                          slaStatus.totalSLA ? 'bg-red-50 border-red-200' : 
                          totalTime > 90 ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <TableCell className="font-bold">{patient.password}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{patient.personalData?.name}</div>
                            <div className="text-gray-600">{patient.personalData?.age} anos</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getPriorityColor(patient.triageData?.priority || '')}`}>
                            {patient.triageData?.priority?.toUpperCase() || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>{timeWaiting} min</TableCell>
                        <TableCell className={`font-medium ${
                          slaStatus.totalSLA ? 'text-red-600' : 
                          totalTime > 90 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {totalTime} min
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            slaStatus.totalSLA ? 'bg-red-100 text-red-800' : 
                            totalTime > 90 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {slaStatus.totalSLA ? 'Atrasado' : totalTime > 90 ? 'Atenção' : 'No prazo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => handleCallPatient(patient.id)}
                            disabled={!!currentPatient}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Chamar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Nenhum paciente aguardando consulta
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                  <div className="col-span-2">
                    <strong>Tipo:</strong> 
                    <span className="capitalize ml-1">
                      {currentPatient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
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
                <Button variant="outline" onClick={handleReturnToQueue}>
                  Voltar à Fila
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCancellationModalOpen(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancelar Paciente
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Fechar
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

      {/* Modal de Cancelamento */}
      <CancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        onConfirm={handleCancelPatient}
        patientPassword={currentPatient?.password || ''}
      />
    </div>
  );
};

export default DoctorScreen;
