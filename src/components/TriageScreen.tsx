import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TriageChat from './TriageChat';

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [triageData, setTriageData] = useState({
    priority: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      respiratoryRate: ''
    },
    complaints: '',
    painScale: '',
    symptoms: '',
    allergies: '',
    medications: '',
    observations: ''
  });

  const navigate = useNavigate();
  const waitingPatients = getPatientsByStatus('waiting-triage');
  const currentPatient = getPatientsByStatus('in-triage')[0];

  const handleCallPatient = (patientId: string) => {
    console.log('Chamando paciente:', patientId);
    updatePatientStatus(patientId, 'in-triage');
    setIsDialogOpen(true);
    toast({
      title: "Paciente chamado",
      description: "Paciente está sendo atendido na triagem.",
    });
  };

  const handleSuggestPriority = (priority: string, reasoning: string) => {
    setTriageData(prev => ({ ...prev, priority }));
    toast({
      title: "Classificação sugerida",
      description: `${getPriorityText(priority)} - ${reasoning}`,
      duration: 5000,
    });
  };

  const handleCompleteTriagem = () => {
    if (!currentPatient || !triageData.priority || !triageData.complaints) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha pelo menos a prioridade e as queixas principais.",
        variant: "destructive"
      });
      return;
    }

    updatePatientStatus(currentPatient.id, 'waiting-admin', { triageData });
    setTriageData({
      priority: '',
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        respiratoryRate: ''
      },
      complaints: '',
      painScale: '',
      symptoms: '',
      allergies: '',
      medications: '',
      observations: ''
    });
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
    setTriageData({
      priority: '',
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        respiratoryRate: ''
      },
      complaints: '',
      painScale: '',
      symptoms: '',
      allergies: '',
      medications: '',
      observations: ''
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
      <div className="max-w-4xl mx-auto space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {waitingPatients.map((patient) => {
                const timeWaiting = getTimeElapsed(patient, 'generated');
                const slaStatus = isOverSLA(patient);
                
                return (
                  <Card 
                    key={patient.id} 
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      slaStatus.triageSLA ? 'border-red-500 bg-red-50' : 
                      timeWaiting > 7 ? 'border-yellow-500 bg-yellow-50' : 
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
                          <div className={`text-sm font-medium ${
                            slaStatus.triageSLA ? 'text-red-600' : 
                            timeWaiting > 7 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            Aguardando: {timeWaiting} min
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
                  <p className="text-gray-500 text-center py-8">Nenhum paciente aguardando triagem</p>
                </div>
              )}
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
              {/* Formulário de Triagem */}
              <div className="w-2/3 overflow-y-auto p-6 pt-0">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-bold text-xl">{currentPatient.password}</div>
                    <div className="text-gray-600 capitalize">
                      {currentPatient.specialty.replace('-', ' ')}
                    </div>
                    <div className="text-sm text-blue-600">
                      Telefone: {currentPatient.phone}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tempo na triagem: {getTimeElapsed(currentPatient, 'triageStarted')} min
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Classificação de Risco (Manchester) *</Label>
                        <Select value={triageData.priority} onValueChange={(value) => setTriageData({...triageData, priority: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a classificação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="azul">🔵 Azul - Não urgente (240 min)</SelectItem>
                            <SelectItem value="verde">🟢 Verde - Pouco urgente (120 min)</SelectItem>
                            <SelectItem value="amarelo">🟡 Amarelo - Urgente (60 min)</SelectItem>
                            <SelectItem value="laranja">🟠 Laranja - Muito urgente (10 min)</SelectItem>
                            <SelectItem value="vermelho">🔴 Vermelho - Emergência (imediato)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Pressão Arterial</Label>
                          <Input
                            placeholder="120x80"
                            value={triageData.vitals.bloodPressure}
                            onChange={(e) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, bloodPressure: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label>Frequência Cardíaca</Label>
                          <Input
                            placeholder="70 bpm"
                            value={triageData.vitals.heartRate}
                            onChange={(e) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, heartRate: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label>Temperatura</Label>
                          <Input
                            placeholder="36.5°C"
                            value={triageData.vitals.temperature}
                            onChange={(e) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, temperature: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label>Saturação O₂</Label>
                          <Input
                            placeholder="98%"
                            value={triageData.vitals.oxygenSaturation}
                            onChange={(e) => setTriageData({
                              ...triageData, 
                              vitals: {...triageData.vitals, oxygenSaturation: e.target.value}
                            })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Escala de Dor (0-10)</Label>
                        <Select value={triageData.painScale} onValueChange={(value) => setTriageData({...triageData, painScale: value})}>
                          <SelectTrigger>
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

                      <div>
                        <Label>Alergias Conhecidas</Label>
                        <Input
                          placeholder="Medicamentos, alimentos, etc."
                          value={triageData.allergies}
                          onChange={(e) => setTriageData({...triageData, allergies: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Medicamentos em Uso</Label>
                        <Input
                          placeholder="Medicamentos atuais"
                          value={triageData.medications}
                          onChange={(e) => setTriageData({...triageData, medications: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Queixas Principais *</Label>
                        <Textarea
                          placeholder="Descreva o motivo da consulta..."
                          value={triageData.complaints}
                          onChange={(e) => setTriageData({...triageData, complaints: e.target.value})}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>Sintomas Apresentados</Label>
                        <Textarea
                          placeholder="Febre, náusea, tontura, etc..."
                          value={triageData.symptoms}
                          onChange={(e) => setTriageData({...triageData, symptoms: e.target.value})}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>Observações</Label>
                        <Textarea
                          placeholder="Informações adicionais relevantes..."
                          value={triageData.observations}
                          onChange={(e) => setTriageData({...triageData, observations: e.target.value})}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCompleteTriagem}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Concluir Triagem
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat da LIA sempre visível */}
              <div className="w-1/3 border-l border-gray-200">
                <TriageChat 
                  triageData={triageData} 
                  onSuggestPriority={handleSuggestPriority}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TriageScreen;
