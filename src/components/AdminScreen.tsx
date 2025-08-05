import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CancellationModal from './CancellationModal';

const AdminScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, cancelPatient, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [adminData, setAdminData] = useState({
    name: '',
    age: '',
    gender: '',
    cpf: '',
    address: '',
    healthInsurance: '',
    emergencyContact: '',
    emergencyPhone: ''
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

  // Função para obter o nome do paciente (prioriza adminData, depois triageData)
  const getPatientName = (patient: any) => {
    if (patient.personalData?.name) {
      return patient.personalData.name;
    }
    if (patient.triageData?.personalData?.fullName) {
      return patient.triageData.personalData.fullName;
    }
    return 'Nome não coletado';
  };

  // Função para obter a idade do paciente (prioriza adminData, depois triageData)
  const getPatientAge = (patient: any) => {
    if (patient.personalData?.age) {
      return patient.personalData.age;
    }
     // Função para calcular idade a partir da data de nascimento
    const calculateAge = (dateOfBirth: string): number => {
      if (!dateOfBirth) return 0;
      const birth = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1;
      }
      
      return age;
    };
    if (patient.triageData?.personalData?.dateOfBirth) {
      return calculateAge(patient.triageData?.personalData?.dateOfBirth);
    }
    return 'N/A';
  };

  const handleCallPatient = (patientId: string) => {
    console.log('Chamando paciente:', patientId);
    updatePatientStatus(patientId, 'in-admin');
    toast({
      title: "Paciente chamado",
      description: "Paciente foi chamado no painel.",
    });
  };

  const handleOpenAdminForm = (patientId: string) => {
    console.log('Abrindo formulário para paciente:', patientId);
    updatePatientStatus(patientId, 'in-admin');
    setIsDialogOpen(true);
    toast({
      title: "Formulário aberto",
      description: "Paciente está sendo atendido no administrativo.",
    });
  };

  const handleReturnToQueue = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-admin');
      resetAdminData();
      setIsDialogOpen(false);
      toast({
        title: "Paciente retornado",
        description: "Paciente foi retornado para a fila do administrativo.",
      });
    }
  };

  const handleCancelPatient = (reason: string) => {
    if (currentPatient) {
      cancelPatient(currentPatient.id, reason);
      resetAdminData();
      setIsDialogOpen(false);
      setIsCancellationModalOpen(false);
      toast({
        title: "Paciente cancelado",
        description: "Atendimento foi cancelado com sucesso.",
      });
    }
  };

  const resetAdminData = () => {
    setAdminData({
      name: '',
      age: '',
      gender: '',
      cpf: '',
      address: '',
      healthInsurance: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
  };

  const isFormComplete = () => {
    return (
      adminData.name.trim() !== '' &&
      adminData.age.trim() !== '' &&
      adminData.gender.trim() !== '' &&
      adminData.cpf.trim() !== '' &&
      adminData.address.trim() !== '' &&
      adminData.healthInsurance.trim() !== '' &&
      adminData.emergencyContact.trim() !== '' &&
      adminData.emergencyPhone.trim() !== ''
    );
  };

  const handleCompleteAdmin = () => {
    if (!currentPatient) return;

    if (!isFormComplete()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Combina os dados do formulário administrativo com os dados existentes do paciente
    const updatedPatientData = {
      ...currentPatient,
      personalData: {
        ...currentPatient.personalData, // Mantém os dados existentes
        ...adminData // Adiciona ou substitui com os dados do formulário
      }
    };

    updatePatientStatus(currentPatient.id, 'waiting-doctor', updatedPatientData);
    resetAdminData();
    setIsDialogOpen(false);
    
    toast({
      title: "Cadastro finalizado",
      description: "Paciente encaminhado para o médico.",
    });
  };

  const handleCloseDialog = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-admin');
    }
    setIsDialogOpen(false);
    resetAdminData();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">📝 Cadastro Administrativo</CardTitle>
              <div className="w-10"></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Administrativo</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Senha</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo de atendimento</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead className="w-32">Tempo Aguardando</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-48">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'triageCompleted');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <TableRow 
                        key={patient.id}
                        className={`${
                          slaStatus.adminSLA ? 'bg-red-50 border-red-200' : 
                          timeWaiting > 30 ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <TableCell className="font-bold">{patient.password}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{getPatientName(patient)}</div>
                            <div className="text-gray-600">{getPatientAge(patient)} anos</div>
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
                        <TableCell className={`font-medium ${
                          slaStatus.adminSLA ? 'text-red-600' : 
                          timeWaiting > 30 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {timeWaiting} min
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            slaStatus.adminSLA ? 'bg-red-100 text-red-800' : 
                            timeWaiting > 30 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {slaStatus.adminSLA ? 'Atrasado' : timeWaiting > 30 ? 'Atenção' : 'No prazo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleCallPatient(patient.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Chamar no Painel
                            </Button>
                            <Button 
                              onClick={() => handleOpenAdminForm(patient.id)}
                              disabled={!!currentPatient}
                              size="sm"
                              variant="outline"
                            >
                              Abrir Formulário
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum paciente aguardando administrativo
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Administrativo */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && currentPatient) {
          updatePatientStatus(currentPatient.id, 'waiting-admin');
          resetAdminData();
          setIsDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Cadastro Administrativo</DialogTitle>
              <Button variant="ghost" onClick={handleCloseDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {currentPatient && (
            <div className="space-y-6">
              {/* Formulário de Cadastro Administrativo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna 1 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Nome completo do paciente"
                      value={adminData.name}
                      onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      placeholder="Idade do paciente"
                      value={adminData.age}
                      onChange={(e) => setAdminData({...adminData, age: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={adminData.gender} onValueChange={(value) => setAdminData({...adminData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="CPF do paciente"
                      value={adminData.cpf}
                      onChange={(e) => setAdminData({...adminData, cpf: e.target.value})}
                    />
                  </div>
                </div>

                {/* Coluna 2 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      placeholder="Endereço completo"
                      value={adminData.address}
                      onChange={(e) => setAdminData({...adminData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="healthInsurance">Convênio</Label>
                    <Input
                      id="healthInsurance"
                      placeholder="Nome do convênio"
                      value={adminData.healthInsurance}
                      onChange={(e) => setAdminData({...adminData, healthInsurance: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Nome do contato"
                      value={adminData.emergencyContact}
                      onChange={(e) => setAdminData({...adminData, emergencyContact: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                    <Input
                      id="emergencyPhone"
                      placeholder="Telefone do contato"
                      value={adminData.emergencyPhone}
                      onChange={(e) => setAdminData({...adminData, emergencyPhone: e.target.value})}
                    />
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
                <Button 
                  onClick={handleCompleteAdmin}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!isFormComplete()}
                >
                  Finalizar Cadastro
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
