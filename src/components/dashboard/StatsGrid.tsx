
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
    waitingExam: number;
    inExam: number;
    waitingMedication: number;
    inMedication: number;
    waitingHospitalization: number;
    inHospitalization: number;
    waitingInterConsultation: number;
    inInterConsultation: number;
    waitingTransfer: number;
    prescriptionIssued: number;
    discharged: number;
    deceased: number;
    transferred: number;
    completed: number;
  };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const mainFlowStats = [
    { key: 'total', label: 'Total Geral', value: stats.total, color: 'bg-slate-50 border-slate-200 text-slate-600' },
    { key: 'waitingTriage', label: 'Aguard. Triagem', value: stats.waitingTriage, color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
    { key: 'inTriage', label: 'Em Triagem', value: stats.inTriage, color: 'bg-orange-50 border-orange-200 text-orange-600' },
    { key: 'waitingAdmin', label: 'Aguard. Admin', value: stats.waitingAdmin, color: 'bg-purple-50 border-purple-200 text-purple-600' },
    { key: 'inAdmin', label: 'Em Admin', value: stats.inAdmin, color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
    { key: 'waitingDoctor', label: 'Aguard. Médico', value: stats.waitingDoctor, color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { key: 'inConsultation', label: 'Em Consulta', value: stats.inConsultation, color: 'bg-teal-50 border-teal-200 text-teal-600' },
    { key: 'completed', label: 'Concluídos', value: stats.completed, color: 'bg-green-50 border-green-200 text-green-600' },
  ];

  const extendedFlowStats = [
    { key: 'waitingExam', label: 'Aguard. Exame', value: stats.waitingExam, color: 'bg-cyan-50 border-cyan-200 text-cyan-600' },
    { key: 'inExam', label: 'Em Exame', value: stats.inExam, color: 'bg-sky-50 border-sky-200 text-sky-600' },
    { key: 'waitingMedication', label: 'Aguard. Medicação', value: stats.waitingMedication, color: 'bg-pink-50 border-pink-200 text-pink-600' },
    { key: 'inMedication', label: 'Em Medicação', value: stats.inMedication, color: 'bg-rose-50 border-rose-200 text-rose-600' },
    { key: 'waitingHospitalization', label: 'Aguard. Internação', value: stats.waitingHospitalization, color: 'bg-red-50 border-red-200 text-red-600' },
    { key: 'inHospitalization', label: 'Internado', value: stats.inHospitalization, color: 'bg-amber-50 border-amber-200 text-amber-600' },
    { key: 'waitingInterConsultation', label: 'Aguard. Inter-consulta', value: stats.waitingInterConsultation, color: 'bg-lime-50 border-lime-200 text-lime-600' },
    { key: 'inInterConsultation', label: 'Inter-consulta', value: stats.inInterConsultation, color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  ];

  const outcomeStats = [
    { key: 'prescriptionIssued', label: 'Prescrições', value: stats.prescriptionIssued, color: 'bg-violet-50 border-violet-200 text-violet-600' },
    { key: 'discharged', label: 'Altas', value: stats.discharged, color: 'bg-green-50 border-green-200 text-green-600' },
    { key: 'transferred', label: 'Transferidos', value: stats.transferred, color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { key: 'deceased', label: 'Óbitos', value: stats.deceased, color: 'bg-gray-50 border-gray-200 text-gray-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Fluxo Principal */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🏥 Fluxo Principal</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {mainFlowStats.map((stat) => (
            <Card key={stat.key} className={stat.color}>
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs leading-tight">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Procedimentos Adicionais */}
      {extendedFlowStats.some(stat => stat.value > 0) && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">🔬 Procedimentos Adicionais</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {extendedFlowStats.filter(stat => stat.value > 0).map((stat) => (
              <Card key={stat.key} className={stat.color}>
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs leading-tight">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Desfechos */}
      {outcomeStats.some(stat => stat.value > 0) && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Desfechos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {outcomeStats.filter(stat => stat.value > 0).map((stat) => (
              <Card key={stat.key} className={stat.color}>
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs leading-tight">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsGrid;
