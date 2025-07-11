
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsGridProps {
  stats: {
    total: number;
    waitingTriage: number;
    inTriage: number;
    waitingAdmin: number;
    inAdmin: number;
    waitingDoctor: number;
    inConsultation: number;
    completed: number;
  };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-blue-600">Total</div>
        </CardContent>
      </Card>
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.waitingTriage}</div>
          <div className="text-xs text-yellow-600">Aguard. Triagem</div>
        </CardContent>
      </Card>
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.inTriage}</div>
          <div className="text-xs text-orange-600">Em Triagem</div>
        </CardContent>
      </Card>
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.waitingAdmin}</div>
          <div className="text-xs text-purple-600">Aguard. Admin</div>
        </CardContent>
      </Card>
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.inAdmin}</div>
          <div className="text-xs text-indigo-600">Em Admin</div>
        </CardContent>
      </Card>
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.waitingDoctor}</div>
          <div className="text-xs text-green-600">Aguard. Médico</div>
        </CardContent>
      </Card>
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-teal-600">{stats.inConsultation}</div>
          <div className="text-xs text-teal-600">Em Consulta</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
          <div className="text-xs text-gray-600">Concluídos</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsGrid;
