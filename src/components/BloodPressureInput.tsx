
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationResult } from '@/utils/vitalsValidation';

interface BloodPressureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit: string;
  validation: ValidationResult;
  size?: 'sm';
  required?: boolean;
  className?: string;
}

const BloodPressureInput: React.FC<BloodPressureInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  unit,
  validation,
  size,
  required,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^\d]/g, ''); // Remove tudo que não é dígito
    
    if (inputValue.length > 0) {
      if (inputValue.length <= 3) {
        // Apenas a sistólica
        onChange(inputValue);
      } else if (inputValue.length <= 6) {
        // Sistólica + diastólica
        const systolic = inputValue.slice(0, 3);
        const diastolic = inputValue.slice(3);
        onChange(`${systolic}x${diastolic}`);
      }
    } else {
      onChange('');
    }
  };

  const displayValue = value.includes('x') ? value : value;

  const getInputClassName = () => {
    let baseClass = size === 'sm' ? 'text-xs h-8' : 'text-sm';
    baseClass += ' pr-12';
    
    if (!validation.isValid) {
      baseClass += ' border-red-500 bg-red-50';
    } else if (validation.isOutOfRange) {
      baseClass += ' border-yellow-500 bg-yellow-50';
    }
    
    return baseClass;
  };

  return (
    <div className={className}>
      <Label className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          maxLength={7} // 120x80 = 6 characters + x
          className={getInputClassName()}
          required={required}
        />
        {value && validation.isValid && (
          <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          } text-gray-500 pointer-events-none`}>
            {unit}
          </div>
        )}
      </div>
      {!validation.isValid && validation.message && (
        <div className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-red-600 mt-1`}>
          {validation.message}
        </div>
      )}
      {validation.isValid && validation.isOutOfRange && validation.message && (
        <div className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-yellow-600 mt-1`}>
          ⚠️ Valor fora da referência - {validation.message}
        </div>
      )}
    </div>
  );
};

export default BloodPressureInput;
