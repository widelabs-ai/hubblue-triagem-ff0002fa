
import React, { useState } from 'react';
import { useHospital, Patient } from '@/contexts/HospitalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getPatientName, getPatientAge, getPatientGender } from '@/utils/patientUtils';

const AdminScreen: React.FC = () => {
  const { patients, updatePatientStatus, getPatientsByStatus, getPatientById, getTimeElapsed, isOverSLA } = useHospital();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [personalData, setPersonalData] = useState({
    fullName: '',
    name: '',
    cpf: '',
    age: 0,
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    healthInsurance: '',
    insuranceNumber: '',
    canBeAttended: true
  });

  const startAdmin = (patientId: string) => {
    const patient = getPatientById(patientId);
    if (patient) {
      updatePatientStatus(patientId, 'in-admin');
      setSelectedPatient(patient);
      setIsFormOpen(true);
      
      // Pre-populate form with existing data
      setPersonalData({
        fullName: patient.personalData?.fullName || patient.triageData?.personalData?.fullName || '',
        name: patient.personalData?.name || patient.triageData?.personalData?.name || '',
        cpf: patient.personalData?.cpf || '',
        age: patient.personalData?.age || patient.triageData?.personalData?.age || 0,
        dateOfBirth: patient.personalData?.dateOfBirth || patient.triageData?.personalData?.dateOfBirth || '',
        gender: patient.personalData?.gender || patient.triageData?.personalData?.gender || '',
        address: patient.personalData?.address || '',
        emergencyContact: patient.personalData?.emergencyContact || '',
        emergencyPhone: patient.personalData?.emergencyPhone || '',
        healthInsurance: patient.personalData?.healthInsurance || '',
        insuranceNumber: patient.personalData?.insuranceNumber || '',
        canBeAttended: patient.personalData?.canBeAttended ?? true
      });
    }
  };

  const callPatientToPanel = (password: string) => {
    toast.success(`Senha ${password} chamada para o painel`);
  };

  const handleSubmit = () => {
    if (!selectedPatient) return;

    // Validation
    if (!personalData.name.trim() || !personalData.cpf.trim() || personalData.age <= 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validate CPF format (basic validation)
    const cpfNumbers = personalData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      toast.error('CPF deve conter 11 dígitos');
      return;
    }

    updatePatientStatus(selectedPatient.id, 'waiting-doctor', { personalData });
    toast.success('Dados administrativos salvos com sucesso!');
    
    setIsFormOpen(false);
    setSelectedPatient(null);
  };

  const handleBack = () => {
    if (!selectedPatient) return;
    
    updatePatientStatus(selectedPatient.id, 'waiting-admin');
    setIsFormOpen(false);
    setSelectedPatient(null);
    toast.info('Paciente retornado à fila administrativa');
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setPersonalData({...personalData, cpf: formatted});
  };

  const waitingPatients = getPatientsByStatus('waiting-admin');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Administrativo</h1>
        <p className="text-gray-600">Cadastro e verificação de dados dos pacientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              ⏳ Aguardando Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{waitingPatients.length}</div>
            <p className="text-sm text-gray-600 mt-1">pacientes na fila</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              📝 Em Processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{getPatientsByStatus('in-admin').length}</div>
            <p className="text-sm text-gray-600 mt-1">sendo processados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              ✅ Processados Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {patients.filter(p => 
                p.timestamps.adminCompleted && 
                new Date(p.timestamps.adminCompleted).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">pacientes processados</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Fila Administrativa ({waitingPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Senha</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-16">Idade</TableHead>
                  <TableHead className="w-20">Gênero</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead className="w-32">Tempo Aguardando</TableHead>
                  <TableHead className="w-48">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingPatients.map((patient) => {
                  const waitingTime = getTimeElapsed(patient, 'triageCompleted');
                  const sla = isOverSLA(patient);
                  
                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="font-bold">{patient.password}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {getPatientName(patient)}
                      </TableCell>
                      <TableCell>{getPatientAge(patient)}</TableCell>
                      <TableCell>{getPatientGender(patient)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          patient.triageData?.priority === 'vermelho' ? 'text-red-600' :
                          patient.triageData?.priority === 'laranja' ? 'text-orange-600' :
                          patient.triageData?.priority === 'amarelo' ? 'text-yellow-600' :
                          patient.triageData?.priority === 'verde' ? 'text-green-600' :
                          patient.triageData?.priority === 'azul' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {patient.triageData?.priority?.toUpperCase() || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-orange-600">
                        {waitingTime} min
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => callPatientToPanel(patient.password)}
                          >
                            📢 Chamar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => startAdmin(patient.id)}
                          >
                            📝 Iniciar Cadastro
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {waitingPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum paciente aguardando processamento administrativo
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📝 Cadastro Administrativo - Senha {selectedPatient?.password}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Summary */}
            {selectedPatient?.triageData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">📋 Resumo da Triagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Classificação:</strong> <span className={`font-medium ${
                    selectedPatient.triageData.priority === 'vermelho' ? 'text-red-600' :
                    selectedPatient.triageData.priority === 'laranja' ? 'text-orange-600' :
                    selectedPatient.triageData.priority === 'amarelo' ? 'text-yellow-600' :
                    selectedPatient.triageData.priority === 'verde' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {selectedPatient.triageData.priority?.toUpperCase()}
                  </span></p>
                  <p><strong>Queixa Principal:</strong> {selectedPatient.triageData.complaints}</p>
                  {selectedPatient.triageData.suggestedSpecialty && (
                    <p><strong>Especialidade Sugerida:</strong> {selectedPatient.triageData.suggestedSpecialty}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Personal Data Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={personalData.name}
                  onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
                  placeholder="Nome do paciente"
                />
              </div>
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={personalData.fullName}
                  onChange={(e) => setPersonalData({...personalData, fullName: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={personalData.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <div>
                <Label htmlFor="age">Idade *</Label>
                <Input
                  id="age"
                  type="number"
                  value={personalData.age || ''}
                  onChange={(e) => setPersonalData({...personalData, age: parseInt(e.target.value) || 0})}
                  placeholder="Idade"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select value={personalData.gender} onValueChange={(value) => setPersonalData({...personalData, gender: value})}>
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
              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={personalData.address}
                  onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                  placeholder="Endereço completo"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                <Input
                  id="emergencyContact"
                  value={personalData.emergencyContact}
                  onChange={(e) => setPersonalData({...personalData, emergencyContact: e.target.value})}
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                <Input
                  id="emergencyPhone"
                  value={personalData.emergencyPhone}
                  onChange={(e) => setPersonalData({...personalData, emergencyPhone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="healthInsurance">Convênio</Label>
                <Select value={personalData.healthInsurance} onValueChange={(value) => setPersonalData({...personalData, healthInsurance: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sus">SUS</SelectItem>
                    <SelectItem value="unimed">Unimed</SelectItem>
                    <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                    <SelectItem value="amil">Amil</SelectItem>
                    <SelectItem value="sulamerica">Sul América</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="insuranceNumber">Número da Carteirinha</Label>
                <Input
                  id="insuranceNumber"
                  value={personalData.insuranceNumber}
                  onChange={(e) => setPersonalData({...personalData, insuranceNumber: e.target.value})}
                  placeholder="Número do convênio"
                />
              </div>
            </div>

            {/* Can be attended checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="canBeAttended"
                checked={personalData.canBeAttended}
                onChange={(e) => setPersonalData({...personalData, canBeAttended: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="canBeAttended">Paciente pode ser atendido (documentos em ordem)</Label>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleBack}>
              ← Voltar à Fila
            </Button>
            <Button onClick={handleSubmit}>
              ✅ Salvar e Encaminhar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminScreen;
