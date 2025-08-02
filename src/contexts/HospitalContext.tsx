import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Patient {
  id: string;
  password: string;
  specialty: 'prioritario' | 'nao-prioritario';
  phone: string;
  status: 'waiting-triage' | 'in-triage' | 'waiting-admin' | 'in-admin' | 'waiting-doctor' | 'in-consultation' | 'completed' | 'cancelled';
  timestamps: {
    generated: Date;
    triageStarted?: Date;
    triageCompleted?: Date;
    adminStarted?: Date;
    adminCompleted?: Date;
    consultationStarted?: Date;
    consultationCompleted?: Date;
    cancelled?: Date;
  };
  personalData?: {
    fullName?: string;
    name: string;
    cpf: string;
    age: number;
    dateOfBirth?: string;
    gender?: string;
    healthInsurance?: string;
    canBeAttended: boolean;
  };
  triageData?: {
    priority: 'azul' | 'verde' | 'amarelo' | 'laranja' | 'vermelho';
    complaints: string;
    symptoms?: string;
    painScale?: string;
    vitals?: {
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      oxygenSaturation?: string;
      respiratoryRate?: string;
      glasgow?: string;
      glucose?: string;
    };
    chronicDiseases?: string;
    allergies?: string;
    medications?: string;
    observations?: string;
    personalData?: {
      name: string;
      age: number;
      gender?: string;
    };
  };
  cancellationData?: {
    reason: string;
    cancelledAt: Date;
  };
}

interface HospitalContextType {
  patients: Patient[];
  currentPasswordNumber: number;
  generatePassword: (specialty: Patient['specialty'], phone: string) => string;
  updatePatientStatus: (id: string, status: Patient['status'], additionalData?: any) => void;
  cancelPatient: (id: string, reason: string) => void;
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
      'prioritario': 'PR',
      'nao-prioritario': 'NP'
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

  const cancelPatient = (id: string, reason: string) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id === id) {
        return {
          ...patient,
          status: 'cancelled' as const,
          timestamps: {
            ...patient.timestamps,
            cancelled: new Date()
          },
          cancellationData: {
            reason,
            cancelledAt: new Date()
          }
        };
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
      cancelPatient,
      getPatientsByStatus,
      getPatientById,
      getTimeElapsed,
      isOverSLA
    }}>
      {children}
    </HospitalContext.Provider>
  );
};
