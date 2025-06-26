
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Patient {
  id: string;
  password: string;
  specialty: 'ortopedia' | 'cirurgia-geral' | 'clinica-medica' | 'pediatria';
  phone: string;
  status: 'waiting-triage' | 'in-triage' | 'waiting-admin' | 'in-admin' | 'waiting-doctor' | 'in-consultation' | 'completed';
  timestamps: {
    generated: Date;
    triageStarted?: Date;
    triageCompleted?: Date;
    adminStarted?: Date;
    adminCompleted?: Date;
    consultationStarted?: Date;
    consultationCompleted?: Date;
  };
  personalData?: {
    name: string;
    cpf: string;
    age: number;
    canBeAttended: boolean;
  };
  triageData?: {
    priority: 'baixa' | 'media' | 'alta' | 'urgente';
    vitals: string;
    complaints: string;
  };
}

interface HospitalContextType {
  patients: Patient[];
  currentPasswordNumber: number;
  generatePassword: (specialty: Patient['specialty'], phone: string) => string;
  updatePatientStatus: (id: string, status: Patient['status'], additionalData?: any) => void;
  getPatientsByStatus: (status: Patient['status']) => Patient[];
  getPatientById: (id: string) => Patient | undefined;
  getTimeElapsed: (patient: Patient, from: keyof Patient['timestamps'], to?: keyof Patient['timestamps']) => number;
  isOverSLA: (patient: Patient) => { triageSLA: boolean; totalSLA: boolean };
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within HospitalProvider');
  }
  return context;
};

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPasswordNumber, setCurrentPasswordNumber] = useState(1);

  const generatePassword = (specialty: Patient['specialty'], phone: string): string => {
    const prefixes = {
      'ortopedia': 'OR',
      'cirurgia-geral': 'CG',
      'clinica-medica': 'CM',
      'pediatria': 'PD'
    };
    
    const password = `${prefixes[specialty]}${currentPasswordNumber.toString().padStart(3, '0')}`;
    
    const newPatient: Patient = {
      id: Date.now().toString(),
      password,
      specialty,
      phone,
      status: 'waiting-triage',
      timestamps: {
        generated: new Date()
      }
    };
    
    setPatients(prev => [...prev, newPatient]);
    setCurrentPasswordNumber(prev => prev + 1);
    
    return password;
  };

  const updatePatientStatus = (id: string, status: Patient['status'], additionalData?: any) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id === id) {
        const updatedPatient = { ...patient, status };
        
        // Update timestamps based on status
        switch (status) {
          case 'in-triage':
            updatedPatient.timestamps.triageStarted = new Date();
            break;
          case 'waiting-admin':
            updatedPatient.timestamps.triageCompleted = new Date();
            if (additionalData?.triageData) {
              updatedPatient.triageData = additionalData.triageData;
            }
            break;
          case 'in-admin':
            updatedPatient.timestamps.adminStarted = new Date();
            break;
          case 'waiting-doctor':
            updatedPatient.timestamps.adminCompleted = new Date();
            if (additionalData?.personalData) {
              updatedPatient.personalData = additionalData.personalData;
            }
            break;
          case 'in-consultation':
            updatedPatient.timestamps.consultationStarted = new Date();
            break;
          case 'completed':
            updatedPatient.timestamps.consultationCompleted = new Date();
            break;
        }
        
        return updatedPatient;
      }
      return patient;
    }));
  };

  const getPatientsByStatus = (status: Patient['status']): Patient[] => {
    return patients.filter(patient => patient.status === status);
  };

  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const getTimeElapsed = (patient: Patient, from: keyof Patient['timestamps'], to?: keyof Patient['timestamps']): number => {
    const startTime = patient.timestamps[from];
    const endTime = to ? patient.timestamps[to] : new Date();
    
    if (!startTime) return 0;
    
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes
  };

  const isOverSLA = (patient: Patient) => {
    const triageTime = getTimeElapsed(patient, 'generated', patient.timestamps.triageCompleted ? 'triageCompleted' : undefined);
    const totalTime = getTimeElapsed(patient, 'generated', patient.timestamps.consultationCompleted ? 'consultationCompleted' : undefined);
    
    return {
      triageSLA: triageTime > 10, // 10 minutes SLA for triage
      totalSLA: totalTime > 110 // 1h50 total SLA
    };
  };

  return (
    <HospitalContext.Provider value={{
      patients,
      currentPasswordNumber,
      generatePassword,
      updatePatientStatus,
      getPatientsByStatus,
      getPatientById,
      getTimeElapsed,
      isOverSLA
    }}>
      {children}
    </HospitalContext.Provider>
  );
};
