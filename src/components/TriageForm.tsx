
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHospital } from '@/contexts/HospitalContext';

interface TriageFormProps {
  patientId: string;
  onComplete: (patientId: string, triageData: any) => void;
  onCancel: () => void;
  onClose: () => void;
}

const TriageForm: React.FC<TriageFormProps> = ({ patientId, onComplete, onCancel, onClose }) => {
  const { getPatientById } = useHospital();
  const patient = getPatientById(patientId);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    complaints: '',
    priority: ''
  });

  const handleSubmit = () => {
    const triageData = {
      priority: formData.priority,
      complaints: formData.complaints,
      personalData: {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender
      }
    };
    
    onComplete(patientId, triageData);
  };

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="font-bold text-xl">{patient.password}</div>
        <div className="text-gray-600 capitalize">
          {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Nome Completo</Label>
            <Input
              placeholder="Nome do paciente"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Idade</Label>
              <Input
                type="number"
                placeholder="Idade"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div>
              <Label>Gênero</Label>
              <Select 
                value={formData.gender}
                onValueChange={(value) => setFormData({...formData, gender: value})}
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
            <Label>Queixas Principais</Label>
            <Textarea
              placeholder="Descreva as queixas do paciente"
              value={formData.complaints}
              onChange={(e) => setFormData({...formData, complaints: e.target.value})}
            />
          </div>

          <div>
            <Label>Classificação de Prioridade</Label>
            <Select 
              value={formData.priority}
              onValueChange={(value) => setFormData({...formData, priority: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="azul">Azul - Não urgente</SelectItem>
                <SelectItem value="verde">Verde - Pouco urgente</SelectItem>
                <SelectItem value="amarelo">Amarelo - Urgente</SelectItem>
                <SelectItem value="laranja">Laranja - Muito urgente</SelectItem>
                <SelectItem value="vermelho">Vermelho - Emergência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          Concluir Triagem
        </Button>
      </div>
    </div>
  );
};

export default TriageForm;
