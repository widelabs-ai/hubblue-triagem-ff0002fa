
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VitalSignInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit: string;
  validation: {
    isValid: boolean;
    message?: string;
    isOutOfRange?: boolean;
  };
  size?: 'sm' | 'default';
  required?: boolean;
}

const VitalSignInput: React.FC<VitalSignInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  unit,
  validation,
  size = 'default',
  required = false
}) => {
  const getInputClassName = () => {
    let baseClass = size === 'sm' ? 'text-xs h-8' : 'text-sm';
    
    if (!validation.isValid) {
      baseClass += ' border-red-500 bg-red-50';
    } else if (validation.isOutOfRange) {
      baseClass += ' border-yellow-500 bg-yellow-50';
    }
    
    return baseClass;
  };

  return (
    <div>
      <Label className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
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
          ⚠️ Valor fora da faixa normal - {validation.message}
        </div>
      )}
    </div>
  );
};

export default VitalSignInput;
