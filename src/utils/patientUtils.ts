
import { Patient } from '@/contexts/HospitalContext';

export const getPatientName = (patient: Patient): string => {
  // Prioridade: personalData.fullName > personalData.name > triageData.personalData.fullName > triageData.personalData.name > fallback
  if (patient.personalData?.fullName) {
    return patient.personalData.fullName;
  }
  if (patient.personalData?.name) {
    return patient.personalData.name;
  }
  if (patient.triageData?.personalData?.fullName) {
    return patient.triageData.personalData.fullName;
  }
  if (patient.triageData?.personalData?.name) {
    return patient.triageData.personalData.name;
  }
  return 'Nome não informado';
};

export const getPatientAge = (patient: Patient): number | string => {
  if (patient.personalData?.age) {
    return patient.personalData.age;
  }
  if (patient.triageData?.personalData?.age) {
    return patient.triageData.personalData.age;
  }
  return 'N/A';
};

export const getPatientGender = (patient: Patient): string => {
  const gender = patient.personalData?.gender || patient.triageData?.personalData?.gender;
  if (!gender) return 'N/A';
  
  switch (gender.toLowerCase()) {
    case 'masculino': return 'M';
    case 'feminino': return 'F';
    case 'outro': return 'O';
    case 'nao-informar': return 'N/I';
    default: return gender.charAt(0).toUpperCase();
  }
};

export const getPatientGenderFull = (patient: Patient): string => {
  const gender = patient.personalData?.gender || patient.triageData?.personalData?.gender;
  return gender || 'Não informado';
};

export const getPatientDateOfBirth = (patient: Patient): string => {
  return patient.personalData?.dateOfBirth || patient.triageData?.personalData?.dateOfBirth || 'Não informado';
};

export const getPatientCPF = (patient: Patient): string => {
  return patient.personalData?.cpf || 'Não informado';
};

export const hasPersonalData = (patient: Patient): boolean => {
  return !!(patient.personalData?.name || patient.triageData?.personalData?.name);
};
