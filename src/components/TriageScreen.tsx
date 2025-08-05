import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatientName, getPatientAge, getPatientGender } from '@/utils/patientUtils';

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [triageData, setTriageData] = useState({
    priority: '',
    complaints: '',
    symptoms: '',
    painScale: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      respiratoryRate: '',
      glasgow: '',
      glucose: ''
    },
    chronicDiseases: '',
    allergies: '',
    medications: '',
    observations: '',
    manchesterFlow: '',
    suggestedSpecialty: '',
    personalData: {
      name: '',
      age: '',
      gender: '',
      dateOfBirth: ''
    }
  });

  const navigate = useNavigate();
  const waitingPatients = getPatientsByStatus('waiting-triage').sort((a, b) => {
    const timeA = getTimeElapsed(a, 'generated');
    const timeB = getTimeElapsed(b, 'generated');
    return timeA - timeB;
  });
  const currentPatient = getPatientsByStatus('in-triage')[0];

  useEffect(() => {
    if (currentPatient && isDialogOpen) {
      // Initialize triage data with existing patient data or defaults
      setTriageData(prevData => ({
        ...prevData,
        personalData: {
          name: currentPatient.personalData?.name || '',
          age: currentPatient.personalData?.age?.toString() || '',
          gender: currentPatient.personalData?.gender || '',
          dateOfBirth: currentPatient.personalData?.dateOfBirth || ''
        }
      }));
    }
  }, [currentPatient, isDialogOpen]);

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-triage');
    setIsDialogOpen(true);
    toast({
      title: "Paciente chamado",
      description: "O paciente está agora em triagem.",
    });
  };

  const handleReturnToQueue = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-triage');
      resetTriageData();
      setIsDialogOpen(false);
      toast({
        title: "Paciente retornado",
        description: "Paciente foi retornado para a fila de triagem.",
      });
    }
  };

  const resetTriageData = () => {
    setTriageData({
      priority: '',
      complaints: '',
      symptoms: '',
      painScale: '',
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        respiratoryRate: '',
        glasgow: '',
        glucose: ''
      },
      chronicDiseases: '',
      allergies: '',
      medications: '',
      observations: '',
      manchesterFlow: '',
      suggestedSpecialty: '',
      personalData: {
        name: '',
        age: '',
        gender: '',
        dateOfBirth: ''
      }
    });
  };

  const handleCompleteTriage = () => {
    if (!currentPatient) return;

    // Validate required fields
    if (!triageData.priority || !triageData.complaints) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios (Prioridade e Queixas).",
        variant: "destructive"
      });
      return;
    }

    // Validate personal data fields
    if (!triageData.personalData.name || !triageData.personalData.age) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos de dados pessoais (Nome e Idade).",
        variant: "destructive"
      });
      return;
    }

    // Prepare triage data to be saved
    const triageDataToSave = {
      ...triageData,
      vitals: {
        bloodPressure: triageData.vitals.bloodPressure || '',
        heartRate: triageData.vitals.heartRate || '',
        temperature: triageData.vitals.temperature || '',
        oxygenSaturation: triageData.vitals.oxygenSaturation || '',
        respiratoryRate: triageData.vitals.respiratoryRate || '',
        glasgow: triageData.vitals.glasgow || '',
        glucose: triageData.vitals.glucose || ''
      },
      personalData: {
        ...triageData.personalData,
        age: parseInt(triageData.personalData.age)
      }
    };

    updatePatientStatus(currentPatient.id, 'waiting-admin', { triageData: triageDataToSave });
    resetTriageData();
    setIsDialogOpen(false);
    
    toast({
      title: "Triagem finalizada",
      description: "O paciente foi encaminhado para o administrativo.",
    });
  };

  const handleCloseDialog = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-triage');
    }
    setIsDialogOpen(false);
    resetTriageData();
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">🚨 Área de Triagem</CardTitle>
              <div className="w-10"></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Triagem</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Senha</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-16">Idade</TableHead>
                    <TableHead className="w-16">Gênero</TableHead>
                    <TableHead>Tipo de atendimento</TableHead>
                    <TableHead className="w-32">Tempo Aguardando</TableHead>
                    <TableHead className="w-32">Tempo Total</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'generated');
                    const totalTime = getTimeElapsed(patient, 'generated');
                    const sla = isOverSLA(patient);
                    
                    return (
                      <TableRow 
                        key={patient.id}
                        className={`${
                          sla.triageSLA ? 'bg-red-50 border-red-200' : 
                          totalTime > 60 ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <TableCell className="font-bold">{patient.password}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{getPatientName(patient)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getPatientAge(patient)}</TableCell>
                        <TableCell>{getPatientGender(patient)}</TableCell>
                        <TableCell className="capitalize">
                          {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                        </TableCell>
                        <TableCell>{timeWaiting} min</TableCell>
                        <TableCell className={`font-medium ${
                          sla.triageSLA ? 'text-red-600' : 
                          totalTime > 60 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {totalTime} min
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sla.triageSLA ? 'bg-red-100 text-red-800' : 
                            totalTime > 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {sla.triageSLA ? 'Atrasado' : totalTime > 60 ? 'Atenção' : 'No prazo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => handleCallPatient(patient.id)}
                            disabled={!!currentPatient}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Chamar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        Nenhum paciente aguardando triagem
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Triagem */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Ficha de Triagem</DialogTitle>
              <Button variant="ghost" onClick={handleCloseDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {currentPatient && (
            <div className="space-y-6">
              {/* Dados do Paciente */}
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="font-bold text-xl">{currentPatient.password}</div>
                <div className="text-gray-600 capitalize">
                  {currentPatient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                </div>
                <div className="text-sm">
                  Tempo na triagem: {getTimeElapsed(currentPatient, 'triageStarted')} min
                </div>
              </div>

              {/* Formulário de Triagem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Dados Pessoais */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Dados Pessoais</h4>
                    <div>
                      <Label>Nome Completo *</Label>
                      <Input
                        placeholder="Nome completo do paciente"
                        value={triageData.personalData.name}
                        onChange={(e) => setTriageData(prevData => ({
                          ...prevData,
                          personalData: { ...prevData.personalData, name: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Idade *</Label>
                        <Input
                          type="number"
                          placeholder="Idade em anos"
                          value={triageData.personalData.age}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            personalData: { ...prevData.personalData, age: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Gênero</Label>
                        <Select 
                          value={triageData.personalData.gender}
                          onValueChange={(value) => setTriageData(prevData => ({
                            ...prevData,
                            personalData: { ...prevData.personalData, gender: value }
                          }))}
                        >
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
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        placeholder="Data de Nascimento"
                        value={triageData.personalData.dateOfBirth}
                        onChange={(e) => setTriageData(prevData => ({
                          ...prevData,
                          personalData: { ...prevData.personalData, dateOfBirth: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Queixa Principal */}
                  <div>
                    <Label>Queixa Principal *</Label>
                    <Textarea
                      placeholder="Descreva a queixa principal do paciente..."
                      value={triageData.complaints}
                      onChange={(e) => setTriageData({ ...triageData, complaints: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {/* Sintomas */}
                  <div>
                    <Label>Sintomas</Label>
                    <Textarea
                      placeholder="Sintomas apresentados pelo paciente..."
                      value={triageData.symptoms}
                      onChange={(e) => setTriageData({ ...triageData, symptoms: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Escala de Dor */}
                  <div>
                    <Label>Escala de Dor (0-10)</Label>
                    <Input
                      type="number"
                      placeholder="Nível de dor do paciente (0-10)"
                      value={triageData.painScale}
                      onChange={(e) => setTriageData({ ...triageData, painScale: e.target.value })}
                    />
                  </div>

                  {/* Doenças Crônicas */}
                  <div>
                    <Label>Doenças Crônicas</Label>
                    <Textarea
                      placeholder="Doenças crônicas pré-existentes..."
                      value={triageData.chronicDiseases}
                      onChange={(e) => setTriageData({ ...triageData, chronicDiseases: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* Alergias */}
                  <div>
                    <Label>Alergias</Label>
                    <Textarea
                      placeholder="Alergias conhecidas do paciente..."
                      value={triageData.allergies}
                      onChange={(e) => setTriageData({ ...triageData, allergies: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* Medicações em Uso */}
                  <div>
                    <Label>Medicações em Uso</Label>
                    <Textarea
                      placeholder="Medicações que o paciente está utilizando..."
                      value={triageData.medications}
                      onChange={(e) => setTriageData({ ...triageData, medications: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Prioridade */}
                  <div>
                    <Label>Prioridade *</Label>
                    <Select 
                      value={triageData.priority}
                      onValueChange={(value) => setTriageData({ ...triageData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vermelho">Vermelho</SelectItem>
                        <SelectItem value="laranja">Laranja</SelectItem>
                        <SelectItem value="amarelo">Amarelo</SelectItem>
                        <SelectItem value="verde">Verde</SelectItem>
                        <SelectItem value="azul">Azul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sinais Vitais */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Sinais Vitais</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Pressão Arterial</Label>
                        <Input
                          placeholder="Ex: 120/80 mmHg"
                          value={triageData.vitals.bloodPressure}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            vitals: { ...prevData.vitals, bloodPressure: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Frequência Cardíaca</Label>
                        <Input
                          placeholder="Ex: 80 bpm"
                          value={triageData.vitals.heartRate}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            vitals: { ...prevData.vitals, heartRate: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Temperatura</Label>
                        <Input
                          placeholder="Ex: 36.5 °C"
                          value={triageData.vitals.temperature}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            vitals: { ...prevData.vitals, temperature: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Saturação de O₂</Label>
                        <Input
                          placeholder="Ex: 98%"
                          value={triageData.vitals.oxygenSaturation}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            vitals: { ...prevData.vitals, oxygenSaturation: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Frequência Respiratória</Label>
                        <Input
                          placeholder="Ex: 16 rpm"
                          value={triageData.vitals.respiratoryRate}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            vitals: { ...prevData.vitals, respiratoryRate: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Glasgow</Label>
                        <Input
                          placeholder="Ex: 15"
                          value={triageData.vitals.glasgow}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            vitals: { ...prevData.vitals, glasgow: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Glicemia</Label>
                        <Input
                          placeholder="Ex: 100 mg/dL"
                          value={triageData.vitals.glucose}
                          onChange={(e) => setTriageData(prevData => ({
                            ...prevData,
                            vitals: { ...prevData.vitals, glucose: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fluxograma de Manchester */}
                  <div>
                    <Label>Fluxograma de Manchester</Label>
                    <Input
                      placeholder="Resultado do fluxograma de Manchester"
                      value={triageData.manchesterFlow}
                      onChange={(e) => setTriageData({ ...triageData, manchesterFlow: e.target.value })}
                    />
                  </div>

                  {/* Especialidade Sugerida */}
                  <div>
                    <Label>Especialidade Sugerida</Label>
                    <Input
                      placeholder="Especialidade médica sugerida"
                      value={triageData.suggestedSpecialty}
                      onChange={(e) => setTriageData({ ...triageData, suggestedSpecialty: e.target.value })}
                    />
                  </div>

                  {/* Observações */}
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações adicionais sobre o paciente..."
                      value={triageData.observations}
                      onChange={(e) => setTriageData({ ...triageData, observations: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleReturnToQueue}>
                  Voltar à Fila
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Fechar
                </Button>
                <Button 
                  onClick={handleCompleteTriage}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Finalizar Triagem
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TriageScreen;
