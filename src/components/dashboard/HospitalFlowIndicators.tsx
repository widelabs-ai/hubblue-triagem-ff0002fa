import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHospital } from '@/contexts/HospitalContext';
import { getPatientName } from '@/utils/patientUtils';
import type { Patient } from '@/contexts/HospitalContext';

const HospitalFlowIndicators: React.FC = () => {
  const { getPatientFlowStats, getPatientsByStatus, patients, getTimeElapsed, isOverSLA } = useHospital();
  const flowStats = getPatientFlowStats();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Mock data expandido para simular um cenário hospitalar realista
  const mockPatients: Patient[] = [
    // Aguardando Triagem
    { 
      id: 'mock1', 
      password: 'PR001', 
      status: 'waiting-triage' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 99999-9999', 
      timestamps: { 
        generated: new Date(Date.now() - 5 * 60000),
        triageStarted: undefined,
        triageCompleted: undefined,
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      }, 
      personalData: { name: 'João Silva', age: 45, gender: 'masculino', cpf: '123.456.789-00', canBeAttended: true },
      triageData: { priority: 'amarelo' as const, complaints: 'Dor no peito' }
    },
    { 
      id: 'mock2', 
      password: 'NP002', 
      status: 'waiting-triage' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 88888-8888',
      timestamps: { 
        generated: new Date(Date.now() - 12 * 60000),
        triageStarted: undefined,
        triageCompleted: undefined,
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Ana Santos', age: 32, gender: 'feminino', cpf: '987.654.321-00', canBeAttended: true },
      triageData: { priority: 'verde' as const, complaints: 'Febre leve' }
    },
    { 
      id: 'mock3', 
      password: 'PR003', 
      status: 'waiting-triage' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 77777-7777',
      timestamps: { 
        generated: new Date(Date.now() - 8 * 60000),
        triageStarted: undefined,
        triageCompleted: undefined,
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Carlos Oliveira', age: 67, gender: 'masculino', cpf: '456.789.123-00', canBeAttended: true },
      triageData: { priority: 'laranja' as const, complaints: 'Dificuldade respiratória' }
    },
    
    // Em Triagem
    { 
      id: 'mock4', 
      password: 'PR004', 
      status: 'in-triage' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 66666-6666',
      timestamps: { 
        generated: new Date(Date.now() - 18 * 60000),
        triageStarted: new Date(Date.now() - 5 * 60000),
        triageCompleted: undefined,
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Roberto Lima', age: 55, gender: 'masculino', cpf: '321.987.654-00', canBeAttended: true },
      triageData: { priority: 'vermelho' as const, complaints: 'Dor no peito intensa' }
    },
    { 
      id: 'mock5', 
      password: 'NP005', 
      status: 'in-triage' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 55555-5555',
      timestamps: { 
        generated: new Date(Date.now() - 22 * 60000),
        triageStarted: new Date(Date.now() - 8 * 60000),
        triageCompleted: undefined,
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Maria Costa', age: 28, gender: 'feminino', cpf: '654.321.987-00', canBeAttended: true },
      triageData: { priority: 'azul' as const, complaints: 'Consulta de rotina' }
    },

    // Aguardando Administrativo
    { 
      id: 'mock6', 
      password: 'PR006', 
      status: 'waiting-admin' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 44444-4444',
      timestamps: { 
        generated: new Date(Date.now() - 35 * 60000),
        triageStarted: new Date(Date.now() - 25 * 60000),
        triageCompleted: new Date(Date.now() - 20 * 60000),
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Pedro Almeida', age: 42, gender: 'masculino', cpf: '789.123.456-00', canBeAttended: true },
      triageData: { priority: 'amarelo' as const, complaints: 'Dor abdominal' }
    },
    { 
      id: 'mock7', 
      password: 'NP007', 
      status: 'waiting-admin' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 33333-3333',
      timestamps: { 
        generated: new Date(Date.now() - 28 * 60000),
        triageStarted: new Date(Date.now() - 18 * 60000),
        triageCompleted: new Date(Date.now() - 12 * 60000),
        adminStarted: undefined,
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Lucia Fernandes', age: 38, gender: 'feminino', cpf: '159.753.486-00', canBeAttended: true },
      triageData: { priority: 'verde' as const, complaints: 'Dor de cabeça' }
    },

    // Em Administrativo
    { 
      id: 'mock8', 
      password: 'PR008', 
      status: 'in-admin' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 22222-2222',
      timestamps: { 
        generated: new Date(Date.now() - 50 * 60000),
        triageStarted: new Date(Date.now() - 40 * 60000),
        triageCompleted: new Date(Date.now() - 35 * 60000),
        adminStarted: new Date(Date.now() - 10 * 60000),
        adminCompleted: undefined,
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'José Santos', age: 61, gender: 'masculino', cpf: '852.963.741-00', canBeAttended: true },
      triageData: { priority: 'laranja' as const, complaints: 'Tontura e mal-estar' }
    },

    // Aguardando Médico
    { 
      id: 'mock9', 
      password: 'PR009', 
      status: 'waiting-doctor' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 11111-1111',
      timestamps: { 
        generated: new Date(Date.now() - 65 * 60000),
        triageStarted: new Date(Date.now() - 55 * 60000),
        triageCompleted: new Date(Date.now() - 50 * 60000),
        adminStarted: new Date(Date.now() - 40 * 60000),
        adminCompleted: new Date(Date.now() - 25 * 60000),
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Sandra Oliveira', age: 49, gender: 'feminino', cpf: '741.852.963-00', canBeAttended: true },
      triageData: { priority: 'amarelo' as const, complaints: 'Náusea e vômito' }
    },
    { 
      id: 'mock10', 
      password: 'NP010', 
      status: 'waiting-doctor' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 99999-0000',
      timestamps: { 
        generated: new Date(Date.now() - 45 * 60000),
        triageStarted: new Date(Date.now() - 35 * 60000),
        triageCompleted: new Date(Date.now() - 30 * 60000),
        adminStarted: new Date(Date.now() - 20 * 60000),
        adminCompleted: new Date(Date.now() - 15 * 60000),
        consultationStarted: undefined,
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Antonio Silva', age: 36, gender: 'masculino', cpf: '963.741.852-00', canBeAttended: true },
      triageData: { priority: 'verde' as const, complaints: 'Dor nas costas' }
    },

    // Em Consulta
    { 
      id: 'mock11', 
      password: 'PR011', 
      status: 'in-consultation' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 88888-0000',
      timestamps: { 
        generated: new Date(Date.now() - 85 * 60000),
        triageStarted: new Date(Date.now() - 75 * 60000),
        triageCompleted: new Date(Date.now() - 70 * 60000),
        adminStarted: new Date(Date.now() - 60 * 60000),
        adminCompleted: new Date(Date.now() - 45 * 60000),
        consultationStarted: new Date(Date.now() - 15 * 60000),
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Fernanda Lima', age: 33, gender: 'feminino', cpf: '147.258.369-00', canBeAttended: true },
      triageData: { priority: 'amarelo' as const, complaints: 'Dor de garganta forte' }
    },
    { 
      id: 'mock12', 
      password: 'NP012', 
      status: 'in-consultation' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 77777-0000',
      timestamps: { 
        generated: new Date(Date.now() - 70 * 60000),
        triageStarted: new Date(Date.now() - 60 * 60000),
        triageCompleted: new Date(Date.now() - 55 * 60000),
        adminStarted: new Date(Date.now() - 45 * 60000),
        adminCompleted: new Date(Date.now() - 35 * 60000),
        consultationStarted: new Date(Date.now() - 20 * 60000),
        consultationCompleted: undefined,
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Ricardo Pereira', age: 44, gender: 'masculino', cpf: '258.369.147-00', canBeAttended: true },
      triageData: { priority: 'verde' as const, complaints: 'Exame de rotina' }
    },

    // Aguardando Exame
    { 
      id: 'mock13', 
      password: 'PR013', 
      status: 'waiting-exam' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 66666-0000',
      timestamps: { 
        generated: new Date(Date.now() - 110 * 60000),
        triageStarted: new Date(Date.now() - 100 * 60000),
        triageCompleted: new Date(Date.now() - 95 * 60000),
        adminStarted: new Date(Date.now() - 85 * 60000),
        adminCompleted: new Date(Date.now() - 70 * 60000),
        consultationStarted: new Date(Date.now() - 50 * 60000),
        consultationCompleted: new Date(Date.now() - 30 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Beatriz Costa', age: 29, gender: 'feminino', cpf: '369.147.258-00', canBeAttended: true },
      triageData: { priority: 'laranja' as const, complaints: 'Suspeita de apendicite' }
    },

    // Em Exame
    { 
      id: 'mock14', 
      password: 'NP014', 
      status: 'in-exam' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 55555-0000',
      timestamps: { 
        generated: new Date(Date.now() - 95 * 60000),
        triageStarted: new Date(Date.now() - 85 * 60000),
        triageCompleted: new Date(Date.now() - 80 * 60000),
        adminStarted: new Date(Date.now() - 70 * 60000),
        adminCompleted: new Date(Date.now() - 60 * 60000),
        consultationStarted: new Date(Date.now() - 45 * 60000),
        consultationCompleted: new Date(Date.now() - 35 * 60000),
        examStarted: new Date(Date.now() - 10 * 60000),
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Marcos Souza', age: 52, gender: 'masculino', cpf: '753.486.159-00', canBeAttended: true },
      triageData: { priority: 'azul' as const, complaints: 'Raio-X de controle' }
    },

    // Aguardando Medicação
    { 
      id: 'mock15', 
      password: 'PR015', 
      status: 'waiting-medication' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 44444-0000',
      timestamps: { 
        generated: new Date(Date.now() - 125 * 60000),
        triageStarted: new Date(Date.now() - 115 * 60000),
        triageCompleted: new Date(Date.now() - 110 * 60000),
        adminStarted: new Date(Date.now() - 100 * 60000),
        adminCompleted: new Date(Date.now() - 85 * 60000),
        consultationStarted: new Date(Date.now() - 65 * 60000),
        consultationCompleted: new Date(Date.now() - 45 * 60000),
        examStarted: new Date(Date.now() - 35 * 60000),
        examCompleted: new Date(Date.now() - 25 * 60000),
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Carla Rodrigues', age: 41, gender: 'feminino', cpf: '486.159.753-00', canBeAttended: true },
      triageData: { priority: 'amarelo' as const, complaints: 'Infecção tratável' }
    },

    // Em Medicação
    { 
      id: 'mock16', 
      password: 'NP016', 
      status: 'in-medication' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 33333-0000',
      timestamps: { 
        generated: new Date(Date.now() - 90 * 60000),
        triageStarted: new Date(Date.now() - 80 * 60000),
        triageCompleted: new Date(Date.now() - 75 * 60000),
        adminStarted: new Date(Date.now() - 65 * 60000),
        adminCompleted: new Date(Date.now() - 55 * 60000),
        consultationStarted: new Date(Date.now() - 40 * 60000),
        consultationCompleted: new Date(Date.now() - 30 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: new Date(Date.now() - 15 * 60000),
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Paulo Martins', age: 37, gender: 'masculino', cpf: '159.753.486-00', canBeAttended: true },
      triageData: { priority: 'verde' as const, complaints: 'Administração de soro' }
    },

    // Prescrição Emitida
    { 
      id: 'mock17', 
      password: 'PR017', 
      status: 'prescription-issued' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 22222-0000',
      timestamps: { 
        generated: new Date(Date.now() - 140 * 60000),
        triageStarted: new Date(Date.now() - 130 * 60000),
        triageCompleted: new Date(Date.now() - 125 * 60000),
        adminStarted: new Date(Date.now() - 115 * 60000),
        adminCompleted: new Date(Date.now() - 100 * 60000),
        consultationStarted: new Date(Date.now() - 80 * 60000),
        consultationCompleted: new Date(Date.now() - 60 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: new Date(Date.now() - 5 * 60000),
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Helena Dias', age: 58, gender: 'feminino', cpf: '753.159.486-00', canBeAttended: true },
      triageData: { priority: 'verde' as const, complaints: 'Consulta finalizada' }
    },

    // Alta
    { 
      id: 'mock18', 
      password: 'PR018', 
      status: 'discharged' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 11111-0000',
      timestamps: { 
        generated: new Date(Date.now() - 180 * 60000),
        triageStarted: new Date(Date.now() - 170 * 60000),
        triageCompleted: new Date(Date.now() - 165 * 60000),
        adminStarted: new Date(Date.now() - 155 * 60000),
        adminCompleted: new Date(Date.now() - 140 * 60000),
        consultationStarted: new Date(Date.now() - 120 * 60000),
        consultationCompleted: new Date(Date.now() - 100 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: new Date(Date.now() - 15 * 60000),
        discharged: new Date(Date.now() - 10 * 60000),
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Gabriel Nascimento', age: 31, gender: 'masculino', cpf: '486.753.159-00', canBeAttended: true },
      triageData: { priority: 'verde' as const, complaints: 'Atendimento finalizado com sucesso' }
    },
    { 
      id: 'mock19', 
      password: 'NP019', 
      status: 'discharged' as const, 
      specialty: 'nao-prioritario' as const, 
      phone: '(11) 99999-1111',
      timestamps: { 
        generated: new Date(Date.now() - 200 * 60000),
        triageStarted: new Date(Date.now() - 190 * 60000),
        triageCompleted: new Date(Date.now() - 185 * 60000),
        adminStarted: new Date(Date.now() - 175 * 60000),
        adminCompleted: new Date(Date.now() - 160 * 60000),
        consultationStarted: new Date(Date.now() - 140 * 60000),
        consultationCompleted: new Date(Date.now() - 120 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: undefined,
        transferCompleted: undefined,
        prescriptionIssued: new Date(Date.now() - 25 * 60000),
        discharged: new Date(Date.now() - 20 * 60000),
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Isabela Ferreira', age: 26, gender: 'feminino', cpf: '159.486.753-00', canBeAttended: true },
      triageData: { priority: 'azul' as const, complaints: 'Check-up concluído' }
    },

    // Transferidos
    { 
      id: 'mock20', 
      password: 'PR020', 
      status: 'transferred' as const, 
      specialty: 'prioritario' as const, 
      phone: '(11) 88888-1111',
      timestamps: { 
        generated: new Date(Date.now() - 300 * 60000),
        triageStarted: new Date(Date.now() - 290 * 60000),
        triageCompleted: new Date(Date.now() - 285 * 60000),
        adminStarted: new Date(Date.now() - 275 * 60000),
        adminCompleted: new Date(Date.now() - 260 * 60000),
        consultationStarted: new Date(Date.now() - 240 * 60000),
        consultationCompleted: new Date(Date.now() - 220 * 60000),
        examStarted: undefined,
        examCompleted: undefined,
        medicationStarted: undefined,
        medicationCompleted: undefined,
        hospitalizationStarted: undefined,
        hospitalizationCompleted: undefined,
        interConsultationStarted: undefined,
        interConsultationCompleted: undefined,
        transferStarted: new Date(Date.now() - 30 * 60000),
        transferCompleted: new Date(Date.now() - 15 * 60000),
        prescriptionIssued: undefined,
        discharged: undefined,
        deceased: undefined,
        cancelled: undefined
      },
      personalData: { name: 'Eduardo Silva', age: 72, gender: 'masculino', cpf: '753.486.159-00', canBeAttended: true },
      triageData: { priority: 'vermelho' as const, complaints: 'Transferido para UTI especializada' }
    }
  ];

  // Combine real and mock data
  const allPatients: Patient[] = [...patients, ...mockPatients];

  const indicators = [
    { key: 'waiting-triage', label: 'Aguard. Triagem', icon: '🏥', color: 'bg-yellow-50 border-yellow-200 text-yellow-600', slaMinutes: 10 },
    { key: 'in-triage', label: 'Em Triagem', icon: '🩺', color: 'bg-orange-50 border-orange-200 text-orange-600', slaMinutes: 15 },
    { key: 'waiting-admin', label: 'Aguard. Admin', icon: '📋', color: 'bg-purple-50 border-purple-200 text-purple-600', slaMinutes: 15 },
    { key: 'in-admin', label: 'Em Admin', icon: '📝', color: 'bg-indigo-50 border-indigo-200 text-indigo-600', slaMinutes: 20 },
    { key: 'waiting-doctor', label: 'Aguard. Médico', icon: '⏳', color: 'bg-blue-50 border-blue-200 text-blue-600', slaMinutes: 30 },
    { key: 'in-consultation', label: 'Em Consulta', icon: '👨‍⚕️', color: 'bg-teal-50 border-teal-200 text-teal-600', slaMinutes: 45 },
    { key: 'waiting-exam', label: 'Aguard. Exame', icon: '🔬', color: 'bg-cyan-50 border-cyan-200 text-cyan-600', slaMinutes: 60 },
    { key: 'in-exam', label: 'Em Exame', icon: '🧪', color: 'bg-sky-50 border-sky-200 text-sky-600', slaMinutes: 30 },
    { key: 'waiting-medication', label: 'Aguard. Medicação', icon: '💊', color: 'bg-pink-50 border-pink-200 text-pink-600', slaMinutes: 20 },
    { key: 'in-medication', label: 'Em Medicação', icon: '💉', color: 'bg-rose-50 border-rose-200 text-rose-600', slaMinutes: 15 },
    { key: 'waiting-hospitalization', label: 'Aguard. Internação', icon: '🏥', color: 'bg-red-50 border-red-200 text-red-600', slaMinutes: 120 },
    { key: 'in-hospitalization', label: 'Em Internação', icon: '🛏️', color: 'bg-amber-50 border-amber-200 text-amber-600', slaMinutes: 1440 },
    { key: 'waiting-inter-consultation', label: 'Aguard. Inter-consulta', icon: '🔄', color: 'bg-lime-50 border-lime-200 text-lime-600', slaMinutes: 90 },
    { key: 'in-inter-consultation', label: 'Em Inter-consulta', icon: '🤝', color: 'bg-green-50 border-green-200 text-green-600', slaMinutes: 60 },
    { key: 'waiting-transfer', label: 'Aguard. Transfer.', icon: '🚑', color: 'bg-emerald-50 border-emerald-200 text-emerald-600', slaMinutes: 30 },
    { key: 'readyForReassessment', label: 'Prontos p/ Reavaliação', icon: '🔄', color: 'bg-violet-50 border-violet-200 text-violet-600', slaMinutes: 60 },
    { key: 'prescription-issued', label: 'Prescrição Emitida', icon: '📄', color: 'bg-slate-50 border-slate-200 text-slate-600', slaMinutes: 0 },
  ];

  const finalOutcomes = [
    { key: 'discharged', label: 'Alta', icon: '✅', color: 'bg-green-50 border-green-200 text-green-600' },
    { key: 'transferred', label: 'Transferido', icon: '↗️', color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { key: 'deceased', label: 'Óbito', icon: '💔', color: 'bg-gray-50 border-gray-200 text-gray-600' },
  ];

  const checkSLAViolations = (statusKey: string, slaMinutes: number) => {
    if (statusKey === 'readyForReassessment') {
      const readyPatients = getReadyForReassessmentPatients();
      return readyPatients.some(patient => {
        const timeElapsed = getTimeElapsed(patient, 'generated');
        return timeElapsed > slaMinutes;
      });
    }
    
    const patientsInStatus = getPatientsInStage(statusKey);
    return patientsInStatus.some(patient => {
      const timeElapsed = getTimeElapsed(patient, 'generated');
      return timeElapsed > slaMinutes;
    });
  };

  const getReadyForReassessmentPatients = (): Patient[] => {
    return allPatients.filter(p => {
      return p.timestamps.examCompleted || 
             p.timestamps.medicationCompleted || 
             p.timestamps.interConsultationCompleted;
    });
  };

  const getPatientsInStage = (statusKey: string): Patient[] => {
    if (statusKey === 'readyForReassessment') {
      return getReadyForReassessmentPatients();
    }
    return allPatients.filter(p => p.status === statusKey);
  };

  const getPatientTimeInStage = (patient: Patient) => {
    return getTimeElapsed(patient, 'generated');
  };

  const getIndicatorCount = (key: string) => {
    if (key === 'readyForReassessment') {
      return getReadyForReassessmentPatients().length;
    }
    return getPatientsInStage(key).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          🏥 Fluxo de Pacientes - Indicadores em Tempo Real
        </h3>
        
        {/* Indicadores do Fluxo */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
          {indicators.map(indicator => {
            const count = getIndicatorCount(indicator.key);
            const hasSLAViolation = checkSLAViolations(indicator.key, indicator.slaMinutes);
            
            return (
              <Dialog key={indicator.key}>
                <DialogTrigger asChild>
                  <Card 
                    className={`${indicator.color} cursor-pointer hover:shadow-md transition-shadow ${
                      hasSLAViolation ? 'ring-2 ring-red-500 animate-pulse' : ''
                    }`}
                  >
                    <CardContent className="p-3 text-center relative">
                      {hasSLAViolation && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <div className="text-lg mb-1">{indicator.icon}</div>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs leading-tight">{indicator.label}</div>
                      {hasSLAViolation && (
                        <div className="text-xs text-red-600 font-bold mt-1">⚠️ SLA</div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-2xl">{indicator.icon}</span>
                      {indicator.label} - {count} paciente(s)
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {count > 0 ? (
                      <div className="grid gap-3">
                        {getPatientsInStage(indicator.key).map((patient: Patient) => {
                          const timeElapsed = getPatientTimeInStage(patient);
                          const isOverSLA = timeElapsed > indicator.slaMinutes;
                          
                          return (
                            <Card key={patient.id} className={`${isOverSLA ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-lg">{patient.password}</div>
                                    <div className="text-sm text-gray-600">
                                      {getPatientName(patient)}
                                    </div>
                                    <div className="text-sm">
                                      {patient.triageData?.priority && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          patient.triageData.priority === 'vermelho' ? 'bg-red-100 text-red-800' :
                                          patient.triageData.priority === 'laranja' ? 'bg-orange-100 text-orange-800' :
                                          patient.triageData.priority === 'amarelo' ? 'bg-yellow-100 text-yellow-800' :
                                          patient.triageData.priority === 'verde' ? 'bg-green-100 text-green-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {patient.triageData.priority.toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${isOverSLA ? 'text-red-600' : 'text-green-600'}`}>
                                      {timeElapsed} min
                                    </div>
                                    {isOverSLA && (
                                      <div className="text-xs text-red-600 font-bold">
                                        ⚠️ {timeElapsed - indicator.slaMinutes} min acima do SLA
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum paciente nesta etapa no momento
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* Desfechos Finais */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-700">📊 Desfechos Finais</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {finalOutcomes.map(outcome => {
              const count = getIndicatorCount(outcome.key);
              
              return (
                <Dialog key={outcome.key}>
                  <DialogTrigger asChild>
                    <Card className={`${outcome.color} cursor-pointer hover:shadow-md transition-shadow`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{outcome.icon}</div>
                        <div className="text-3xl font-bold">{count}</div>
                        <div className="text-sm">{outcome.label}</div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">{outcome.icon}</span>
                        {outcome.label} - {count} paciente(s)
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {count > 0 ? (
                        <div className="grid gap-3">
                          {getPatientsInStage(outcome.key).map((patient: Patient) => (
                            <Card key={patient.id} className="border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-lg">{patient.password}</div>
                                    <div className="text-sm text-gray-600">
                                      {getPatientName(patient)}
                                    </div>
                                    <div className="text-sm">
                                      {patient.triageData?.priority && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          patient.triageData.priority === 'vermelho' ? 'bg-red-100 text-red-800' :
                                          patient.triageData.priority === 'laranja' ? 'bg-orange-100 text-orange-800' :
                                          patient.triageData.priority === 'amarelo' ? 'bg-yellow-100 text-yellow-800' :
                                          patient.triageData.priority === 'verde' ? 'bg-green-100 text-green-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {patient.triageData.priority.toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {getPatientTimeInStage(patient)} min total
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Nenhum paciente nesta categoria no momento
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalFlowIndicators;
