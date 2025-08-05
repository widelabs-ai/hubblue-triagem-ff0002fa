
import React, { useState } from 'react';
import { useHospital, Patient } from '@/contexts/HospitalContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getPatientName, getPatientAge, getPatientGender } from '@/utils/patientUtils';

interface ConsultationData {
  diagnosis: string;
  treatment: string;
  nextStep: 'exam' | 'medication' | 'hospitalization' | 'inter-consultation' | 'discharge' | 'transfer';
  observations: string;
  examType?: string;
  medicationType?: string;
  hospitalizationType?: string;
  interConsultationSpecialty?: string;
  dischargeInstructions?: string;
  transferDestination?: string;
  prescription?: string;
}

const DoctorScreen: React.FC = () => {
  const { 
    patients, 
    updatePatientStatus, 
    getPatientsByStatus, 
    getPatientById, 
    getTimeElapsed, 
    isOverSLA 
  } = useHospital();
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    diagnosis: '',
    treatment: '',
    nextStep: 'discharge',
    observations: '',
    examType: '',
    medicationType: '',
    hospitalizationType: '',
    interConsultationSpecialty: '',
    dischargeInstructions: '',
    transferDestination: '',
    prescription: ''
  });

  const startConsultation = (patientId: string) => {
    const patient = getPatientById(patientId);
    if (patient) {
      updatePatientStatus(patientId, 'in-consultation');
      setSelectedPatient(patient);
      setIsFormOpen(true);
      
      // Reset consultation data
      setConsultationData({
        diagnosis: '',
        treatment: '',
        nextStep: 'discharge',
        observations: '',
        examType: '',
        medicationType: '',
        hospitalizationType: '',
        interConsultationSpecialty: '',
        dischargeInstructions: '',
        transferDestination: '',
        prescription: ''
      });
    }
  };

  const callPatientToPanel = (password: string) => {
    toast.success(`Senha ${password} chamada para o painel`);
  };

  const handleSubmit = () => {
    if (!selectedPatient) return;

    // Validation
    if (!consultationData.diagnosis.trim() || !consultationData.treatment.trim()) {
      toast.error('Por favor, preencha o diagnóstico e tratamento');
      return;
    }

    // Additional validation based on next step
    if (consultationData.nextStep === 'exam' && !consultationData.examType?.trim()) {
      toast.error('Por favor, especifique o tipo de exame');
      return;
    }

    if (consultationData.nextStep === 'medication' && !consultationData.medicationType?.trim()) {
      toast.error('Por favor, especifique o tipo de medicação');
      return;
    }

    if (consultationData.nextStep === 'hospitalization' && !consultationData.hospitalizationType?.trim()) {
      toast.error('Por favor, especifique o tipo de internação');
      return;
    }

    if (consultationData.nextStep === 'inter-consultation' && !consultationData.interConsultationSpecialty?.trim()) {
      toast.error('Por favor, especifique a especialidade para interconsulta');
      return;
    }

    if (consultationData.nextStep === 'discharge' && !consultationData.dischargeInstructions?.trim()) {
      toast.error('Por favor, preencha as instruções de alta');
      return;
    }

    if (consultationData.nextStep === 'transfer' && !consultationData.transferDestination?.trim()) {
      toast.error('Por favor, especifique o destino da transferência');
      return;
    }

    // Determine next status based on next step
    const statusMap: { [key: string]: Patient['status'] } = {
      'exam': 'waiting-exam',
      'medication': 'waiting-medication',
      'hospitalization': 'waiting-hospitalization',
      'inter-consultation': 'waiting-inter-consultation',
      'discharge': 'discharged',
      'transfer': 'waiting-transfer'
    };

    const nextStatus = statusMap[consultationData.nextStep];
    updatePatientStatus(selectedPatient.id, nextStatus, { consultationData });
    
    toast.success('Consulta médica finalizada com sucesso!');
    
    setIsFormOpen(false);
    setSelectedPatient(null);
  };

  const handleBack = () => {
    if (!selectedPatient) return;
    
    updatePatientStatus(selectedPatient.id, 'waiting-doctor');
    setIsFormOpen(false);
    setSelectedPatient(null);
    toast.info('Paciente retornado à fila médica');
  };

  const waitingPatients = getPatientsByStatus('waiting-doctor');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍⚕️ Consulta Médica</h1>
        <p className="text-gray-600">Avaliação e conduta médica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              ⏳ Aguardando Médico
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
              🩺 Em Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{getPatientsByStatus('in-consultation').length}</div>
            <p className="text-sm text-gray-600 mt-1">em atendimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              ✅ Consultados Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {patients.filter(p => 
                p.timestamps.consultationCompleted && 
                new Date(p.timestamps.consultationCompleted).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">pacientes atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👨‍⚕️ Fila Médica ({waitingPatients.length})
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
                  <TableHead>Convênio</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Queixa</TableHead>
                  <TableHead className="w-32">Tempo Aguardando</TableHead>
                  <TableHead className="w-48">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingPatients.map((patient) => {
                  const waitingTime = getTimeElapsed(patient, 'adminCompleted');
                  const sla = isOverSLA(patient);
                  
                  return (
                    <TableRow key={patient.id} className={sla.totalSLA ? 'bg-red-50' : ''}>
                      <TableCell className="font-bold">{patient.password}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {getPatientName(patient)}
                      </TableCell>
                      <TableCell>{getPatientAge(patient)}</TableCell>
                      <TableCell>{getPatientGender(patient)}</TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        {patient.personalData?.healthInsurance || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          patient.triageData?.priority === 'vermelho' ? 'destructive' :
                          patient.triageData?.priority === 'laranja' ? 'destructive' :
                          patient.triageData?.priority === 'amarelo' ? 'default' :
                          'secondary'
                        }>
                          {patient.triageData?.priority?.toUpperCase() || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {patient.triageData?.complaints || 'N/A'}
                      </TableCell>
                      <TableCell className={`font-medium ${sla.totalSLA ? 'text-red-600' : 'text-green-600'}`}>
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
                            onClick={() => startConsultation(patient.id)}
                          >
                            🩺 Iniciar Consulta
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {waitingPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Nenhum paciente aguardando consulta médica
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Consultation Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🩺 Consulta Médica - Senha {selectedPatient?.password}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="patient-info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient-info">Dados do Paciente</TabsTrigger>
              <TabsTrigger value="consultation">Consulta</TabsTrigger>
              <TabsTrigger value="conduct">Conduta</TabsTrigger>
            </TabsList>

            <TabsContent value="patient-info" className="space-y-4">
              {selectedPatient && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">👤 Dados Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Nome:</strong> {getPatientName(selectedPatient)}</p>
                      <p><strong>Idade:</strong> {getPatientAge(selectedPatient)} anos</p>
                      <p><strong>Gênero:</strong> {getPatientGender(selectedPatient)}</p>
                      <p><strong>CPF:</strong> {selectedPatient.personalData?.cpf || 'N/A'}</p>
                      <p><strong>Convênio:</strong> {selectedPatient.personalData?.healthInsurance || 'N/A'}</p>
                      <p><strong>Contato de Emergência:</strong> {selectedPatient.personalData?.emergencyContact || 'N/A'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">🩺 Dados da Triagem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Classificação:</strong> 
                        <Badge className="ml-2" variant={
                          selectedPatient.triageData?.priority === 'vermelho' ? 'destructive' :
                          selectedPatient.triageData?.priority === 'laranja' ? 'destructive' :
                          selectedPatient.triageData?.priority === 'amarelo' ? 'default' :
                          'secondary'
                        }>
                          {selectedPatient.triageData?.priority?.toUpperCase() || 'N/A'}
                        </Badge>
                      </p>
                      <p><strong>Queixa Principal:</strong> {selectedPatient.triageData?.complaints || 'N/A'}</p>
                      <p><strong>Sintomas:</strong> {selectedPatient.triageData?.symptoms || 'N/A'}</p>
                      <p><strong>Escala de Dor:</strong> {selectedPatient.triageData?.painScale || 'N/A'}</p>
                      <p><strong>Doenças Crônicas:</strong> {selectedPatient.triageData?.chronicDiseases || 'N/A'}</p>
                      <p><strong>Alergias:</strong> {selectedPatient.triageData?.allergies || 'N/A'}</p>
                      <p><strong>Medicações:</strong> {selectedPatient.triageData?.medications || 'N/A'}</p>
                    </CardContent>
                  </Card>

                  {selectedPatient.triageData?.vitals && Object.keys(selectedPatient.triageData.vitals).length > 0 && (
                    <Card className="md:col-span-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">📊 Sinais Vitais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {selectedPatient.triageData.vitals.bloodPressure && (
                            <p><strong>PA:</strong> {selectedPatient.triageData.vitals.bloodPressure}</p>
                          )}
                          {selectedPatient.triageData.vitals.heartRate && (
                            <p><strong>FC:</strong> {selectedPatient.triageData.vitals.heartRate} bpm</p>
                          )}
                          {selectedPatient.triageData.vitals.temperature && (
                            <p><strong>Temp:</strong> {selectedPatient.triageData.vitals.temperature}°C</p>
                          )}
                          {selectedPatient.triageData.vitals.oxygenSaturation && (
                            <p><strong>SpO2:</strong> {selectedPatient.triageData.vitals.oxygenSaturation}%</p>
                          )}
                          {selectedPatient.triageData.vitals.respiratoryRate && (
                            <p><strong>FR:</strong> {selectedPatient.triageData.vitals.respiratoryRate} irpm</p>
                          )}
                          {selectedPatient.triageData.vitals.glasgow && (
                            <p><strong>Glasgow:</strong> {selectedPatient.triageData.vitals.glasgow}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="consultation" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="diagnosis">Diagnóstico *</Label>
                  <Textarea
                    id="diagnosis"
                    value={consultationData.diagnosis}
                    onChange={(e) => setConsultationData({...consultationData, diagnosis: e.target.value})}
                    placeholder="Descreva o diagnóstico médico"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="treatment">Tratamento Realizado *</Label>
                  <Textarea
                    id="treatment"
                    value={consultationData.treatment}
                    onChange={(e) => setConsultationData({...consultationData, treatment: e.target.value})}
                    placeholder="Descreva o tratamento realizado"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="observations">Observações Médicas</Label>
                  <Textarea
                    id="observations"
                    value={consultationData.observations}
                    onChange={(e) => setConsultationData({...consultationData, observations: e.target.value})}
                    placeholder="Observações adicionais"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="conduct" className="space-y-4">
              <div>
                <Label htmlFor="nextStep">Conduta Médica *</Label>
                <Select value={consultationData.nextStep} onValueChange={(value: any) => setConsultationData({...consultationData, nextStep: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conduta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discharge">🏠 Alta Médica</SelectItem>
                    <SelectItem value="exam">🔬 Solicitar Exame</SelectItem>
                    <SelectItem value="medication">💊 Medicação</SelectItem>
                    <SelectItem value="hospitalization">🏥 Internação</SelectItem>
                    <SelectItem value="inter-consultation">👨‍⚕️ Interconsulta</SelectItem>
                    <SelectItem value="transfer">🚑 Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on next step */}
              {consultationData.nextStep === 'exam' && (
                <div>
                  <Label htmlFor="examType">Tipo de Exame *</Label>
                  <Select value={consultationData.examType} onValueChange={(value) => setConsultationData({...consultationData, examType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de exame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laboratorio">Exames Laboratoriais</SelectItem>
                      <SelectItem value="raio-x">Raio-X</SelectItem>
                      <SelectItem value="tomografia">Tomografia</SelectItem>
                      <SelectItem value="ultrassom">Ultrassom</SelectItem>
                      <SelectItem value="ressonancia">Ressonância Magnética</SelectItem>
                      <SelectItem value="eletrocardiograma">Eletrocardiograma</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {consultationData.nextStep === 'medication' && (
                <div>
                  <Label htmlFor="medicationType">Tipo de Medicação *</Label>
                  <Textarea
                    id="medicationType"
                    value={consultationData.medicationType}
                    onChange={(e) => setConsultationData({...consultationData, medicationType: e.target.value})}
                    placeholder="Descreva a medicação prescrita"
                    rows={3}
                  />
                </div>
              )}

              {consultationData.nextStep === 'hospitalization' && (
                <div>
                  <Label htmlFor="hospitalizationType">Tipo de Internação *</Label>
                  <Select value={consultationData.hospitalizationType} onValueChange={(value) => setConsultationData({...consultationData, hospitalizationType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de internação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observacao">Observação</SelectItem>
                      <SelectItem value="clinica">Clínica Médica</SelectItem>
                      <SelectItem value="cirurgica">Cirúrgica</SelectItem>
                      <SelectItem value="uti">UTI</SelectItem>
                      <SelectItem value="semi-intensiva">Semi-Intensiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {consultationData.nextStep === 'inter-consultation' && (
                <div>
                  <Label htmlFor="interConsultationSpecialty">Especialidade para Interconsulta *</Label>
                  <Select value={consultationData.interConsultationSpecialty} onValueChange={(value) => setConsultationData({...consultationData, interConsultationSpecialty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiologia">Cardiologia</SelectItem>
                      <SelectItem value="neurologia">Neurologia</SelectItem>
                      <SelectItem value="ortopedia">Ortopedia</SelectItem>
                      <SelectItem value="cirurgia-geral">Cirurgia Geral</SelectItem>
                      <SelectItem value="psiquiatria">Psiquiatria</SelectItem>
                      <SelectItem value="ginecologia">Ginecologia</SelectItem>
                      <SelectItem value="pediatria">Pediatria</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {consultationData.nextStep === 'discharge' && (
                <div>
                  <Label htmlFor="dischargeInstructions">Instruções de Alta *</Label>
                  <Textarea
                    id="dischargeInstructions"
                    value={consultationData.dischargeInstructions}
                    onChange={(e) => setConsultationData({...consultationData, dischargeInstructions: e.target.value})}
                    placeholder="Instruções para alta médica, medicações, retorno, etc."
                    rows={4}
                  />
                </div>
              )}

              {consultationData.nextStep === 'transfer' && (
                <div>
                  <Label htmlFor="transferDestination">Destino da Transferência *</Label>
                  <Textarea
                    id="transferDestination"
                    value={consultationData.transferDestination}
                    onChange={(e) => setConsultationData({...consultationData, transferDestination: e.target.value})}
                    placeholder="Hospital ou serviço de destino e motivo da transferência"
                    rows={3}
                  />
                </div>
              )}

              {(consultationData.nextStep === 'discharge' || consultationData.nextStep === 'medication') && (
                <div>
                  <Label htmlFor="prescription">Prescrição Médica</Label>
                  <Textarea
                    id="prescription"
                    value={consultationData.prescription}
                    onChange={(e) => setConsultationData({...consultationData, prescription: e.target.value})}
                    placeholder="Medicamentos prescritos com posologia"
                    rows={4}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleBack}>
              ← Voltar à Fila
            </Button>
            <Button onClick={handleSubmit}>
              ✅ Finalizar Consulta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorScreen;
