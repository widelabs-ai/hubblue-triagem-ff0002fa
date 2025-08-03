
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Patient } from '@/contexts/HospitalContext';

interface PatientCardProps {
  patient: Patient;
  totalTime: number;
  sla: { triageSLA: boolean; totalSLA: boolean };
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, totalTime, sla }) => {
  const statusColors = {
    'waiting-triage': 'bg-yellow-100 border-yellow-300',
    'in-triage': 'bg-orange-100 border-orange-300',
    'waiting-admin': 'bg-purple-100 border-purple-300',
    'in-admin': 'bg-indigo-100 border-indigo-300',
    'waiting-doctor': 'bg-green-100 border-green-300',
    'in-consultation': 'bg-teal-100 border-teal-300',
    'completed': 'bg-gray-100 border-gray-300'
  };

  const statusLabels = {
    'waiting-triage': 'Aguardando Triagem',
    'in-triage': 'Em Triagem',
    'waiting-admin': 'Aguardando Administrativo',
    'in-admin': 'Em Atendimento Administrativo',
    'waiting-doctor': 'Aguardando Médico',
    'in-consultation': 'Em Consulta',
    'completed': 'Concluído'
  };

  // Busca o nome prioritariamente dos dados pessoais, depois da triagem
  const getPatientName = () => {
    if (patient.personalData?.name) {
      return patient.personalData.name;
    }
    if (patient.triageData?.personalData?.name) {
      return patient.triageData.personalData.name;
    }
    return 'Nome não coletado';
  };

  // Busca informações adicionais do paciente
  const getPatientAge = () => {
    if (patient.personalData?.age) {
      return `${patient.personalData.age} anos`;
    }
    if (patient.triageData?.personalData?.age) {
      return `${patient.triageData.personalData.age} anos`;
    }
    return '';
  };

  const getPatientGender = () => {
    if (patient.personalData?.gender) {
      return patient.personalData.gender === 'masculino' ? 'M' : 
             patient.personalData.gender === 'feminino' ? 'F' : 
             patient.personalData.gender.charAt(0).toUpperCase();
    }
    if (patient.triageData?.personalData?.gender) {
      return patient.triageData.personalData.gender === 'masculino' ? 'M' : 
             patient.triageData.personalData.gender === 'feminino' ? 'F' : 
             patient.triageData.personalData.gender.charAt(0).toUpperCase();
    }
    return '';
  };

  return (
    <Card 
      className={`${statusColors[patient.status]} ${
        (sla.triageSLA || sla.totalSLA) ? 'ring-2 ring-red-500' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">{patient.password}</div>
            <div className="text-sm text-gray-600">
              {getPatientName()}
              {getPatientAge() && (
                <span className="ml-2 text-xs text-gray-500">
                  {getPatientAge()} {getPatientGender() && `• ${getPatientGender()}`}
                </span>
              )}
            </div>
            <div className="text-sm capitalize">
              {patient.specialty.replace('-', ' ')} - {statusLabels[patient.status]}
            </div>
            {patient.personalData?.healthInsurance && (
              <div className="text-xs text-blue-600 mt-1">
                {patient.personalData.healthInsurance}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${
              sla.totalSLA ? 'text-red-600' : 
              totalTime > 90 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {totalTime} min
            </div>
            {patient.triageData && (
              <div className={`text-sm ${
                patient.triageData.priority === 'vermelho' ? 'text-red-600' :
                patient.triageData.priority === 'laranja' ? 'text-orange-600' :
                patient.triageData.priority === 'amarelo' ? 'text-yellow-600' :
                patient.triageData.priority === 'verde' ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {patient.triageData.priority.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
