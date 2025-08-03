import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Patient {
  id: string;
  password: string;
  specialty: 'prioritario' | 'nao-prioritario';
  phone: string;
  status: 'waiting-triage' | 'in-triage' | 'waiting-admin' | 'in-admin' | 'waiting-doctor' | 'in-consultation' | 
          'waiting-exam' | 'in-exam' | 'waiting-medication' | 'in-medication' | 'waiting-hospitalization' | 
          'in-hospitalization' | 'waiting-inter-consultation' | 'in-inter-consultation' | 'waiting-transfer' | 
          'transferred' | 'prescription-issued' | 'discharged' | 'deceased' | 'completed' | 'cancelled';
  timestamps: {
    generated: Date;
    triageStarted?: Date;
    triageCompleted?: Date;
    adminStarted?: Date;
    adminCompleted?: Date;
    consultationStarted?: Date;
    consultationCompleted?: Date;
    examStarted?: Date;
    examCompleted?: Date;
    medicationStarted?: Date;
    medicationCompleted?: Date;
    hospitalizationStarted?: Date;
    hospitalizationCompleted?: Date;
    interConsultationStarted?: Date;
    interConsultationCompleted?: Date;
    transferStarted?: Date;
    transferCompleted?: Date;
    prescriptionIssued?: Date;
    discharged?: Date;
    deceased?: Date;
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
    manchesterFlow?: string;
    suggestedSpecialty?: string;
    personalData?: {
      fullName?: string;
      name: string;
      age: number;
      gender?: string;
      dateOfBirth?: string;
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
  getPatientFlowStats: () => any;
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
          case 'waiting-exam':
            updatedPatient.timestamps.consultationCompleted = new Date();
            break;
          case 'in-exam':
            updatedPatient.timestamps.examStarted = new Date();
            break;
          case 'waiting-medication':
            updatedPatient.timestamps.examCompleted = new Date();
            break;
          case 'in-medication':
            updatedPatient.timestamps.medicationStarted = new Date();
            break;
          case 'waiting-hospitalization':
            updatedPatient.timestamps.medicationCompleted = new Date();
            break;
          case 'in-hospitalization':
            updatedPatient.timestamps.hospitalizationStarted = new Date();
            break;
          case 'waiting-inter-consultation':
            updatedPatient.timestamps.hospitalizationCompleted = new Date();
            break;
          case 'in-inter-consultation':
            updatedPatient.timestamps.interConsultationStarted = new Date();
            break;
          case 'waiting-transfer':
            updatedPatient.timestamps.interConsultationCompleted = new Date();
            break;
          case 'transferred':
            updatedPatient.timestamps.transferCompleted = new Date();
            break;
          case 'prescription-issued':
            updatedPatient.timestamps.prescriptionIssued = new Date();
            break;
          case 'discharged':
            updatedPatient.timestamps.discharged = new Date();
            break;
          case 'deceased':
            updatedPatient.timestamps.deceased = new Date();
            break;
          case 'completed':
            updatedPatient.timestamps.discharged = new Date();
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
    const totalTime = getTimeElapsed(patient, 'generated', patient.timestamps.discharged ? 'discharged' : undefined);
    
    return {
      triageSLA: triageTime > 10, // 10 minutes SLA for triage
      totalSLA: totalTime > 240 // 4 hours total SLA
    };
  };

  const getPatientFlowStats = () => {
    const activePatients = patients.filter(p => !['completed', 'cancelled', 'discharged', 'deceased', 'transferred'].includes(p.status));
    
    return {
      totalActive: activePatients.length,
      totalProcessed: patients.filter(p => ['completed', 'discharged', 'transferred'].includes(p.status)).length,
      byStatus: {
        waitingTriage: getPatientsByStatus('waiting-triage').length,
        inTriage: getPatientsByStatus('in-triage').length,
        waitingAdmin: getPatientsByStatus('waiting-admin').length,
        inAdmin: getPatientsByStatus('in-admin').length,
        waitingDoctor: getPatientsByStatus('waiting-doctor').length,
        inConsultation: getPatientsByStatus('in-consultation').length,
        waitingExam: getPatientsByStatus('waiting-exam').length,
        inExam: getPatientsByStatus('in-exam').length,
        waitingMedication: getPatientsByStatus('waiting-medication').length,
        inMedication: getPatientsByStatus('in-medication').length,
        waitingHospitalization: getPatientsByStatus('waiting-hospitalization').length,
        inHospitalization: getPatientsByStatus('in-hospitalization').length,
        waitingInterConsultation: getPatientsByStatus('waiting-inter-consultation').length,
        inInterConsultation: getPatientsByStatus('in-inter-consultation').length,
        waitingTransfer: getPatientsByStatus('waiting-transfer').length,
        prescriptionIssued: getPatientsByStatus('prescription-issued').length,
        readyForReassessment: patients.filter(p => {
          // Pacientes prontos para reavaliação: aqueles que completaram algum procedimento
          // e podem precisar de nova avaliação médica
          return p.timestamps.examCompleted || 
                 p.timestamps.medicationCompleted || 
                 p.timestamps.interConsultationCompleted;
        }).length,
        discharged: getPatientsByStatus('discharged').length,
        deceased: getPatientsByStatus('deceased').length,
        transferred: getPatientsByStatus('transferred').length,
        completed: getPatientsByStatus('completed').length,
      }
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
      isOverSLA,
      getPatientFlowStats
    }}>
      {children}
    </HospitalContext.Provider>
  );
};
