
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KPICardsProps {
  slaViolations: number;
  onSlaViolationsClick: () => void;
}

const KPICards: React.FC<KPICardsProps> = ({ slaViolations, onSlaViolationsClick }) => {
  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <Card 
        className="border-red-200 cursor-pointer hover:border-red-300 transition-colors" 
        onClick={onSlaViolationsClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-red-600">🚨 Violações de SLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{slaViolations}</div>
          <div className="text-sm text-gray-600">pacientes fora do prazo - clique para ver detalhes</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
