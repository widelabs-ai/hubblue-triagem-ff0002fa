
import React from 'react';
import { Patient } from '@/contexts/HospitalContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPatientName, getPatientAge, getPatientGender } from '@/utils/patientUtils';

interface PatientListProps {
  patients: Patient[];
  getTimeElapsed: (patient: Patient, from: keyof Patient['timestamps'], to?: keyof Patient['timestamps']) => number;
  isOverSLA: (patient: Patient) => { triageSLA: boolean; totalSLA: boolean };
}

const PatientList: React.FC<PatientListProps> = ({ patients, getTimeElapsed, isOverSLA }) => {
  const activePatients = patients.filter(p => !['completed', 'cancelled', 'discharged', 'deceased', 'transferred'].includes(p.status));

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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'waiting-triage': 'Aguardando Triagem',
      'in-triage': 'Em Triagem',
      'waiting-admin': 'Aguard. Recepção',
      'in-admin': 'Atend. Recepção',
      'waiting-doctor': 'Aguardando Médico',
      'in-consultation': 'Em Atendimento',
      'waiting-exam': 'Aguardando Exame',
      'in-exam': 'Em Exame',
      'waiting-medication': 'Aguardando Medicação',
      'in-medication': 'Em Medicação',
      'waiting-hospitalization': 'Aguard. Repouso no Leito',
      'in-hospitalization': 'Internado',
      'waiting-transfer': 'Aguardando Transferência',
      'prescription-issued': 'Prescrição Emitida',
      'discharged': 'Alta',
      'transferred': 'Transferido',
      'deceased': 'Óbito'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const iconMap: { [key: string]: string } = {
      'waiting-triage': '🏥',
      'in-triage': '🩺',
      'waiting-admin': '📋',
      'in-admin': '📝',
      'waiting-doctor': '⏳',
      'in-consultation': '👨‍⚕️',
      'waiting-exam': '🔬',
      'in-exam': '🧪',
      'waiting-medication': '💊',
      'in-medication': '💉',
      'waiting-hospitalization': '🛏️',
      'in-hospitalization': '🛏️',
      'waiting-transfer': '🚑',
      'prescription-issued': '📄',
      'discharged': '✅',
      'transferred': '↗️',
      'deceased': '💔'
    };
    return iconMap[status] || '📄';
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">👥 Pacientes Ativos no Sistema ({activePatients.length})</h3>
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Senha</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-16">Idade</TableHead>
              <TableHead className="w-16">Gênero</TableHead>
              <TableHead>Convênio</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status Atual</TableHead>
              <TableHead>Classificação</TableHead>
              <TableHead className="w-32">Tempo Total</TableHead>
              <TableHead className="w-32">Status SLA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activePatients.map((patient) => {
              const totalTime = getTimeElapsed(patient, 'generated');
              const sla = isOverSLA(patient);
              
              return (
                <TableRow 
                  key={patient.id}
                  className={`${
                    sla.totalSLA ? 'bg-red-50 border-red-200' : 
                    totalTime > 180 ? 'bg-yellow-50 border-yellow-200' : 
                    'bg-green-50 border-green-200'
                  }`}
                >
                  <TableCell className="font-bold">{patient.password}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {getPatientName(patient)}
                  </TableCell>
                  <TableCell>{getPatientAge(patient)}</TableCell>
                  <TableCell>{getPatientGender(patient)}</TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    {patient.personalData?.healthInsurance || 'Particular'}
                  </TableCell>
                  <TableCell className="capitalize">
                    {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getStatusIcon(patient.status)}</span>
                      <span className="text-sm">{getStatusText(patient.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPriorityColor(patient.triageData?.priority || '')}`}>
                      {patient.triageData?.priority?.toUpperCase() || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className={`font-medium ${
                    sla.totalSLA ? 'text-red-600' : 
                    totalTime > 180 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {totalTime} min
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sla.totalSLA ? 'bg-red-100 text-red-800' : 
                      totalTime > 180 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {sla.totalSLA ? 'Atrasado' : totalTime > 180 ? 'Atenção' : 'No prazo'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {activePatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  Nenhum paciente ativo no momento
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PatientList;
