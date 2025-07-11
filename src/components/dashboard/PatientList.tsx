
import React from 'react';
import { Patient } from '@/contexts/HospitalContext';
import PatientCard from './PatientCard';

interface PatientListProps {
  patients: Patient[];
  getTimeElapsed: (patient: Patient, from: keyof Patient['timestamps'], to?: keyof Patient['timestamps']) => number;
  isOverSLA: (patient: Patient) => { triageSLA: boolean; totalSLA: boolean };
}

const PatientList: React.FC<PatientListProps> = ({ patients, getTimeElapsed, isOverSLA }) => {
  const activePatients = patients.filter(p => p.status !== 'completed');

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Pacientes Ativos</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activePatients.map((patient) => {
          const totalTime = getTimeElapsed(patient, 'generated');
          const sla = isOverSLA(patient);
          
          return (
            <PatientCard
              key={patient.id}
              patient={patient}
              totalTime={totalTime}
              sla={sla}
            />
          );
        })}
        {activePatients.length === 0 && (
          <p className="text-gray-500 text-center py-8">Nenhum paciente ativo no momento</p>
        )}
      </div>
    </div>
  );
};

export default PatientList;
