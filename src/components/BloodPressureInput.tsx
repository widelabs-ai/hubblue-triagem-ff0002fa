
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BloodPressureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit: string;
  validation: {
    isValid: boolean;
    message: string;
    severity: 'normal' | 'warning' | 'critical';
  };
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

  return (
    <div className={className}>
      <Label className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>
        {label}
      </Label>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          maxLength={7} // 120x80 = 6 characters + x
          className={`
            ${size === 'sm' ? 'text-xs h-8' : 'text-sm'}
            ${!validation.isValid ? 'border-red-500' : ''}
            pr-12
          `}
          required={required}
        />
        <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        } text-gray-500`}>
          {unit}
        </span>
      </div>
      {!validation.isValid && (
        <p className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-red-600 mt-1`}>
          {validation.message}
        </p>
      )}
    </div>
  );
};

export default BloodPressureInput;
