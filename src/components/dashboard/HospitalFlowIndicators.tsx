
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHospital } from '@/contexts/HospitalContext';
import { Users, UserCheck, ClipboardList, Stethoscope, Scissors, Bone, Baby } from 'lucide-react';

const HospitalFlowIndicators: React.FC = () => {
  const { getPatientsByStatusAndSpecialty } = useHospital();

  const specialtyConfig = {
    'clinica-medica': {
      name: 'Clínica Médica',
      icon: Stethoscope,
      color: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-600'
    },
    'cirurgia-geral': {
      name: 'Cirurgia Geral', 
      icon: Scissors,
      color: 'bg-red-100 text-red-800',
      iconColor: 'text-red-600'
    },
    'ortopedia': {
      name: 'Ortopedia',
      icon: Bone,
      color: 'bg-green-100 text-green-800', 
      iconColor: 'text-green-600'
    },
    'pediatria': {
      name: 'Pediatria',
      icon: Baby,
      color: 'bg-pink-100 text-pink-800',
      iconColor: 'text-pink-600'
    }
  } as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(specialtyConfig) as Array<keyof typeof specialtyConfig>).map((specialty) => {
          const config = specialtyConfig[specialty];
          const Icon = config.icon;
          
          const waiting = getPatientsByStatusAndSpecialty('waiting-doctor', specialty).length;
          const inConsultation = getPatientsByStatusAndSpecialty('in-consultation', specialty).length;
          
          return (
            <Card key={specialty} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  {config.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Aguardando</span>
                    <Badge variant="outline" className={config.color}>
                      {waiting}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Em Atendimento</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {inConsultation}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalFlowIndicators;
