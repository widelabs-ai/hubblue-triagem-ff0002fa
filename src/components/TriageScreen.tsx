import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus, MessageSquare } from 'lucide-react';
import { useHospital, Patient } from '@/contexts/HospitalContext';
import VitalSignInput from './VitalSignInput';
import TriageChat from './TriageChat';
import { 
  validateHeartRate, 
  validateTemperature, 
  validateOxygenSaturation, 
  validateBloodPressure,
  validateRespiratoryRate,
  validateGlasgow,
  validateGlucose 
} from '@/utils/vitalsValidation';

interface Medication {
  name: string;
  dosage: string;
}

const COMMON_ALLERGIES = [
  'Penicilina',
  'Aspirina',
  'Dipirona',
  'Látex',
  'Mariscos',
  'Amendoim',
  'Nozes',
  'Leite',
  'Ovos',
  'Soja',
  'Trigo',
  'Picadas de insetos',
  'Pólen',
  'Mofo',
  'Pelo de animais'
];

const COMMON_MEDICATIONS = [
  { name: 'Paracetamol', dosage: '500mg' },
  { name: 'Ibuprofeno', dosage: '400mg' },
  { name: 'Amoxicilina', dosage: '500mg' },
  { name: 'Omeprazol', dosage: '20mg' },
  { name: 'Losartana', dosage: '50mg' },
  { name: 'Sinvastatina', dosage: '20mg' },
  { name: 'Metformina', dosage: '500mg' },
  { name: 'Captopril', dosage: '25mg' },
  { name: 'AAS', dosage: '100mg' },
  { name: 'Dipirona', dosage: '500mg' }
];

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus } = useHospital();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [complaints, setComplaints] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [painScale, setPainScale] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [glasgow, setGlasgow] = useState('');
  const [glucose, setGlucose] = useState('');
  const [observations, setObservations] = useState('');
  const [priority, setPriority] = useState('');

  // Autocomplete states for allergies and medications
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [showAllergyDropdown, setShowAllergyDropdown] = useState(false);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);

  const waitingTriagePatients = getPatientsByStatus('waiting-triage');

  const filteredAllergies = COMMON_ALLERGIES.filter(allergy =>
    allergy.toLowerCase().includes(allergyInput.toLowerCase()) &&
    !allergies.includes(allergy)
  );

  const filteredMedications = COMMON_MEDICATIONS.filter(med =>
    med.name.toLowerCase().includes(medicationInput.toLowerCase()) &&
    !medications.some(m => m.name === med.name)
  );

  useEffect(() => {
    if (selectedPatient) {
      setFullName(selectedPatient.personalData?.fullName || '');
      setDateOfBirth(selectedPatient.personalData?.dateOfBirth || '');
      setGender(selectedPatient.personalData?.gender || '');
    }
  }, [selectedPatient]);

  const startTriage = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowTriageForm(true);
  };

  const applyBloodPressureMask = (value: string) => {
    // Remove all non-numeric characters except 'x'
    let cleaned = value.replace(/[^\dx]/g, '');
    
    // Add 'x' after 2-3 digits if not present
    if (cleaned.length > 3) {
      cleaned = cleaned.slice(0, 3) + 'x' + cleaned.slice(3, 5);
    } else if (cleaned.length > 2 && !value.includes('x')) {
      cleaned = cleaned.slice(0, 2) + 'x' + cleaned.slice(2);
    }
    
    return cleaned;
  };

  const handleBloodPressureChange = (value: string) => {
    const masked = applyBloodPressureMask(value);
    setBloodPressure(masked);
  };

  // Check if form is complete for analysis
  const isFormComplete = () => {
    return (
      fullName.trim() !== '' &&
      dateOfBirth !== '' &&
      gender !== '' &&
      complaints.trim() !== '' &&
      symptoms.trim() !== '' &&
      chronicDiseases.trim() !== '' &&
      allergies.length > 0 &&
      medications.length > 0 &&
      painScale !== '' &&
      bloodPressure.trim() !== '' &&
      heartRate.trim() !== '' &&
      temperature.trim() !== '' &&
      oxygenSaturation.trim() !== '' &&
      respiratoryRate.trim() !== '' &&
      glasgow.trim() !== '' &&
      glucose.trim() !== '' &&
      observations.trim() !== ''
    );
  };

  // Effect to trigger analysis only once when form becomes complete
  useEffect(() => {
    if (isFormComplete() && !hasAnalyzed) {
      setHasAnalyzed(true);
    }
  }, [fullName, dateOfBirth, gender, complaints, symptoms, chronicDiseases, allergies, medications, painScale, bloodPressure, heartRate, temperature, oxygenSaturation, respiratoryRate, glasgow, glucose, observations, hasAnalyzed]);

  const addAllergy = (allergy: string) => {
    if (allergy && !allergies.includes(allergy)) {
      setAllergies([...allergies, allergy]);
      setAllergyInput('');
      setShowAllergyDropdown(false);
    }
  };

  const addMedication = (medication: { name: string; dosage: string }) => {
    if (medication.name && !medications.some(m => m.name === medication.name)) {
      setMedications([...medications, medication]);
      setMedicationInput('');
      setShowMedicationDropdown(false);
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter(allergy => allergy !== allergyToRemove));
  };

  const removeMedication = (medicationToRemove: string) => {
    setMedications(medications.filter(med => med.name !== medicationToRemove));
  };

  const resetForm = () => {
    setFullName('');
    setDateOfBirth('');
    setGender('');
    setComplaints('');
    setSymptoms('');
    setChronicDiseases('');
    setAllergies([]);
    setMedications([]);
    setPainScale('');
    setBloodPressure('');
    setHeartRate('');
    setTemperature('');
    setOxygenSaturation('');
    setRespiratoryRate('');
    setGlasgow('');
    setGlucose('');
    setObservations('');
    setPriority('');
    setHasAnalyzed(false);
  };

  const handleSubmit = () => {
    if (!selectedPatient) return;

    const personalData = {
      fullName,
      dateOfBirth,
      gender
    };

    const triageData = {
      priority,
      complaints,
      symptoms,
      painScale,
      vitals: {
        bloodPressure,
        heartRate,
        temperature,
        oxygenSaturation,
        respiratoryRate,
        glasgow,
        glucose
      },
      chronicDiseases,
      allergies,
      medications,
      observations
    };

    updatePatientStatus(selectedPatient.id, 'waiting-admin', { personalData, triageData });
    setShowTriageForm(false);
  };

  const handleChatSuggestPriority = (priority: string, reasoning: string) => {
    setPriority(priority);
  };

  const handleCompleteTriagem = () => {
    setShowChat(false);
    handleSubmit();
  };

  if (showTriageForm && selectedPatient) {
    const triageData = {
      priority,
      vitals: {
        bloodPressure,
        heartRate,
        temperature,
        oxygenSaturation,
        respiratoryRate,
        glasgow,
        glucose
      },
      personalData: {
        fullName,
        dateOfBirth,
        gender
      },
      complaints,
      painScale,
      symptoms,
      chronicDiseases,
      allergies,
      medications,
      observations
    };

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Triagem - {selectedPatient.password}
              </h1>
              <p className="text-gray-600">Telefone: {selectedPatient.phone}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowChat(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Consultar LIA
              </Button>
              <Button variant="outline" onClick={() => setShowTriageForm(false)}>
                Voltar
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Data Section */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gender">Sexo *</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Data Section */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Clínicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="complaints">Queixa Principal *</Label>
                  <Textarea
                    id="complaints"
                    value={complaints}
                    onChange={(e) => setComplaints(e.target.value)}
                    placeholder="Descreva a queixa principal do paciente"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="symptoms">Sintomas Associados *</Label>
                  <Textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Descreva os sintomas associados"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="chronicDiseases">Doenças Crônicas *</Label>
                  <Textarea
                    id="chronicDiseases"
                    value={chronicDiseases}
                    onChange={(e) => setChronicDiseases(e.target.value)}
                    placeholder="Liste as doenças crônicas conhecidas"
                    required
                  />
                </div>

                <div>
                  <Label>Alergias Conhecidas *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        value={allergyInput}
                        onChange={(e) => {
                          setAllergyInput(e.target.value);
                          setShowAllergyDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowAllergyDropdown(allergyInput.length > 0)}
                        onBlur={() => setTimeout(() => setShowAllergyDropdown(false), 200)}
                        placeholder="Digite para buscar alergias..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (allergyInput.trim()) {
                              addAllergy(allergyInput.trim());
                            }
                          }
                        }}
                      />
                      {showAllergyDropdown && filteredAllergies.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredAllergies.map((allergy) => (
                            <div
                              key={allergy}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => addAllergy(allergy)}
                            >
                              {allergy}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allergies.map((allergy) => (
                        <Badge key={allergy} variant="secondary" className="flex items-center gap-1">
                          {allergy}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeAllergy(allergy)} />
                        </Badge>
                      ))}
                    </div>
                    {allergies.length === 0 && (
                      <p className="text-sm text-red-600">Pelo menos uma alergia deve ser informada</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Medicamentos em Uso *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        value={medicationInput}
                        onChange={(e) => {
                          setMedicationInput(e.target.value);
                          setShowMedicationDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowMedicationDropdown(medicationInput.length > 0)}
                        onBlur={() => setTimeout(() => setShowMedicationDropdown(false), 200)}
                        placeholder="Digite para buscar medicamentos..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (medicationInput.trim()) {
                              addMedication({ name: medicationInput.trim(), dosage: 'Conforme prescrição' });
                            }
                          }
                        }}
                      />
                      {showMedicationDropdown && filteredMedications.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredMedications.map((med) => (
                            <div
                              key={med.name}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => addMedication(med)}
                            >
                              <div className="font-medium">{med.name}</div>
                              <div className="text-sm text-gray-600">{med.dosage}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {medications.map((med) => (
                        <Badge key={med.name} variant="secondary" className="flex items-center gap-1">
                          <div>
                            <div className="font-medium">{med.name}</div>
                            <div className="text-xs">{med.dosage}</div>
                          </div>
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeMedication(med.name)} />
                        </Badge>
                      ))}
                    </div>
                    {medications.length === 0 && (
                      <p className="text-sm text-red-600">Pelo menos um medicamento deve ser informado</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="painScale">Escala de Dor (0-10) *</Label>
                  <Select value={painScale} onValueChange={setPainScale} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a intensidade da dor" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(11)].map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i} - {i === 0 ? 'Sem dor' : i <= 3 ? 'Leve' : i <= 6 ? 'Moderada' : i <= 8 ? 'Intensa' : 'Insuportável'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Sinais Vitais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bloodPressure">Pressão Arterial *</Label>
                    <Input
                      id="bloodPressure"
                      value={bloodPressure}
                      onChange={(e) => handleBloodPressureChange(e.target.value)}
                      placeholder="120x80"
                      className={validateBloodPressure(bloodPressure).isValid ? '' : 'border-red-500 bg-red-50'}
                      required
                    />
                    {!validateBloodPressure(bloodPressure).isValid && validateBloodPressure(bloodPressure).message && (
                      <div className="text-sm text-red-600 mt-1">
                        {validateBloodPressure(bloodPressure).message}
                      </div>
                    )}
                  </div>

                  <VitalSignInput
                    label="Frequência Cardíaca"
                    value={heartRate}
                    onChange={setHeartRate}
                    placeholder="80"
                    unit="bpm"
                    validation={validateHeartRate(heartRate)}
                    size="sm"
                    required={true}
                  />

                  <VitalSignInput
                    label="Temperatura"
                    value={temperature}
                    onChange={setTemperature}
                    placeholder="36.5"
                    unit="°C"
                    validation={validateTemperature(temperature)}
                    size="sm"
                    required={true}
                  />

                  <VitalSignInput
                    label="Saturação O₂"
                    value={oxygenSaturation}
                    onChange={setOxygenSaturation}
                    placeholder="98"
                    unit="%"
                    validation={validateOxygenSaturation(oxygenSaturation)}
                    size="sm"
                    required={true}
                  />

                  <VitalSignInput
                    label="Freq. Respiratória"
                    value={respiratoryRate}
                    onChange={setRespiratoryRate}
                    placeholder="16"
                    unit="rpm"
                    validation={validateRespiratoryRate(respiratoryRate)}
                    size="sm"
                    required={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <VitalSignInput
                    label="Escala de Glasgow"
                    value={glasgow}
                    onChange={setGlasgow}
                    placeholder="15"
                    unit="pts"
                    validation={validateGlasgow(glasgow)}
                    size="sm"
                    required={true}
                  />

                  <VitalSignInput
                    label="Glicemia"
                    value={glucose}
                    onChange={setGlucose}
                    placeholder="90"
                    unit="mg/dL"
                    validation={validateGlucose(glucose)}
                    size="sm"
                    required={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Classification Section */}
            <Card>
              <CardHeader>
                <CardTitle>Classificação de Risco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vermelho">🔴 Vermelho - Emergência</SelectItem>
                      <SelectItem value="laranja">🟠 Laranja - Muito urgente</SelectItem>
                      <SelectItem value="amarelo">🟡 Amarelo - Urgente</SelectItem>
                      <SelectItem value="verde">🟢 Verde - Pouco urgente</SelectItem>
                      <SelectItem value="azul">🔵 Azul - Não urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="observations">Observações *</Label>
                  <Textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações adicionais sobre o paciente"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpar Formulário
              </Button>
              <Button type="submit" disabled={!isFormComplete()}>
                Finalizar Triagem
              </Button>
            </div>
          </form>

          {/* Chat Dialog */}
          <Dialog open={showChat} onOpenChange={setShowChat}>
            <DialogContent className="max-w-4xl h-[80vh] p-0">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle>Assistente LIA - Triagem Manchester</DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-full">
                <TriageChat
                  triageData={triageData}
                  onSuggestPriority={handleChatSuggestPriority}
                  onCompleteTriagem={handleCompleteTriagem}
                  isDialogOpen={showChat}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Pacientes Aguardando Triagem</h1>
        {waitingTriagePatients.length === 0 ? (
          <p className="text-gray-600">Nenhum paciente aguardando triagem no momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Senha
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Especialidade
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {waitingTriagePatients.map(patient => (
                  <tr key={patient.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{patient.password}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{patient.phone}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <Badge className={patient.specialty === 'prioritario' ? 'bg-red-500' : 'bg-blue-500'}>
                        {patient.specialty}
                      </Badge>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <Button onClick={() => startTriage(patient)}>Iniciar Triagem</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriageScreen;
