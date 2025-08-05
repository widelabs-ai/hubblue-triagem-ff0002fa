
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  validateHeartRate, 
  validateTemperature, 
  validateOxygenSaturation, 
  validateBloodPressure, 
  validateRespiratoryRate, 
  validateGlasgow, 
  validateGlucose 
} from '@/utils/vitalsValidation';

interface VitalSignsFormProps {
  vitals: any;
  onChange: (vitals: any) => void;
}

const VitalSignsForm: React.FC<VitalSignsFormProps> = ({ vitals, onChange }) => {
  const updateVital = (key: string, value: string) => {
    onChange({ ...vitals, [key]: value });
  };

  const getValidation = (key: string, value: string) => {
    switch (key) {
      case 'heartRate':
        return validateHeartRate(value);
      case 'temperature':
        return validateTemperature(value);
      case 'oxygenSaturation':
        return validateOxygenSaturation(value);
      case 'bloodPressure':
        return validateBloodPressure(value);
      case 'respiratoryRate':
        return validateRespiratoryRate(value);
      case 'glasgow':
        return validateGlasgow(value);
      case 'glucose':
        return validateGlucose(value);
      default:
        return { isValid: true, isOutOfRange: false };
    }
  };

  const renderVitalInput = (key: string, label: string, placeholder: string, unit: string) => {
    const value = vitals[key] || '';
    const validation = getValidation(key, value);
    
    const getInputClassName = () => {
      let baseClass = 'text-sm';
      
      if (!validation.isValid) {
        baseClass += ' border-red-500 bg-red-50';
      } else if (validation.isOutOfRange) {
        baseClass += ' border-yellow-500 bg-yellow-50';
      }
      
      return baseClass;
    };

    return (
      <div key={key}>
        <Label className="text-sm font-medium">{label}</Label>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => updateVital(key, e.target.value)}
            placeholder={placeholder}
            className={getInputClassName()}
          />
          {value && validation.isValid && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
              {unit}
            </div>
          )}
        </div>
        {!validation.isValid && validation.message && (
          <div className="text-sm text-red-600 mt-1">
            {validation.message}
          </div>
        )}
        {validation.isValid && validation.isOutOfRange && validation.message && (
          <div className="text-sm text-yellow-600 mt-1">
            ⚠️ {validation.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderVitalInput('heartRate', 'Frequência Cardíaca', 'Ex: 80', 'bpm')}
      {renderVitalInput('temperature', 'Temperatura', 'Ex: 36.5', '°C')}
      {renderVitalInput('oxygenSaturation', 'Saturação O₂', 'Ex: 98', '%')}
      {renderVitalInput('bloodPressure', 'Pressão Arterial', 'Ex: 120x80', 'mmHg')}
      {renderVitalInput('respiratoryRate', 'Freq. Respiratória', 'Ex: 16', 'rpm')}
      {renderVitalInput('glasgow', 'Escala de Glasgow', 'Ex: 15', 'pts')}
      {renderVitalInput('glucose', 'Glicemia', 'Ex: 90', 'mg/dL')}
    </div>
  );
};

export default VitalSignsForm;
