
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KPICardsProps {
  slaViolations: number;
  avgTriageTime: number;
  avgTotalTime: number;
}

const KPICards: React.FC<KPICardsProps> = ({ slaViolations, avgTriageTime, avgTotalTime }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-red-600">🚨 Violações de SLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{slaViolations}</div>
          <div className="text-sm text-gray-600">pacientes fora do prazo</div>
        </CardContent>
      </Card>
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600">⏱️ Tempo Médio Triagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{Math.round(avgTriageTime)}</div>
          <div className="text-sm text-gray-600">minutos (meta: 10 min)</div>
        </CardContent>
      </Card>
      <Card className="border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-green-600">🏁 Tempo Médio Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{Math.round(avgTotalTime)}</div>
          <div className="text-sm text-gray-600">minutos (meta: 110 min)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
