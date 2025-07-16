
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  const waitingPatients = getPatientsByStatus('waiting-admin');
  const currentPatient = getPatientsByStatus('in-admin')[0];

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
      setIsDialogOpen(false);
      toast({
        title: "Paciente retornado",
        description: "Paciente foi retornado para a fila de espera.",
      });
    }
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
      age: parseInt(personalData.age)
    };

    const nextStatus = personalData.canBeAttended ? 'waiting-doctor' : 'completed';
    updatePatientStatus(currentPatient.id, nextStatus, { personalData: dataToSave });
    
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
      <div className="max-w-4xl mx-auto space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            Classificação: <span className={`font-medium ${getPriorityColor(patient.triageData?.priority || '')}`}>
                              {patient.triageData?.priority?.toUpperCase() || 'N/A'}
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
                <div className="col-span-full">
                  <p className="text-gray-500 text-center py-8">Nenhum paciente aguardando atendimento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Coleta de Dados */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Coleta de Dados Pessoais</DialogTitle>
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
                  {currentPatient.specialty.replace('-', ' ')}
                </div>
                <div className="text-sm text-blue-600">
                  Telefone: {currentPatient.phone}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Idade *</Label>
                      <Input
                        type="number"
                        placeholder="Idade em anos"
                        value={personalData.age}
                        onChange={(e) => setPersonalData({...personalData, age: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Gênero</Label>
                      <Select onValueChange={(value) => setPersonalData({...personalData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
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
                  Retornar à Fila
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
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
    </div>
  );
};

export default AdminScreen;
