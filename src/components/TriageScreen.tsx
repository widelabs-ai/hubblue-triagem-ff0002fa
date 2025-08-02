import React, { useState, useEffect } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import { Patient } from '@/contexts/HospitalContext';
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { FileText, Plus, Check, X } from 'lucide-react';
import { suggestManchesterFlow, getSpecialtyLabel } from '@/utils/manchesterFlows';
import { ManchesterFlow } from '@/utils/manchesterFlows';

interface TriageData {
  priority: 'azul' | 'verde' | 'amarelo' | 'laranja' | 'vermelho' | '';
  complaints: string;
  symptoms: string;
  painScale: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    respiratoryRate: string;
    glasgow: string;
    glucose: string;
  };
  chronicDiseases: string;
  allergies: string;
  medications: string;
  observations: string;
  manchesterFlow: string;
  suggestedSpecialty: string;
}

const TriageScreen = () => {
  const { updatePatientStatus } = useHospital();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [triageData, setTriageData] = useState<TriageData>({
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
    suggestedSpecialty: ''
  });
  const [suggestedFlows, setSuggestedFlows] = useState<ManchesterFlow[]>([]);
  const [showCustomFlowInput, setShowCustomFlowInput] = useState(false);
  const [customFlowName, setCustomFlowName] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      setTriageData(prev => ({
        ...prev,
        complaints: '',
        symptoms: '',
      }));
      setSuggestedFlows([]);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (triageData.complaints || triageData.symptoms) {
      const flows = suggestManchesterFlow(triageData.complaints, triageData.symptoms);
      setSuggestedFlows(flows);
    } else {
      setSuggestedFlows([]);
    }
  }, [triageData.complaints, triageData.symptoms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast({
        title: "Erro!",
        description: "Nenhum paciente selecionado.",
        variant: "destructive",
      })
      return;
    }

    updatePatientStatus(selectedPatient.id, 'waiting-doctor', {
      personalData: {
        ...selectedPatient.personalData,
        canBeAttended: true
      }
    });

    updatePatientStatus(selectedPatient.id, 'waiting-doctor', {
      triageData: {
        ...triageData,
        personalData: {
          name: selectedPatient?.personalData?.name,
          age: selectedPatient?.personalData?.age,
          gender: selectedPatient?.personalData?.gender,
          dateOfBirth: selectedPatient?.personalData?.dateOfBirth,
        }
      }
    });

    toast({
      title: "Sucesso!",
      description: "Triagem finalizada e paciente encaminhado para o médico.",
    })

    setSelectedPatient(null);
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
      suggestedSpecialty: ''
    });
    setSuggestedFlows([]);
    setShowCustomFlowInput(false);
    setCustomFlowName('');
  };

  // Função para adicionar fluxo customizado - substitui completamente o sugerido
  const handleAddCustomFlow = () => {
    if (customFlowName.trim()) {
      const customFlowId = `custom_${Date.now()}`;
      
      // Substitui completamente o fluxo sugerido pelo novo
      setTriageData(prev => ({ 
        ...prev, 
        manchesterFlow: customFlowName.trim()
      }));
      setCustomFlowName('');
      setShowCustomFlowInput(false);
      
      // Limpa as sugestões para indicar que foi substituído
      setSuggestedFlows([]);
      
      toast({
        title: "Fluxo personalizado adicionado",
        description: `Fluxo "${customFlowName.trim()}" substituiu a sugestão anterior.`,
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800">
        Tela de Triagem
      </h2>

      {/* Patient Selection */}
      {!selectedPatient ? (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-gray-700">
              Selecione um Paciente
            </h3>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600">
              Para iniciar a triagem, selecione um paciente da lista de espera.
            </p>
            {/* Aqui você pode adicionar a lógica para buscar e exibir a lista de pacientes */}
          </CardContent>
        </Card>
      ) : null}

      {selectedPatient && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200">
            <h3 className="text-lg font-semibold text-gray-700">
              Triagem do Paciente
            </h3>
            <p className="text-gray-600">
              Preencha os dados abaixo para realizar a triagem do paciente.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Complaints and Symptoms */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="complaints" className="text-sm font-medium text-gray-700 block mb-2">
                    Queixa Principal: <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="complaints"
                    placeholder="Principal motivo da consulta..."
                    value={triageData.complaints}
                    onChange={(e) => setTriageData({ ...triageData, complaints: e.target.value })}
                    className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="symptoms" className="text-sm font-medium text-gray-700 block mb-2">
                    Sintomas:
                  </Label>
                  <Input
                    type="text"
                    id="symptoms"
                    placeholder="Sintomas adicionais..."
                    value={triageData.symptoms}
                    onChange={(e) => setTriageData({ ...triageData, symptoms: e.target.value })}
                    className="text-sm bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Manchester Protocol Flow Section */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                  <FileText className="mr-2" size={20} />
                  Protocolo Manchester
                </h3>

                <div className="space-y-4">
                  {/* Fluxos Sugeridos */}
                  {suggestedFlows.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-amber-700 mb-3 block">
                        Fluxos Sugeridos pelo Sistema:
                      </Label>
                      <div className="grid gap-2">
                        {suggestedFlows.map((flow) => (
                          <div key={flow.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                            <div>
                              <div className="font-medium text-amber-900">{flow.name}</div>
                              <div className="text-sm text-amber-700">{flow.description}</div>
                              <div className="text-xs text-amber-600 mt-1">
                                Prioridade padrão: <span className="font-medium">{flow.defaultPriority.toUpperCase()}</span>
                                {flow.suggestedSpecialty && (
                                  <span className="ml-2">
                                    | Especialidade sugerida: <span className="font-medium">{getSpecialtyLabel(flow.suggestedSpecialty)}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setTriageData(prev => ({ 
                                  ...prev, 
                                  manchesterFlow: flow.name,
                                  suggestedSpecialty: flow.suggestedSpecialty || ''
                                }));
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              Usar Este Fluxo
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campo do Fluxo Selecionado - sempre visível */}
                  <div className="mb-3">
                    <Label className="text-sm font-medium text-amber-700 mb-2 block">
                      Fluxo Selecionado: <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={triageData.manchesterFlow}
                      onChange={(e) => setTriageData(prev => ({ 
                        ...prev, 
                        manchesterFlow: e.target.value
                      }))}
                      placeholder="Fluxo do protocolo Manchester..."
                      className="text-sm bg-white border-amber-300 focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Opção para substituir por novo fluxo */}
                  <div className="flex items-center gap-2">
                    {!showCustomFlowInput ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomFlowInput(true)}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <Plus size={16} className="mr-1" />
                        Substituir por Novo Fluxo
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          value={customFlowName}
                          onChange={(e) => setCustomFlowName(e.target.value)}
                          placeholder="Nome do novo fluxo..."
                          className="text-sm bg-white border-amber-300 focus:border-amber-500"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddCustomFlow}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowCustomFlowInput(false);
                            setCustomFlowName('');
                          }}
                          className="border-gray-300"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Campo de Especialidade Sugerida */}
                  <div className="mb-3">
                    <Label className="text-sm font-medium text-amber-700 mb-2 block">
                      Especialidade: <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={triageData.suggestedSpecialty} 
                      onValueChange={(value) => setTriageData(prev => ({ 
                        ...prev, 
                        suggestedSpecialty: value
                      }))}
                      required
                    >
                      <SelectTrigger className="bg-white border-amber-300 focus:border-amber-500">
                        <SelectValue placeholder="Selecione a especialidade..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-amber-200 shadow-lg z-50">
                        <SelectItem value="clinica-medica">Clínica Médica</SelectItem>
                        <SelectItem value="cirurgia-geral">Cirurgia Geral</SelectItem>
                        <SelectItem value="ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="pediatria">Pediatria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 block mb-2">
                    Prioridade: <span className="text-red-500">*</span>
                  </Label>
                  <Select value={triageData.priority} onValueChange={(value) => setTriageData({ ...triageData, priority: value as any })} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Selecione a prioridade..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      <SelectItem value="vermelho">Vermelho</SelectItem>
                      <SelectItem value="laranja">Laranja</SelectItem>
                      <SelectItem value="amarelo">Amarelo</SelectItem>
                      <SelectItem value="verde">Verde</SelectItem>
                      <SelectItem value="azul">Azul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vitals */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-700">
                  Sinais Vitais
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodPressure" className="text-sm font-medium text-gray-700 block mb-2">
                      Pressão Arterial:
                    </Label>
                    <Input
                      type="text"
                      id="bloodPressure"
                      placeholder="Ex: 120/80 mmHg"
                      value={triageData.vitals.bloodPressure}
                      onChange={(e) => setTriageData({
                        ...triageData,
                        vitals: { ...triageData.vitals, bloodPressure: e.target.value }
                      })}
                      className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heartRate" className="text-sm font-medium text-gray-700 block mb-2">
                      Frequência Cardíaca:
                    </Label>
                    <Input
                      type="text"
                      id="heartRate"
                      placeholder="Ex: 80 bpm"
                      value={triageData.vitals.heartRate}
                      onChange={(e) => setTriageData({
                        ...triageData,
                        vitals: { ...triageData.vitals, heartRate: e.target.value }
                      })}
                      className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature" className="text-sm font-medium text-gray-700 block mb-2">
                      Temperatura:
                    </Label>
                    <Input
                      type="text"
                      id="temperature"
                      placeholder="Ex: 36.5 °C"
                      value={triageData.vitals.temperature}
                      onChange={(e) => setTriageData({
                        ...triageData,
                        vitals: { ...triageData.vitals, temperature: e.target.value }
                      })}
                      className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="oxygenSaturation" className="text-sm font-medium text-gray-700 block mb-2">
                      Saturação de Oxigênio:
                    </Label>
                    <Input
                      type="text"
                      id="oxygenSaturation"
                      placeholder="Ex: 98%"
                      value={triageData.vitals.oxygenSaturation}
                      onChange={(e) => setTriageData({
                        ...triageData,
                        vitals: { ...triageData.vitals, oxygenSaturation: e.target.value }
                      })}
                      className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="respiratoryRate" className="text-sm font-medium text-gray-700 block mb-2">
                      Frequência Respiratória:
                    </Label>
                    <Input
                      type="text"
                      id="respiratoryRate"
                      placeholder="Ex: 16 rpm"
                      value={triageData.vitals.respiratoryRate}
                      onChange={(e) => setTriageData({
                        ...triageData,
                        vitals: { ...triageData.vitals, respiratoryRate: e.target.value }
                      })}
                      className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="glasgow" className="text-sm font-medium text-gray-700 block mb-2">
                      Glasgow:
                    </Label>
                    <Input
                      type="text"
                      id="glasgow"
                      placeholder="Ex: 15"
                      value={triageData.vitals.glasgow}
                      onChange={(e) => setTriageData({
                        ...triageData,
                        vitals: { ...triageData.vitals, glasgow: e.target.value }
                      })}
                      className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="glucose" className="text-sm font-medium text-gray-700 block mb-2">
                      Glicemia:
                    </Label>
                    <Input
                      type="text"
                      id="glucose"
                      placeholder="Ex: 100 mg/dL"
                      value={triageData.vitals.glucose}
                      onChange={(e) => setTriageData({
                        ...triageData,
                        vitals: { ...triageData.vitals, glucose: e.target.value }
                      })}
                      className="text-sm bg-white border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pain Scale */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="painScale" className="text-sm font-medium text-gray-700 block mb-2">
                    Escala de Dor:
                  </Label>
                  <Input
                    type="text"
                    id="painScale"
                    placeholder="De 0 a 10"
                    value={triageData.painScale}
                    onChange={(e) => setTriageData({ ...triageData, painScale: e.target.value })}
                    className="text-sm bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chronicDiseases" className="text-sm font-medium text-gray-700 block mb-2">
                    Doenças Crônicas:
                  </Label>
                  <Input
                    type="text"
                    id="chronicDiseases"
                    placeholder="Doenças preexistentes..."
                    value={triageData.chronicDiseases}
                    onChange={(e) => setTriageData({ ...triageData, chronicDiseases: e.target.value })}
                    className="text-sm bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="allergies" className="text-sm font-medium text-gray-700 block mb-2">
                    Alergias:
                  </Label>
                  <Input
                    type="text"
                    id="allergies"
                    placeholder="Alergias conhecidas..."
                    value={triageData.allergies}
                    onChange={(e) => setTriageData({ ...triageData, allergies: e.target.value })}
                    className="text-sm bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="medications" className="text-sm font-medium text-gray-700 block mb-2">
                    Medicações em Uso:
                  </Label>
                  <Input
                    type="text"
                    id="medications"
                    placeholder="Medicações de uso contínuo..."
                    value={triageData.medications}
                    onChange={(e) => setTriageData({ ...triageData, medications: e.target.value })}
                    className="text-sm bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="observations" className="text-sm font-medium text-gray-700 block mb-2">
                    Observações:
                  </Label>
                  <Input
                    type="text"
                    id="observations"
                    placeholder="Informações adicionais relevantes..."
                    value={triageData.observations}
                    onChange={(e) => setTriageData({ ...triageData, observations: e.target.value })}
                    className="text-sm bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedPatient(null);
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
                      suggestedSpecialty: ''
                    });
                    setSuggestedFlows([]);
                    setShowCustomFlowInput(false);
                    setCustomFlowName('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!triageData.priority || !triageData.complaints || !triageData.manchesterFlow || !triageData.suggestedSpecialty}
                >
                  Finalizar Triagem
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TriageScreen;
