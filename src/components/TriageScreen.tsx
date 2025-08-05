import React, { useState } from 'react';
import { useHospital, Patient } from '@/contexts/HospitalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VitalSignInput from '@/components/VitalSignInput';
import { toast } from 'sonner';
import { validateVitals } from '@/utils/vitalsValidation';
import { manchesterFlows } from '@/utils/manchesterFlows';

const TriageScreen: React.FC = () => {
  const { patients, updatePatientStatus, getPatientsByStatus, getPatientById, getTimeElapsed, isOverSLA } = useHospital();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('personal');
  const [personalData, setPersonalData] = useState({
    fullName: '',
    name: '',
    age: 0,
    gender: '',
    dateOfBirth: ''
  });
  const [triageData, setTriageData] = useState({
    priority: 'verde',
    complaints: '',
    symptoms: '',
    painScale: '',
    vitals: {},
    chronicDiseases: '',
    allergies: '',
    medications: '',
    observations: '',
    manchesterFlow: '',
    suggestedSpecialty: ''
  });

  const startTriage = (patientId: string) => {
    const patient = getPatientById(patientId);
    if (patient) {
      updatePatientStatus(patientId, 'in-triage');
      setSelectedPatient(patient);
      setIsFormOpen(true);
      setCurrentTab('personal');
      
      // Reset form data
      setPersonalData({
        fullName: '',
        name: patient.personalData?.name || '',
        age: patient.personalData?.age || 0,
        gender: '',
        dateOfBirth: ''
      });
      setTriageData({
        priority: 'verde',
        complaints: '',
        symptoms: '',
        painScale: '',
        vitals: {},
        chronicDiseases: '',
        allergies: '',
        medications: '',
        observations: '',
        manchesterFlow: '',
        suggestedSpecialty: ''
      });
    }
  };

  const callPatientToPanel = (password: string) => {
    toast.success(`Senha ${password} chamada para o painel`);
  };

  const handleSubmit = () => {
    if (!selectedPatient) return;

    // Validation
    if (!personalData.name.trim() || personalData.age <= 0) {
      toast.error('Por favor, preencha os dados pessoais obrigatórios');
      return;
    }

    if (!triageData.complaints.trim()) {
      toast.error('Por favor, preencha a queixa principal');
      return;
    }

    if (!triageData.priority) {
      toast.error('Por favor, selecione a classificação de risco');
      return;
    }

    // Validate vitals if provided
    if (Object.keys(triageData.vitals).length > 0) {
      const validation = validateVitals(triageData.vitals);
      if (!validation.isValid) {
        toast.error(`Sinais vitais inválidos: ${validation.errors.join(', ')}`);
        return;
      }
    }

    const completeTriageData = {
      ...triageData,
      personalData: personalData
    };

    updatePatientStatus(selectedPatient.id, 'waiting-admin', { triageData: completeTriageData });
    toast.success('Triagem concluída com sucesso!');
    
    setIsFormOpen(false);
    setSelectedPatient(null);
    setCurrentTab('personal');
  };

  const handleBack = () => {
    if (!selectedPatient) return;
    
    updatePatientStatus(selectedPatient.id, 'waiting-triage');
    setIsFormOpen(false);
    setSelectedPatient(null);
    setCurrentTab('personal');
    toast.info('Paciente retornado à fila de triagem');
  };

  const waitingPatients = getPatientsByStatus('waiting-triage');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🩺 Triagem</h1>
        <p className="text-gray-600">Avaliação inicial e classificação de risco dos pacientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              ⏳ Aguardando Triagem
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
              🩺 Em Triagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{getPatientsByStatus('in-triage').length}</div>
            <p className="text-sm text-gray-600 mt-1">sendo atendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              ✅ Triados Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {patients.filter(p => 
                p.timestamps.triageCompleted && 
                new Date(p.timestamps.triageCompleted).toDateString() === new Date().toDateString()
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
            📋 Fila de Triagem ({waitingPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Senha</TableHead>
                  <TableHead>Tipo de atendimento</TableHead>
                  <TableHead className="w-32">Tempo Aguardando</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-48">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingPatients.map((patient) => {
                  const waitingTime = getTimeElapsed(patient, 'generated');
                  const sla = isOverSLA(patient);
                  
                  return (
                    <TableRow key={patient.id} className={sla.triageSLA ? 'bg-red-50' : ''}>
                      <TableCell className="font-bold">{patient.password}</TableCell>
                      <TableCell className="capitalize">
                        {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                      </TableCell>
                      <TableCell className={`font-medium ${sla.triageSLA ? 'text-red-600' : 'text-green-600'}`}>
                        {waitingTime} min
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sla.triageSLA ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {sla.triageSLA ? 'Atrasado' : 'No prazo'}
                        </span>
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
                            onClick={() => startTriage(patient.id)}
                          >
                            🩺 Iniciar Triagem
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {waitingPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum paciente aguardando triagem
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Triage Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🩺 Triagem - Senha {selectedPatient?.password}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="vitals">Sinais Vitais</TabsTrigger>
              <TabsTrigger value="assessment">Avaliação</TabsTrigger>
              <TabsTrigger value="classification">Classificação</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              <VitalSignInput
                vitals={triageData.vitals}
                onChange={(vitals) => setTriageData({...triageData, vitals})}
              />
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div>
                <Label htmlFor="complaints">Queixa Principal *</Label>
                <Textarea
                  id="complaints"
                  value={triageData.complaints}
                  onChange={(e) => setTriageData({...triageData, complaints: e.target.value})}
                  placeholder="Descreva a queixa principal do paciente"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="symptoms">Sintomas Associados</Label>
                <Textarea
                  id="symptoms"
                  value={triageData.symptoms}
                  onChange={(e) => setTriageData({...triageData, symptoms: e.target.value})}
                  placeholder="Outros sintomas apresentados"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="painScale">Escala de Dor (0-10)</Label>
                <Select value={triageData.painScale} onValueChange={(value) => setTriageData({...triageData, painScale: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a intensidade da dor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 11}, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} - {i === 0 ? 'Sem dor' : i <= 3 ? 'Leve' : i <= 6 ? 'Moderada' : 'Intensa'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="chronicDiseases">Doenças Crônicas</Label>
                  <Textarea
                    id="chronicDiseases"
                    value={triageData.chronicDiseases}
                    onChange={(e) => setTriageData({...triageData, chronicDiseases: e.target.value})}
                    placeholder="Hipertensão, diabetes..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    value={triageData.allergies}
                    onChange={(e) => setTriageData({...triageData, allergies: e.target.value})}
                    placeholder="Medicamentos, alimentos..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medications">Medicações em Uso</Label>
                  <Textarea
                    id="medications"
                    value={triageData.medications}
                    onChange={(e) => setTriageData({...triageData, medications: e.target.value})}
                    placeholder="Medicamentos atuais"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observations">Observações Gerais</Label>
                <Textarea
                  id="observations"
                  value={triageData.observations}
                  onChange={(e) => setTriageData({...triageData, observations: e.target.value})}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="classification" className="space-y-4">
              <div>
                <Label htmlFor="manchesterFlow">Fluxo de Manchester</Label>
                <Select value={triageData.manchesterFlow} onValueChange={(value) => {
                  setTriageData({...triageData, manchesterFlow: value});
                  // Auto-suggest priority based on flow
                  const flow = manchesterFlows.find(f => f.id === value);
                  if (flow) {
                    setTriageData(prev => ({...prev, priority: flow.priority}));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fluxo" />
                  </SelectTrigger>
                  <SelectContent>
                    {manchesterFlows.map((flow) => (
                      <SelectItem key={flow.id} value={flow.id}>
                        {flow.name} - {flow.priority.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Classificação de Risco *</Label>
                <Select value={triageData.priority} onValueChange={(value: any) => setTriageData({...triageData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vermelho">🔴 VERMELHO - Emergência (Imediato)</SelectItem>
                    <SelectItem value="laranja">🟠 LARANJA - Muito Urgente (10 min)</SelectItem>
                    <SelectItem value="amarelo">🟡 AMARELO - Urgente (60 min)</SelectItem>
                    <SelectItem value="verde">🟢 VERDE - Pouco Urgente (120 min)</SelectItem>
                    <SelectItem value="azul">🔵 AZUL - Não Urgente (240 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="suggestedSpecialty">Especialidade Sugerida</Label>
                <Select value={triageData.suggestedSpecialty} onValueChange={(value) => setTriageData({...triageData, suggestedSpecialty: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinica-geral">Clínica Geral</SelectItem>
                    <SelectItem value="pediatria">Pediatria</SelectItem>
                    <SelectItem value="cardiologia">Cardiologia</SelectItem>
                    <SelectItem value="ortopedia">Ortopedia</SelectItem>
                    <SelectItem value="neurologia">Neurologia</SelectItem>
                    <SelectItem value="cirurgia">Cirurgia</SelectItem>
                    <SelectItem value="ginecologia">Ginecologia</SelectItem>
                    <SelectItem value="psiquiatria">Psiquiatria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              ← Voltar à Fila
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentTab === 'personal') return;
                  const tabs = ['personal', 'vitals', 'assessment', 'classification'];
                  const currentIndex = tabs.indexOf(currentTab);
                  setCurrentTab(tabs[currentIndex - 1]);
                }}
                disabled={currentTab === 'personal'}
              >
                ← Anterior
              </Button>
              {currentTab !== 'classification' ? (
                <Button
                  onClick={() => {
                    const tabs = ['personal', 'vitals', 'assessment', 'classification'];
                    const currentIndex = tabs.indexOf(currentTab);
                    setCurrentTab(tabs[currentIndex + 1]);
                  }}
                >
                  Próximo →
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  ✅ Concluir Triagem
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TriageScreen;
