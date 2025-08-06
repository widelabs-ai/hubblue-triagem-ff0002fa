
export interface VitalRange {
  min: number;
  max: number;
  unit: string;
}

export interface VitalRanges {
  heartRate: VitalRange;
  temperature: VitalRange;
  oxygenSaturation: VitalRange;
  respiratoryRate: VitalRange;
  systolicBP: VitalRange;
  diastolicBP: VitalRange;
  glasgow: VitalRange;
  glucose: VitalRange;
}

export const VITAL_RANGES: VitalRanges = {
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  temperature: { min: 36.1, max: 37.2, unit: '°C' },
  oxygenSaturation: { min: 95, max: 100, unit: '%' },
  respiratoryRate: { min: 12, max: 20, unit: 'rpm' },
  systolicBP: { min: 90, max: 140, unit: 'mmHg' },
  diastolicBP: { min: 60, max: 90, unit: 'mmHg' },
  glasgow: { min: 13, max: 15, unit: 'pts' },
  glucose: { min: 70, max: 140, unit: 'mg/dL' }
};

export interface ValidationResult {
  isValid: boolean;
  isOutOfRange: boolean;
  message?: string;
  severity?: 'warning' | 'error';
}

export const validateHeartRate = (value: string): ValidationResult => {
  if (!value) return { isValid: true, isOutOfRange: false };
  
  const num = parseInt(value);
  
  if (isNaN(num) || num < 0 || num > 300) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Frequência cardíaca deve ser um número entre 0 e 300',
      severity: 'error'
    };
  }
  
  if (num < VITAL_RANGES.heartRate.min || num > VITAL_RANGES.heartRate.max) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor fora da referência`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, isOutOfRange: false, message: 'Valor dentro da referência' };
};

export const validateTemperature = (value: string): ValidationResult => {
  if (!value) return { isValid: true, isOutOfRange: false };
  
  const num = parseFloat(value);
  
  if (isNaN(num) || num < 30 || num > 45) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Temperatura deve ser um número entre 30°C e 45°C',
      severity: 'error'
    };
  }
  
  if (num < VITAL_RANGES.temperature.min || num > VITAL_RANGES.temperature.max) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor fora da referência`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, isOutOfRange: false, message: 'Valor dentro da referência' };
};

export const validateOxygenSaturation = (value: string): ValidationResult => {
  if (!value) return { isValid: true, isOutOfRange: false };
  
  const num = parseInt(value);
  
  if (isNaN(num) || num < 0 || num > 100) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Saturação deve ser um número entre 0% e 100%',
      severity: 'error'
    };
  }
  
  if (num < VITAL_RANGES.oxygenSaturation.min) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor fora da referência`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, isOutOfRange: false, message: 'Valor dentro da referência' };
};

export const validateBloodPressure = (value: string): ValidationResult => {
  if (!value) return { isValid: true, isOutOfRange: false };
  
  const parts = value.split('x').map(p => p.trim());
  if (parts.length !== 2) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Use o formato: 120x80',
      severity: 'error'
    };
  }
  
  const systolic = parseInt(parts[0]);
  const diastolic = parseInt(parts[1]);
  
  if (isNaN(systolic) || isNaN(diastolic) || systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Valores inválidos de pressão arterial',
      severity: 'error'
    };
  }
  
  if (systolic <= diastolic) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Pressão sistólica deve ser maior que a diastólica',
      severity: 'error'
    };
  }
  
  const systolicOutOfRange = systolic < VITAL_RANGES.systolicBP.min || systolic > VITAL_RANGES.systolicBP.max;
  const diastolicOutOfRange = diastolic < VITAL_RANGES.diastolicBP.min || diastolic > VITAL_RANGES.diastolicBP.max;
  
  if (systolicOutOfRange || diastolicOutOfRange) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor fora da referência`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, isOutOfRange: false, message: 'Valor dentro da referência' };
};

export const validateRespiratoryRate = (value: string): ValidationResult => {
  if (!value) return { isValid: true, isOutOfRange: false };
  
  const num = parseInt(value);
  
  if (isNaN(num) || num < 0 || num > 60) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Frequência respiratória deve ser um número entre 0 e 60',
      severity: 'error'
    };
  }
  
  if (num < VITAL_RANGES.respiratoryRate.min || num > VITAL_RANGES.respiratoryRate.max) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor fora da referência`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, isOutOfRange: false, message: 'Valor dentro da referência' };
};

export const validateGlasgow = (value: string): ValidationResult => {
  if (!value) return { isValid: true, isOutOfRange: false };
  
  const num = parseInt(value);
  
  if (isNaN(num) || num < 3 || num > 15) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Escala de Glasgow deve ser entre 3 e 15',
      severity: 'error'
    };
  }
  
  if (num < VITAL_RANGES.glasgow.min) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor fora da referência`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, isOutOfRange: false, message: 'Valor dentro da referência' };
};

export const validateGlucose = (value: string): ValidationResult => {
  if (!value) return { isValid: true, isOutOfRange: false };
  
  const num = parseInt(value);
  
  if (isNaN(num) || num < 10 || num > 600) {
    return {
      isValid: false,
      isOutOfRange: false,
      message: 'Glicemia deve ser um número entre 10 e 600',
      severity: 'error'
    };
  }
  
  if (num < VITAL_RANGES.glucose.min || num > VITAL_RANGES.glucose.max) {
    return {
      isValid: true,
      isOutOfRange: true,
      message: `Valor fora da referência`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, isOutOfRange: false, message: 'Valor dentro da referência' };
};

// Função para calcular PAM (Pressão Arterial Média)
export const calculatePAM = (bloodPressure: string): number | null => {
  if (!bloodPressure) return null;
  
  const parts = bloodPressure.split('x').map(p => p.trim());
  if (parts.length !== 2) return null;
  
  const systolic = parseInt(parts[0]);
  const diastolic = parseInt(parts[1]);
  
  if (isNaN(systolic) || isNaN(diastolic)) return null;
  
  return Math.round((systolic + 2 * diastolic) / 3);
};
