import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ClinicalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  triageData: any;
}

const ClinicalReviewModal: React.FC<ClinicalReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  triageData
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'azul': return 'bg-blue-100 text-blue-800';
      case 'verde': return 'bg-green-100 text-green-800';
      case 'amarelo': return 'bg-yellow-100 text-yellow-800';
      case 'laranja': return 'bg-orange-100 text-orange-800';
      case 'vermelho': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'vermelho': return 'Vermelho - Emergência (imediato)';
      case 'laranja': return 'Laranja - Muito urgente (10 min)';
      case 'amarelo': return 'Amarelo - Urgente (60 min)';
      case 'verde': return 'Verde - Pouco urgente (120 min)';
      case 'azul': return 'Azul - Não urgente (240 min)';
      default: return priority;
    }
  };

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

  const getSpecialtyDisplay = (specialty: string) => {
    const specialtyMap: Record<string, string> = {
      'clinica-medica': 'Clínica Médica',
      'cirurgia-geral': 'Cirurgia Geral',
      'ortopedia': 'Ortopedia',
      'pediatria': 'Pediatria',
      'cardiologia': 'Cardiologia',
      'pneumologia': 'Pneumologia',
      'neurologia': 'Neurologia',
      'gastroenterologia': 'Gastroenterologia',
      'urologia': 'Urologia',
      'ginecologia': 'Ginecologia'
    };
    
    return specialtyMap[specialty] || specialty;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            📋 Ficha Clínica - Revisão da Triagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Classificação de Risco */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Classificação de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`text-lg px-4 py-2 ${getPriorityColor(triageData.priority)}`}>
                {getPriorityText(triageData.priority)}
              </Badge>
            </CardContent>
          </Card>

          {/* Dados do Paciente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong>Nome:</strong> {triageData.personalData.fullName}
                </div>
                <div>
                  <strong>Idade:</strong> {calculateAge(triageData.personalData.dateOfBirth)} anos
                </div>
                <div>
                  <strong>Sexo:</strong> {triageData.personalData.gender}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queixas e Sintomas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Apresentação Clínica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Queixas Principais:</strong>
                <p className="mt-1 text-gray-700">{triageData.complaints}</p>
              </div>
              <Separator />
              <div>
                <strong>Sintomas:</strong>
                <p className="mt-1 text-gray-700">{triageData.symptoms}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sinais Vitais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sinais Vitais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <strong>PA:</strong> {triageData.vitals.bloodPressure} mmHg
                </div>
                <div>
                  <strong>FC:</strong> {triageData.vitals.heartRate} bpm
                </div>
                <div>
                  <strong>FR:</strong> {triageData.vitals.respiratoryRate} rpm
                </div>
                <div>
                  <strong>Temp:</strong> {triageData.vitals.temperature}°C
                </div>
                <div>
                  <strong>SatO₂:</strong> {triageData.vitals.oxygenSaturation}%
                </div>
                <div>
                  <strong>Glasgow:</strong> {triageData.vitals.glasgow} pts
                </div>
                <div>
                  <strong>Glicemia:</strong> {triageData.vitals.glucose} mg/dL
                </div>
                <div>
                  <strong>Dor:</strong> {triageData.painScale}/10
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Protocolo Manchester */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Protocolo Manchester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Fluxo:</strong> {triageData.manchesterFlow}
                </div>
                <div>
                  <strong>Especialidade Sugerida:</strong> {getSpecialtyDisplay(triageData.suggestedSpecialty)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico Clínico */}
          {(triageData.chronicDiseases || triageData.allergies.length > 0 || triageData.medications.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Histórico Clínico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {triageData.chronicDiseases && (
                  <div>
                    <strong>Comorbidades:</strong>
                    <p className="mt-1 text-gray-700">{triageData.chronicDiseases}</p>
                  </div>
                )}
                {triageData.allergies.length > 0 && (
                  <div>
                    <strong>Alergias:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {triageData.allergies.map((allergy: string, index: number) => (
                        <Badge key={index} variant="outline">{allergy}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {triageData.medications.length > 0 && (
                  <div>
                    <strong>Medicamentos:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {triageData.medications.map((medication: string, index: number) => (
                        <Badge key={index} variant="outline">{medication}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {triageData.observations && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{triageData.observations}</p>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
              Confirmar e Concluir Triagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicalReviewModal;
