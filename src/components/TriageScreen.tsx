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
import { ArrowLeft, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TriageChat from './TriageChat';
import CancellationModal from './CancellationModal';
import VitalSignInput from './VitalSignInput';
import SearchableSelect from './SearchableSelect';
import BloodPressureInput from './BloodPressureInput';
import { 
  validateHeartRate, 
  validateTemperature, 
  validateOxygenSaturation, 
  validateBloodPressure,
  validateRespiratoryRate,
  validateGlasgow,
  validateGlucose,
  calculatePAM,
  VITAL_RANGES
} from '@/utils/vitalsValidation';

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, cancelPatient, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [hasPerformedAnalysis, setHasPerformedAnalysis] = useState(false);
  const [triageData, setTriageData] = useState({
    priority: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      respiratoryRate: '',
      glasgow: '',
      glucose: ''
    },
    personalData: {
      fullName: '',
      dateOfBirth: '',
      gender: ''
    },
    complaints: '',
    painScale: '',
    symptoms: '',
    chronicDiseases: '',
    allergies: [] as string[],
    medications: [] as string[],
    observations: ''
  });

  // Lista de medicamentos comuns com dosagens
  const commonMedications = [
    'Dipirona 500mg',
    'Paracetamol 750mg',
    'Ibuprofeno 600mg',
    'Omeprazol 20mg',
    'Losartana 50mg',
    'Atenolol 25mg',
    'Metformina 850mg',
    'Sinvastatina 20mg',
    'Amlodipina 5mg',
    'Captopril 25mg',
    'Hidroclorotiazida 25mg',
    'Ácido Acetilsalicílico 100mg',
    'Levotiroxina 50mcg',
    'Clonazepam 2mg',
    'Fluoxetina 20mg',
    'Sertralina 50mg',
    'Insulina NPH',
    'Insulina Regular',
    'Glibenclamida 5mg',
    'Prednisona 20mg'
  ];

  // Lista de alergias comuns
  const commonAllergies = [
    'Penicilina',
    'Dipirona',
    'Ácido Acetilsalicílico (AAS)',
    'Sulfa',
    'Iodo',
    'Látex',
    'Amendoim',
    'Frutos do mar',
    'Leite e derivados',
    'Ovo',
    'Soja',
    'Glúten',
    'Corante alimentar',
    'Poeira',
    'Pólen',
    'Pelo de animais',
    'Ácaros',
    'Picada de insetos',
    'Contraste radiológico',
    'Anestésicos'
  ];

  const navigate = useNavigate();
  const waitingPatients = getPatientsByStatus('waiting-triage').sort((a, b) => {
    // Primeiro ordena por tempo de espera (mais tempo primeiro)
    const timeA = getTimeElapsed(a, 'generated');
    const timeB = getTimeElapsed(b, 'generated');
    return timeB - timeA;
  });
  const currentPatient = getPatientsByStatus('in-triage')[0];

  // Calcular idade a partir da data de nascimento
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

  // Calcular PAM automaticamente
  const calculatedPAM = calculatePAM(triageData.vitals.bloodPressure);
  const calculatedAge = calculateAge(triageData.personalData.dateOfBirth);

  // Função para verificar se os campos obrigatórios estão preenchidos
  const isFormComplete = () => {
    const { personalData, vitals } = triageData;
    return (
      personalData.fullName.trim() !== '' &&
      personalData.dateOfBirth !== '' &&
      personalData.gender !== '' &&
      triageData.complaints.trim() !== '' &&
      triageData.symptoms.trim() !== '' &&
      triageData.painScale !== '' &&
      vitals.bloodPressure.trim() !== '' &&
      vitals.heartRate.trim() !== '' &&
      vitals.temperature.trim() !== '' &&
      vitals.oxygenSaturation.trim() !== '' &&
      vitals.respiratoryRate.trim() !== '' &&
      vitals.glasgow.trim() !== '' &&
      vitals.glucose.trim() !== ''
    );
  };

  // Função para calcular classificação automática baseada no protocolo Manchester
  const calculateAutomaticPriority = (data: typeof triageData) => {
    const { complaints, symptoms, vitals, painScale } = data;
    
    if (!complaints && !symptoms) return '';

    const heartRate = parseInt(vitals.heartRate) || 0;
    const temp = parseFloat(vitals.temperature) || 0;
    const saturation = parseInt(vitals.oxygenSaturation) || 100;
    const pain = parseInt(painScale) || 0;
    const complaintsLower = complaints.toLowerCase();
    const symptomsLower = symptoms.toLowerCase();

    // Critérios para VERMELHO (Emergência)
    if (saturation < 85 || heartRate > 150 || heartRate < 40) {
      return 'vermelho';
    }
    
    if (complaintsLower.includes('dor no peito') || complaintsLower.includes('precordial')) {
      if (heartRate > 150 || saturation < 90 || pain >= 8) {
        return 'vermelho';
      }
    }

    // Critérios para LARANJA (Muito urgente)
    if (temp > 39.5 || (temp > 38.5 && (heartRate > 120 || saturation < 92))) {
      return 'laranja';
    }
    
    if (complaintsLower.includes('dor no peito') || complaintsLower.includes('precordial')) {
      if (pain >= 6 || heartRate > 100) {
        return 'laranja';
      }
    }
    
    if (pain >= 8 || temp > 38.5 || heartRate > 120 || saturation < 92) {
      return 'laranja';
    }

    // Critérios para AMARELO (Urgente)
    if (complaintsLower.includes('dor no peito') || complaintsLower.includes('precordial')) {
      return 'amarelo';
    }
    
    if (pain >= 5 || temp > 37.8 || symptomsLower.includes('vômito') || symptomsLower.includes('diarréia')) {
      return 'amarelo';
    }

    // Critérios para VERDE (Pouco urgente)
    if (pain >= 2 || temp > 37.2) {
      return 'verde';
    }

    // Padrão AZUL (Não urgente)
    return 'azul';
  };

  // Atualizar classificação automaticamente quando os campos mudarem
  useEffect(() => {
    const automaticPriority = calculateAutomaticPriority(triageData);
    if (automaticPriority && automaticPriority !== triageData.priority) {
      setTriageData(prev => ({ ...prev, priority: automaticPriority }));
    }
  }, [triageData.complaints, triageData.symptoms, triageData.vitals, triageData.painScale]);

  // Validação dos sinais vitais
  const vitalsValidation = {
    heartRate: validateHeartRate(triageData.vitals.heartRate),
    temperature: validateTemperature(triageData.vitals.temperature),
    oxygenSaturation: validateOxygenSaturation(triageData.vitals.oxygenSaturation),
    bloodPressure: validateBloodPressure(triageData.vitals.bloodPressure),
    respiratoryRate: validateRespiratoryRate(triageData.vitals.respiratoryRate),
    glasgow: validateGlasgow(triageData.vitals.glasgow),
    glucose: validateGlucose(triageData.vitals.glucose)
  };

  // Verificar se há erros de validação
  const hasValidationErrors = Object.values(vitalsValidation).some(v => !v.isValid);

  // Funções para adicionar/remover alergias e medicamentos
  const addAllergy = (allergy: string) => {
    if (allergy && !triageData.allergies.includes(allergy)) {
      setTriageData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
    }
  };

  const removeAllergy = (allergy: string) => {
    setTriageData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const addMedication = (medication: string) => {
    if (medication && !triageData.medications.includes(medication)) {
      setTriageData(prev => ({
        ...prev,
        medications: [...prev.medications, medication]
      }));
    }
  };

  const removeMedication = (medication: string) => {
    setTriageData(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m !== medication)
    }));
  };

  const handleCallPatient = (patientId: string) => {
    console.log('Chamando paciente:', patientId);
    updatePatientStatus(patientId, 'in-triage');
    setIsDialogOpen(true);
    setHasPerformedAnalysis(false); // Reset da análise
    toast({
      title: "Paciente chamado",
      description: "Paciente está sendo atendido na triagem.",
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

  const handleCancelPatient = (reason: string) => {
    if (currentPatient) {
      cancelPatient(currentPatient.id, reason);
      resetTriageData();
      setIsDialogOpen(false);
      setIsCancellationModalOpen(false);
      toast({
        title: "Paciente cancelado",
        description: "Atendimento foi cancelado com sucesso.",
      });
    }
  };

  const resetTriageData = () => {
    setTriageData({
      priority: '',
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        respiratoryRate: '',
        glasgow: '',
        glucose: ''
      },
      personalData: {
        fullName: '',
        dateOfBirth: '',
        gender: ''
      },
      complaints: '',
      painScale: '',
      symptoms: '',
      chronicDiseases: '',
      allergies: [],
      medications: [],
      observations: ''
    });
    setHasPerformedAnalysis(false);
  };

  const handleSuggestPriority = (priority: string, reasoning: string) => {
    setTriageData(prev => ({ ...prev, priority }));
    toast({
      title: "Classificação sugerida",
      description: `${getPriorityText(priority)} - ${reasoning}`,
      duration: 5000,
    });
  };

  // Função para revisar (apenas triggerar análise da LIA)
  const handleReview = () => {
    if (!currentPatient || !triageData.priority || !triageData.complaints) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha pelo menos a prioridade e as queixas principais.",
        variant: "destructive"
      });
      return;
    }

    if (hasValidationErrors) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os valores dos sinais vitais antes de revisar.",
        variant: "destructive"
      });
      return;
    }

    // Trigger análise da LIA
    if (isFormComplete() && !hasPerformedAnalysis) {
      setHasPerformedAnalysis(true);
      toast({
        title: "Revisão iniciada",
        description: "A LIA está analisando os dados do paciente.",
      });
    } else {
      toast({
        title: "Revisão já realizada",
        description: "Os dados já foram analisados pela LIA.",
      });
    }
  };

  // Função para concluir triagem
  const handleCompleteTriagem = () => {
    if (!currentPatient || !triageData.priority || !triageData.complaints) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha pelo menos a prioridade e as queixas principais.",
        variant: "destructive"
      });
      return;
    }

    if (hasValidationErrors) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os valores dos sinais vitais antes de concluir.",
        variant: "destructive"
      });
      return;
    }

    // Concluir triagem
    updatePatientStatus(currentPatient.id, 'waiting-admin', { triageData });
    resetTriageData();
    setIsDialogOpen(false);
    
    toast({
      title: "Triagem concluída",
      description: "Paciente encaminhado para o administrativo.",
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'vermelho': return '🔴 Vermelho - Emergência (imediato)';
      case 'laranja': return '🟠 Laranja - Muito urgente (10 min)';
      case 'amarelo': return '🟡 Amarelo - Urgente (60 min)';
      case 'verde': return '🟢 Verde - Pouco urgente (120 min)';
      case 'azul': return '🔵 Azul - Não urgente (240 min)';
      default: return priority;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">🩺 Sistema de Triagem - Protocolo Manchester</CardTitle>
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
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="w-32">Tempo Aguardando</TableHead>
                    <TableHead className="w-32">Status SLA</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <TableRow 
                        key={patient.id}
                        className={`${
                          slaStatus.triageSLA ? 'bg-red-50 border-red-200' : 
                          timeWaiting > 7 ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <TableCell className="font-bold">{patient.password}</TableCell>
                        <TableCell className="capitalize">
                          {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className={`font-medium ${
                          slaStatus.triageSLA ? 'text-red-600' : 
                          timeWaiting > 7 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {timeWaiting} min
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            slaStatus.triageSLA ? 'bg-red-100 text-red-800' : 
                            timeWaiting > 7 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {slaStatus.triageSLA ? 'Atrasado' : timeWaiting > 7 ? 'Atenção' : 'No prazo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => handleCallPatient(patient.id)}
                            disabled={!!currentPatient}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Chamar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        }
      }}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Triagem em Andamento</DialogTitle>
              <Button variant="ghost" onClick={handleCloseDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {currentPatient && (
            <div className="flex h-[calc(98vh-120px)]">
              {/* Formulário de Triagem - layout melhorado */}
              <div className="w-2/3 overflow-y-auto p-6 pt-0">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-bold text-xl">{currentPatient.password}</div>
                    <div className="text-gray-600 capitalize">
                      {currentPatient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tempo na triagem: {getTimeElapsed(currentPatient, 'triageStarted')} min
                    </div>
                  </div>

                  {/* Dados Pessoais */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Dados Pessoais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <Label className="text-sm">Nome Completo *</Label>
                        <Input
                          placeholder="Nome completo do paciente"
                          value={triageData.personalData.fullName}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            personalData: {...triageData.personalData, fullName: e.target.value}
                          })}
                          className="text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Data de Nascimento *</Label>
                        <Input
                          type="date"
                          value={triageData.personalData.dateOfBirth}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            personalData: {...triageData.personalData, dateOfBirth: e.target.value}
                          })}
                          className="text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Idade</Label>
                        <Input
                          value={calculatedAge > 0 ? `${calculatedAge} anos` : ''}
                          readOnly
                          className="bg-gray-100 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mt-3">
                      <div>
                        <Label className="text-sm">Sexo *</Label>
                        <Select 
                          value={triageData.personalData.gender} 
                          onValueChange={(value) => setTriageData({
                            ...triageData, 
                            personalData: {...triageData.personalData, gender: value}
                          })}
                          required
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Selecione o sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Layout em duas colunas para melhor aproveitamento */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Coluna esquerda */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Queixas Principais *</Label>
                        <Textarea
                          placeholder="Descreva o motivo da consulta..."
                          value={triageData.complaints}
                          onChange={(e) => setTriageData({...triageData, complaints: e.target.value})}
                          rows={3}
                          className="text-sm"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Sintomas Apresentados *</Label>
                        <Textarea
                          placeholder="Febre, náusea, tontura, etc..."
                          value={triageData.symptoms}
                          onChange={(e) => setTriageData({...triageData, symptoms: e.target.value})}
                          rows={3}
                          className="text-sm"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Doenças Crônicas e Comorbidades</Label>
                        <Textarea
                          placeholder="Diabetes, hipertensão, doença de Crohn, etc... (opcional)"
                          value={triageData.chronicDiseases}
                          onChange={(e) => setTriageData({...triageData, chronicDiseases: e.target.value})}
                          rows={3}
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Alergias com lista suspensa */}
                        <SearchableSelect
                          label="Alergias Conhecidas"
                          options={commonAllergies}
                          selectedItems={triageData.allergies}
                          onAddItem={(allergy) => setTriageData(prev => ({
                            ...prev,
                            allergies: [...prev.allergies, allergy]
                          }))}
                          onRemoveItem={(allergy) => setTriageData(prev => ({
                            ...prev,
                            allergies: prev.allergies.filter(a => a !== allergy)
                          }))}
                          placeholder="Digite para buscar ou adicionar alergia... (opcional)"
                        />

                        {/* Medicamentos com lista suspensa */}
                        <SearchableSelect
                          label="Medicamentos em Uso"
                          options={commonMedications}
                          selectedItems={triageData.medications}
                          onAddItem={(medication) => setTriageData(prev => ({
                            ...prev,
                            medications: [...prev.medications, medication]
                          }))}
                          onRemoveItem={(medication) => setTriageData(prev => ({
                            ...prev,
                            medications: prev.medications.filter(m => m !== medication)
                          }))}
                          placeholder="Digite para buscar ou adicionar medicamento... (opcional)"
                        />
                      </div>
                    </div>

                    {/* Coluna direita */}
                    <div className="space-y-4">
                      {/* Sinais Vitais */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 text-sm">Sinais Vitais *</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <BloodPressureInput
                            label="Pressão Arterial *"
                            value={triageData.vitals.bloodPressure}
                            onChange={(value) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, bloodPressure: value}
                            })}
                            placeholder="120x80"
                            unit="mmHg"
                            validation={vitalsValidation.bloodPressure}
                            size="sm"
                            required
                          />
                          <div>
                            <Label className="text-xs font-medium">PAM (Calculado)</Label>
                            <Input
                              value={calculatedPAM ? `${calculatedPAM} mmHg` : ''}
                              readOnly
                              className="bg-gray-100 text-xs h-8"
                              placeholder="Automático"
                            />
                          </div>
                          <VitalSignInput
                            label="Frequência Cardíaca *"
                            value={triageData.vitals.heartRate}
                            onChange={(value) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, heartRate: value}
                            })}
                            placeholder="70"
                            unit="bpm"
                            validation={vitalsValidation.heartRate}
                            size="sm"
                            required
                          />
                          <VitalSignInput
                            label="Freq. Respiratória *"
                            value={triageData.vitals.respiratoryRate}
                            onChange={(value) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, respiratoryRate: value}
                            })}
                            placeholder="16"
                            unit="rpm"
                            validation={vitalsValidation.respiratoryRate}
                            size="sm"
                            required
                          />
                          <VitalSignInput
                            label="Temperatura *"
                            value={triageData.vitals.temperature}
                            onChange={(value) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, temperature: value}
                            })}
                            placeholder="36.5"
                            unit="°C"
                            validation={vitalsValidation.temperature}
                            size="sm"
                            required
                          />
                          <VitalSignInput
                            label="Saturação O₂ *"
                            value={triageData.vitals.oxygenSaturation}
                            onChange={(value) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, oxygenSaturation: value}
                            })}
                            placeholder="98"
                            unit="%"
                            validation={vitalsValidation.oxygenSaturation}
                            size="sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Tríade Clínica */}
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 text-sm">Tríade de Avaliação Clínica *</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium">Escala de Dor (0-10) *</Label>
                            <Select 
                              value={triageData.painScale} 
                              onValueChange={(value) => setTriageData({...triageData, painScale: value})}
                              required
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Nível de dor" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(11)].map((_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i} - {i === 0 ? 'Sem dor' : i <= 3 ? 'Leve' : i <= 6 ? 'Moderada' : 'Intensa'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <VitalSignInput
                              label="Glasgow *"
                              value={triageData.vitals.glasgow}
                              onChange={(value) => setTriageData({
                                ...triageData, 
                                vitals: {...triageData.vitals, glasgow: value}
                              })}
                              placeholder="15"
                              unit="pts"
                              validation={vitalsValidation.glasgow}
                              size="sm"
                              required
                            />
                            <VitalSignInput
                              label="Glicemia *"
                              value={triageData.vitals.glucose}
                              onChange={(value) => setTriageData({
                                ...triageData, 
                                vitals: {...triageData.vitals, glucose: value}
                              })}
                              placeholder="90"
                              unit="mg/dL"
                              validation={vitalsValidation.glucose}
                              size="sm"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Observações</Label>
                        <Textarea
                          placeholder="Informações adicionais relevantes... (opcional)"
                          value={triageData.observations}
                          onChange={(e) => setTriageData({...triageData, observations: e.target.value})}
                          rows={3}
                          className="text-sm"
                        />
                      </div>

                      {/* Campo de classificação */}
                      <div className="border-t pt-4">
                        <Label className="text-sm font-medium">Classificação de Risco (Manchester) *</Label>
                        <Select 
                          value={triageData.priority} 
                          onValueChange={(value) => setTriageData({...triageData, priority: value})}
                          required
                        >
                          <SelectTrigger className={`${getPriorityColor(triageData.priority)} font-medium text-sm`}>
                            <SelectValue placeholder="Classificação automática" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="azul">🔵 Azul - Não urgente (240 min)</SelectItem>
                            <SelectItem value="verde">🟢 Verde - Pouco urgente (120 min)</SelectItem>
                            <SelectItem value="amarelo">🟡 Amarelo - Urgente (60 min)</SelectItem>
                            <SelectItem value="laranja">🟠 Laranja - Muito urgente (10 min)</SelectItem>
                            <SelectItem value="vermelho">🔴 Vermelho - Emergência (imediato)</SelectItem>
                          </SelectContent>
                        </Select>
                        {triageData.priority && (
                          <div className={`text-xs mt-2 font-medium ${getPriorityColor(triageData.priority)}`}>
                            {getPriorityText(triageData.priority)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleReturnToQueue} size="sm">
                      Voltar à Fila
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCancellationModalOpen(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      size="sm"
                    >
                      Cancelar Paciente
                    </Button>
                    <Button variant="outline" onClick={handleCloseDialog} size="sm">
                      Fechar
                    </Button>
                    <Button 
                      onClick={handleReview}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={hasValidationErrors}
                      size="sm"
                    >
                      Revisar com LIA
                    </Button>
                    <Button 
                      onClick={handleCompleteTriagem}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={hasValidationErrors}
                      size="sm"
                    >
                      Concluir Triagem
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat da LIA com scroll adicionado */}
              <div className="w-1/3 border-l border-gray-200 overflow-hidden">
                <TriageChat 
                  triageData={triageData} 
                  onSuggestPriority={handleSuggestPriority}
                  onCompleteTriagem={() => {
                    // Complete triage after analysis is done
                    updatePatientStatus(currentPatient.id, 'waiting-admin', { triageData });
                    resetTriageData();
                    setIsDialogOpen(false);
                    
                    toast({
                      title: "Triagem concluída",
                      description: "Paciente encaminhado para o administrativo.",
                    });
                  }}
                  isDialogOpen={isDialogOpen}
                  isFormComplete={isFormComplete()}
                  hasPerformedAnalysis={hasPerformedAnalysis}
                  onAnalysisPerformed={() => setHasPerformedAnalysis(true)}
                />
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

export default TriageScreen;
