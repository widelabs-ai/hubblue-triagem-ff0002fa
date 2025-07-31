
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ValidationResult } from '@/utils/vitalsValidation';

interface VitalSignInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit: string;
  validation: ValidationResult;
}

const VitalSignInput: React.FC<VitalSignInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  unit,
  validation
}) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pr-12 ${
            !validation.isValid ? 'border-red-500 focus-visible:ring-red-500' :
            validation.isOutOfRange ? 'border-yellow-500 focus-visible:ring-yellow-500' :
            value ? 'border-green-500 focus-visible:ring-green-500' : ''
          }`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">{unit}</span>
            {!validation.isValid ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : validation.isOutOfRange ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
      {validation.message && (
        <div className={`text-xs flex items-center gap-1 ${
          validation.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          <AlertTriangle className="h-3 w-3" />
          {validation.message}
        </div>
      )}
    </div>
  );
};

export default VitalSignInput;
