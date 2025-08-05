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
    name?: string; // Para compatibilidade
    dateOfBirth?: string;
    age?: number;
    biologicalSex?: string;
    gender?: string; // Para compatibilidade
    motherName?: string;
    cpf?: string;
    rg?: string;
    linkType?: 'SUS' | 'Convênio' | 'Particular';
    susCard?: string;
    insuranceNumber?: string;
    healthInsurance?: string; // Para compatibilidade
    fullAddress?: string;
    address?: string; // Para compatibilidade
    phone?: string;
    emergencyContactName?: string;
    emergencyContact?: string; // Para compatibilidade
    emergencyContactPhone?: string;
    emergencyPhone?: string; // Para compatibilidade
    canBeAttended?: boolean;
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
      name?: string;
      age?: number;
      gender?: string;
      biologicalSex?: string;
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

  // Mock data initialization
  useEffect(() => {
    const now = new Date();
    const mockPatients: Patient[] = [
      // Aguardando Triagem (2 pacientes - 1 fora do SLA)
      {
        id: 'mock-1',
        password: 'NP001',
        specialty: 'nao-prioritario',
        phone: '11999999001',
        status: 'waiting-triage',
        timestamps: {
          generated: new Date(now.getTime() - 15 * 60 * 1000) // 15 min ago (fora do SLA)
        }
      },
      {
        id: 'mock-2',
        password: 'PR002',
        specialty: 'prioritario',
        phone: '11999999002',
        status: 'waiting-triage',
        timestamps: {
          generated: new Date(now.getTime() - 5 * 60 * 1000) // 5 min ago (dentro do SLA)
        }
      },
      // Em Triagem (1 paciente - dentro do SLA)
      {
        id: 'mock-3',
        password: 'NP003',
        specialty: 'nao-prioritario',
        phone: '11999999003',
        status: 'in-triage',
        timestamps: {
          generated: new Date(now.getTime() - 8 * 60 * 1000), // 8 min ago
          triageStarted: new Date(now.getTime() - 3 * 60 * 1000) // 3 min ago
        }
      },
      // Aguardando Recepção (3 pacientes - 1 fora do SLA)
      {
        id: 'mock-4',
        password: 'NP004',
        specialty: 'nao-prioritario',
        phone: '11999999004',
        status: 'waiting-admin',
        timestamps: {
          generated: new Date(now.getTime() - 180 * 60 * 1000), // 3h ago
          triageCompleted: new Date(now.getTime() - 170 * 60 * 1000)
        }
      },
      {
        id: 'mock-5',
        password: 'PR005',
        specialty: 'prioritario',
        phone: '11999999005',
        status: 'waiting-admin',
        timestamps: {
          generated: new Date(now.getTime() - 45 * 60 * 1000), // 45 min ago
          triageCompleted: new Date(now.getTime() - 35 * 60 * 1000)
        }
      },
      {
        id: 'mock-6',
        password: 'NP006',
        specialty: 'nao-prioritario',
        phone: '11999999006',
        status: 'waiting-admin',
        timestamps: {
          generated: new Date(now.getTime() - 25 * 60 * 1000), // 25 min ago
          triageCompleted: new Date(now.getTime() - 20 * 60 * 1000)
        }
      },
      // Atendimento Recepção (1 paciente - dentro do SLA)
      {
        id: 'mock-7',
        password: 'NP007',
        specialty: 'nao-prioritario',
        phone: '11999999007',
        status: 'in-admin',
        timestamps: {
          generated: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
          triageCompleted: new Date(now.getTime() - 25 * 60 * 1000),
          adminStarted: new Date(now.getTime() - 5 * 60 * 1000)
        }
      },
      // Aguardando Médico (5 pacientes - 1 fora do SLA)
      {
        id: 'mock-8',
        password: 'PR008',
        specialty: 'prioritario',
        phone: '11999999008',
        status: 'waiting-doctor',
        timestamps: {
          generated: new Date(now.getTime() - 260 * 60 * 1000), // 4h20 ago (fora do SLA total)
          triageCompleted: new Date(now.getTime() - 250 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 240 * 60 * 1000)
        }
      },
      {
        id: 'mock-9',
        password: 'NP009',
        specialty: 'nao-prioritario',
        phone: '11999999009',
        status: 'waiting-doctor',
        timestamps: {
          generated: new Date(now.getTime() - 90 * 60 * 1000), // 1h30 ago
          triageCompleted: new Date(now.getTime() - 85 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 75 * 60 * 1000)
        }
      },
      {
        id: 'mock-10',
        password: 'NP010',
        specialty: 'nao-prioritario',
        phone: '11999999010',
        status: 'waiting-doctor',
        timestamps: {
          generated: new Date(now.getTime() - 60 * 60 * 1000), // 1h ago
          triageCompleted: new Date(now.getTime() - 55 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 50 * 60 * 1000)
        }
      },
      {
        id: 'mock-11',
        password: 'PR011',
        specialty: 'prioritario',
        phone: '11999999011',
        status: 'waiting-doctor',
        timestamps: {
          generated: new Date(now.getTime() - 40 * 60 * 1000), // 40 min ago
          triageCompleted: new Date(now.getTime() - 35 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 30 * 60 * 1000)
        }
      },
      {
        id: 'mock-12',
        password: 'NP012',
        specialty: 'nao-prioritario',
        phone: '11999999012',
        status: 'waiting-doctor',
        timestamps: {
          generated: new Date(now.getTime() - 20 * 60 * 1000), // 20 min ago
          triageCompleted: new Date(now.getTime() - 18 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 15 * 60 * 1000)
        }
      },
      // Em Atendimento (2 pacientes - dentro do SLA)
      {
        id: 'mock-13',
        password: 'NP013',
        specialty: 'nao-prioritario',
        phone: '11999999013',
        status: 'in-consultation',
        timestamps: {
          generated: new Date(now.getTime() - 120 * 60 * 1000), // 2h ago
          triageCompleted: new Date(now.getTime() - 115 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 110 * 60 * 1000),
          consultationStarted: new Date(now.getTime() - 15 * 60 * 1000)
        }
      },
      {
        id: 'mock-14',
        password: 'PR014',
        specialty: 'prioritario',
        phone: '11999999014',
        status: 'in-consultation',
        timestamps: {
          generated: new Date(now.getTime() - 80 * 60 * 1000), // 1h20 ago
          triageCompleted: new Date(now.getTime() - 75 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 70 * 60 * 1000),
          consultationStarted: new Date(now.getTime() - 10 * 60 * 1000)
        }
      },
      // Aguardando Exame (1 paciente - dentro do SLA)
      {
        id: 'mock-15',
        password: 'NP015',
        specialty: 'nao-prioritario',
        phone: '11999999015',
        status: 'waiting-exam',
        timestamps: {
          generated: new Date(now.getTime() - 150 * 60 * 1000), // 2h30 ago
          triageCompleted: new Date(now.getTime() - 145 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 140 * 60 * 1000),
          consultationCompleted: new Date(now.getTime() - 30 * 60 * 1000)
        }
      },
      // Em Exame (1 paciente - dentro do SLA)
      {
        id: 'mock-16',
        password: 'NP016',
        specialty: 'nao-prioritario',
        phone: '11999999016',
        status: 'in-exam',
        timestamps: {
          generated: new Date(now.getTime() - 100 * 60 * 1000), // 1h40 ago
          triageCompleted: new Date(now.getTime() - 95 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 90 * 60 * 1000),
          consultationCompleted: new Date(now.getTime() - 45 * 60 * 1000),
          examStarted: new Date(now.getTime() - 10 * 60 * 1000)
        }
      },
      // Aguardando Medicação (2 pacientes - dentro do SLA)
      {
        id: 'mock-17',
        password: 'PR017',
        specialty: 'prioritario',
        phone: '11999999017',
        status: 'waiting-medication',
        timestamps: {
          generated: new Date(now.getTime() - 180 * 60 * 1000), // 3h ago
          triageCompleted: new Date(now.getTime() - 175 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 170 * 60 * 1000),
          consultationCompleted: new Date(now.getTime() - 120 * 60 * 1000),
          examCompleted: new Date(now.getTime() - 60 * 60 * 1000)
        }
      },
      {
        id: 'mock-18',
        password: 'NP018',
        specialty: 'nao-prioritario',
        phone: '11999999018',
        status: 'waiting-medication',
        timestamps: {
          generated: new Date(now.getTime() - 90 * 60 * 1000), // 1h30 ago
          triageCompleted: new Date(now.getTime() - 85 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 80 * 60 * 1000),
          consultationCompleted: new Date(now.getTime() - 40 * 60 * 1000),
          examCompleted: new Date(now.getTime() - 15 * 60 * 1000)
        }
      },
      // Em Medicação (1 paciente - dentro do SLA)
      {
        id: 'mock-19',
        password: 'NP019',
        specialty: 'nao-prioritario',
        phone: '11999999019',
        status: 'in-medication',
        timestamps: {
          generated: new Date(now.getTime() - 120 * 60 * 1000), // 2h ago
          triageCompleted: new Date(now.getTime() - 115 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 110 * 60 * 1000),
          consultationCompleted: new Date(now.getTime() - 70 * 60 * 1000),
          examCompleted: new Date(now.getTime() - 30 * 60 * 1000),
          medicationStarted: new Date(now.getTime() - 5 * 60 * 1000)
        }
      },
      // Aguardando Repouso no Leito (1 paciente - dentro do SLA)
      {
        id: 'mock-20',
        password: 'PR020',
        specialty: 'prioritario',
        phone: '11999999020',
        status: 'waiting-hospitalization',
        timestamps: {
          generated: new Date(now.getTime() - 200 * 60 * 1000), // 3h20 ago
          triageCompleted: new Date(now.getTime() - 195 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 190 * 60 * 1000),
          consultationCompleted: new Date(now.getTime() - 150 * 60 * 1000),
          examCompleted: new Date(now.getTime() - 100 * 60 * 1000),
          medicationCompleted: new Date(now.getTime() - 60 * 60 * 1000)
        }
      },
      // Internado (1 paciente - dentro do SLA)
      {
        id: 'mock-21',
        password: 'NP021',
        specialty: 'nao-prioritario',
        phone: '11999999021',
        status: 'in-hospitalization',
        timestamps: {
          generated: new Date(now.getTime() - 300 * 60 * 1000), // 5h ago
          triageCompleted: new Date(now.getTime() - 295 * 60 * 1000),
          adminCompleted: new Date(now.getTime() - 290 * 60 * 1000),
          consultationCompleted: new Date(now.getTime() - 250 * 60 * 1000),
          examCompleted: new Date(now.getTime() - 200 * 60 * 1000),
          medicationCompleted: new Date(now.getTime() - 150 * 60 * 1000),
          hospitalizationStarted: new Date(now.getTime() - 120 * 60 * 1000)
        }
      }
    ];

    setPatients(mockPatients);
    setCurrentPasswordNumber(22);
  }, []);

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
              
              // CRITICAL: Merge triage personal data into main personalData
              if (additionalData.triageData.personalData) {
                updatedPatient.personalData = {
                  ...updatedPatient.personalData,
                  fullName: additionalData.triageData.personalData.fullName || additionalData.triageData.personalData.name,
                  name: additionalData.triageData.personalData.name,
                  age: additionalData.triageData.personalData.age,
                  biologicalSex: additionalData.triageData.personalData.biologicalSex || additionalData.triageData.personalData.gender,
                  gender: additionalData.triageData.personalData.gender,
                  dateOfBirth: additionalData.triageData.personalData.dateOfBirth,
                  cpf: updatedPatient.personalData?.cpf || '',
                  canBeAttended: updatedPatient.personalData?.canBeAttended ?? true
                };
              }
            }
            break;
          case 'in-admin':
            updatedPatient.timestamps.adminStarted = new Date();
            break;
          case 'waiting-doctor':
            updatedPatient.timestamps.adminCompleted = new Date();
            if (additionalData?.personalData) {
              // Merge administrative data with existing data
              updatedPatient.personalData = {
                ...updatedPatient.personalData,
                ...additionalData.personalData,
                // Preserve name from triage if not provided in admin
                fullName: additionalData.personalData.fullName || updatedPatient.personalData?.fullName || additionalData.personalData.name || updatedPatient.personalData?.name || '',
                name: additionalData.personalData.name || additionalData.personalData.fullName || updatedPatient.personalData?.name || updatedPatient.personalData?.fullName || ''
              };
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
