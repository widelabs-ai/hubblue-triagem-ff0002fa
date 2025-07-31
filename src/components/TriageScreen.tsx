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

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, cancelPatient, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
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
  const waitingPatients = getPatientsByStatus('waiting-triage').sort((a, b) => {
    // Primeiro ordena por tempo de espera (mais tempo primeiro)
    const timeA = getTimeElapsed(a, 'generated');
    const timeB = getTimeElapsed(b, 'generated');
    return timeB - timeA;
  });
  const currentPatient = getPatientsByStatus('in-triage')[0];

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

  const handleCallPatient = (patientId: string) => {
    console.log('Chamando paciente:', patientId);
    updatePatientStatus(patientId, 'in-triage');
    setIsDialogOpen(true);
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

  const handleCancelPatient = (reason: string, cancelledBy: string) => {
    if (currentPatient) {
      cancelPatient(currentPatient.id, reason, cancelledBy);
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
              {/* Formulário de Triagem */}
              <div className="w-2/3 overflow-y-auto p-6 pt-0">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-bold text-xl">{currentPatient.password}</div>
                    <div className="text-gray-600 capitalize">
                      {currentPatient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tempo na triagem: {getTimeElapsed(currentPatient, 'triageStarted')} min
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div className="space-y-4">
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

                      <div>
                        <Label>Observações</Label>
                        <Textarea
                          placeholder="Informações adicionais relevantes..."
                          value={triageData.observations}
                          onChange={(e) => setTriageData({...triageData, observations: e.target.value})}
                          rows={4}
                        />
                      </div>

                      {/* Campo de classificação movido para o final */}
                      <div className="border-t pt-4">
                        <Label>Classificação de Risco (Manchester) *</Label>
                        <Select value={triageData.priority} onValueChange={(value) => setTriageData({...triageData, priority: value})}>
                          <SelectTrigger className={`${getPriorityColor(triageData.priority)} font-medium`}>
                            <SelectValue placeholder="Classificação será preenchida automaticamente" />
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
                          <div className={`text-sm mt-2 font-medium ${getPriorityColor(triageData.priority)}`}>
                            {getPriorityText(triageData.priority)}
                          </div>
                        )}
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
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Fechar
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
                  onCompleteTriagem={handleCompleteTriagem}
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
