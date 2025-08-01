
import React from 'react';
import { Patient } from '@/contexts/HospitalContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PatientListProps {
  patients: Patient[];
  getTimeElapsed: (patient: Patient, from: keyof Patient['timestamps'], to?: keyof Patient['timestamps']) => number;
  isOverSLA: (patient: Patient) => { triageSLA: boolean; totalSLA: boolean };
}

const PatientList: React.FC<PatientListProps> = ({ patients, getTimeElapsed, isOverSLA }) => {
  const activePatients = patients.filter(p => p.status !== 'completed');

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
    switch (status) {
      case 'waiting-triage': return 'Aguardando Triagem';
      case 'in-triage': return 'Em Triagem';
      case 'waiting-admin': return 'Aguardando Admin';
      case 'in-admin': return 'Em Admin';
      case 'waiting-doctor': return 'Aguardando Médico';
      case 'in-consultation': return 'Em Consulta';
      default: return status;
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'masculino': return 'M';
      case 'feminino': return 'F';
      case 'outro': return 'O';
      default: return '-';
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Pacientes Ativos</h3>
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Senha</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-20">Idade</TableHead>
              <TableHead className="w-16">Sexo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
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
                    totalTime > 80 ? 'bg-yellow-50 border-yellow-200' : 
                    'bg-green-50 border-green-200'
                  }`}
                >
                  <TableCell className="font-bold">{patient.password}</TableCell>
                  <TableCell className="font-medium">
                    {patient.personalData?.name || 'Nome não coletado'}
                  </TableCell>
                  <TableCell>
                    {patient.personalData?.age || '-'}
                  </TableCell>
                  <TableCell>
                    {getGenderText(patient.personalData?.gender || '')}
                  </TableCell>
                  <TableCell className="capitalize">
                    {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                  </TableCell>
                  <TableCell>{getStatusText(patient.status)}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPriorityColor(patient.triageData?.priority || '')}`}>
                      {patient.triageData?.priority?.toUpperCase() || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className={`font-medium ${
                    sla.totalSLA ? 'text-red-600' : 
                    totalTime > 80 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {totalTime} min
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sla.totalSLA ? 'bg-red-100 text-red-800' : 
                      totalTime > 80 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {sla.totalSLA ? 'Atrasado' : totalTime > 80 ? 'Atenção' : 'No prazo'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {activePatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
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
