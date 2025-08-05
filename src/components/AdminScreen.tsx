import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X, Speaker, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CancellationModal from './CancellationModal';
import { getPatientName, getPatientAge, getPatientGender, getPatientGenderFull } from '@/utils/patientUtils';

const AdminScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, cancelPatient, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [personalData, setPersonalData] = useState({
    name: '',
    cpf: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    healthInsurance: '',
    insuranceNumber: '',
    canBeAttended: true
  });

  const navigate = useNavigate();
  const waitingPatients = getPatientsByStatus('waiting-admin').sort((a, b) => {
    // Primeiro ordena por prioridade (vermelho > laranja > amarelo > verde > azul)
    const priorityOrder = { 'vermelho': 5, 'laranja': 4, 'amarelo': 3, 'verde': 2, 'azul': 1 };
    const priorityA = priorityOrder[a.triageData?.priority as keyof typeof priorityOrder] || 0;
    const priorityB = priorityOrder[b.triageData?.priority as keyof typeof priorityOrder] || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Maior prioridade primeiro
    }
    
    // Se a prioridade for igual, ordena por tempo de espera (mais tempo primeiro)
    const timeA = getTimeElapsed(a, 'triageCompleted');
    const timeB = getTimeElapsed(b, 'triageCompleted');
    return timeB - timeA;
  });
  const currentPatient = getPatientsByStatus('in-admin')[0];

  // Pre-populate form when currentPatient changes - com prioridade para dados existentes
  useEffect(() => {
    if (currentPatient && isDialogOpen) {
      // Merge dados da triagem com dados pessoais existentes
      const existingPersonalData = currentPatient.personalData;
      const triagePersonalData = currentPatient.triageData?.personalData;
      
      setPersonalData({
        name: existingPersonalData?.name || triagePersonalData?.name || '',
        cpf: existingPersonalData?.cpf || '',
        age: existingPersonalData?.age?.toString() || triagePersonalData?.age?.toString() || '',
        gender: existingPersonalData?.gender || triagePersonalData?.gender || '',
        address: existingPersonalData?.address || '',
        emergencyContact: existingPersonalData?.emergencyContact || '',
        emergencyPhone: existingPersonalData?.emergencyPhone || '',
        healthInsurance: existingPersonalData?.healthInsurance || '',
        insuranceNumber: existingPersonalData?.insuranceNumber || '',
        canBeAttended: existingPersonalData?.canBeAttended ?? true
      });
    }
  }, [currentPatient, isDialogOpen]);

  const handleCallPanel = (patientPassword: string) => {
    toast({
      title: "Chamando no painel",
      description: `Paciente ${patientPassword} foi chamado no painel de espera.`,
    });
  };

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-admin');
    setIsDialogOpen(true);
    toast({
      title: "Paciente chamado",
      description: "Paciente está sendo atendido no administrativo.",
    });
  };

  const handleReturnToQueue = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-admin');
      resetPersonalData();
      setIsDialogOpen(false);
      toast({
        title: "Paciente retornado",
        description: "Paciente foi retornado para a fila de espera.",
      });
    }
  };

  const handleCancelPatient = (reason: string) => {
    if (currentPatient) {
      cancelPatient(currentPatient.id, reason);
      resetPersonalData();
      setIsDialogOpen(false);
      setIsCancellationModalOpen(false);
      toast({
        title: "Paciente cancelado",
        description: "Atendimento foi cancelado com sucesso.",
      });
    }
  };

  const resetPersonalData = () => {
    setPersonalData({
      name: '',
      cpf: '',
      age: '',
      gender: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      healthInsurance: '',
      insuranceNumber: '',
      canBeAttended: true
    });
  };

  const handleCompleteAdmin = () => {
    if (!currentPatient || !personalData.name || !personalData.cpf || !personalData.age) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios (nome, CPF e idade).",
        variant: "destructive"
      });
      return;
    }

    const dataToSave = {
      ...personalData,
      age: parseInt(personalData.age),
      fullName: personalData.name // Garante que fullName seja definido
    };

    const nextStatus = personalData.canBeAttended ? 'waiting-doctor' : 'completed';
    updatePatientStatus(currentPatient.id, nextStatus, { personalData: dataToSave });
    
    resetPersonalData();
    setIsDialogOpen(false);
    
    toast({
      title: "Dados coletados",
      description: personalData.canBeAttended ? 
        "Paciente encaminhado para consulta médica." : 
        "Paciente não pode ser atendido - processo finalizado.",
    });
  };

  const handleCloseDialog = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-admin');
    }
    setIsDialogOpen(false);
    resetPersonalData();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">📋 Área Administrativa - Coleta de Dados</CardTitle>
              <div className="w-10"></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Atendimento</h3>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Senha</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-16">Idade</TableHead>
                    <TableHead className="w-16">Gênero</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead className="w-32">Tempo Aguardando</TableHead>
                    <TableHead className="w-32">Tempo Total</TableHead>
                    <TableHead className="w-32">Status SLA</TableHead>
                    <TableHead className="w-48">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'triageCompleted');
                    const totalTime = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <TableRow 
                        key={patient.id}
                        className={`${
                          slaStatus.totalSLA ? 'bg-red-50 border-red-200' : 
                          totalTime > 80 ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <TableCell className="font-bold">{patient.password}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {getPatientName(patient)}
                        </TableCell>
                        <TableCell>
                          {getPatientAge(patient)}
                        </TableCell>
                        <TableCell>
                          {getPatientGender(patient)}
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
                          totalTime > 80 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {totalTime} min
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            slaStatus.totalSLA ? 'bg-red-100 text-red-800' : 
                            totalTime > 80 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {slaStatus.totalSLA ? 'Atrasado' : totalTime > 80 ? 'Atenção' : 'No prazo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCallPanel(patient.password)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Speaker className="h-3 w-3 mr-1" />
                              Chamar no painel
                            </Button>
                            <Button 
                              onClick={() => handleCallPatient(patient.id)}
                              disabled={!!currentPatient}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Iniciar Cadastro
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        Nenhum paciente aguardando atendimento
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Coleta de Dados */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Complemento de Dados Pessoais</DialogTitle>
              <Button variant="ghost" onClick={handleCloseDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {currentPatient && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-bold text-xl">{currentPatient.password}</div>
                <div className="text-gray-600 capitalize">
                  {currentPatient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                </div>
                <div className="text-sm">
                  Classificação: <span className={`font-medium ${getPriorityColor(currentPatient.triageData?.priority || '')}`}>
                    {currentPatient.triageData?.priority?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Queixas: {currentPatient.triageData?.complaints}
                </div>
                <div className="text-sm">
                  Tempo no administrativo: {getTimeElapsed(currentPatient, 'adminStarted')} min
                </div>
                {/* Mostrar dados já coletados na triagem */}
                {(currentPatient.triageData?.personalData || currentPatient.personalData) && (
                  <div className="mt-2 p-3 bg-green-50 rounded border-l-4 border-green-400">
                    <strong className="text-green-800">✅ Dados já coletados na triagem:</strong>
                    <div className="text-sm text-green-700 mt-1">
                      {getPatientName(currentPatient) !== 'Nome não informado' && (
                        <div>• Nome: {getPatientName(currentPatient)}</div>
                      )}
                      {getPatientAge(currentPatient) !== 'N/A' && (
                        <div>• Idade: {getPatientAge(currentPatient)} anos</div>
                      )}
                      {getPatientGenderFull(currentPatient) !== 'Não informado' && (
                        <div>• Gênero: {getPatientGenderFull(currentPatient)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      placeholder="Nome completo do paciente"
                      value={personalData.name}
                      onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
                      className={personalData.name ? "border-green-300 bg-green-50" : ""}
                    />
                    {personalData.name && (
                      <div className="text-xs text-green-600 mt-1">✅ Preenchido</div>
                    )}
                  </div>
                  
                  <div>
                    <Label>CPF *</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={personalData.cpf}
                      onChange={(e) => setPersonalData({...personalData, cpf: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Idade *</Label>
                      <Input
                        type="number"
                        placeholder="Idade em anos"
                        value={personalData.age}
                        onChange={(e) => setPersonalData({...personalData, age: e.target.value})}
                        className={personalData.age ? "border-green-300 bg-green-50" : ""}
                      />
                      {personalData.age && (
                        <div className="text-xs text-green-600 mt-1">✅ Preenchido</div>
                      )}
                    </div>
                    <div>
                      <Label>Gênero</Label>
                      <Select 
                        value={personalData.gender}
                        onValueChange={(value) => setPersonalData({...personalData, gender: value})}
                      >
                        <SelectTrigger className={personalData.gender ? "border-green-300 bg-green-50" : ""}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      {personalData.gender && (
                        <div className="text-xs text-green-600 mt-1">✅ Preenchido</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Endereço</Label>
                    <Input
                      placeholder="Rua, número, bairro, cidade"
                      value={personalData.address}
                      onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Contato de Emergência</Label>
                      <Input
                        placeholder="Nome do contato"
                        value={personalData.emergencyContact}
                        onChange={(e) => setPersonalData({...personalData, emergencyContact: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Telefone de Emergência</Label>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={personalData.emergencyPhone}
                        onChange={(e) => setPersonalData({...personalData, emergencyPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Convênio Médico</Label>
                      <Input
                        placeholder="Nome do convênio"
                        value={personalData.healthInsurance}
                        onChange={(e) => setPersonalData({...personalData, healthInsurance: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Número da Carteirinha</Label>
                      <Input
                        placeholder="Número do convênio"
                        value={personalData.insuranceNumber}
                        onChange={(e) => setPersonalData({...personalData, insuranceNumber: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded-lg">
                    <Switch
                      checked={personalData.canBeAttended}
                      onCheckedChange={(checked) => setPersonalData({...personalData, canBeAttended: checked})}
                    />
                    <Label>Paciente pode ser atendido (convênio ativo, documentos OK)</Label>
                  </div>
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
                  onClick={handleCompleteAdmin}
                  className={`${
                    personalData.canBeAttended ? 
                    'bg-green-600 hover:bg-green-700' : 
                    'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {personalData.canBeAttended ? 'Encaminhar para Consulta' : 'Finalizar (Não Atendido)'}
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

export default AdminScreen;
