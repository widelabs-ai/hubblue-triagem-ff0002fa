
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';

const HospitalFlowIndicators: React.FC = () => {
  const { getPatientFlowStats } = useHospital();
  const flowStats = getPatientFlowStats();

  const indicators = [
    { key: 'waitingTriage', label: 'Aguard. Triagem', icon: '🏥', color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
    { key: 'inTriage', label: 'Em Triagem', icon: '🩺', color: 'bg-orange-50 border-orange-200 text-orange-600' },
    { key: 'waitingAdmin', label: 'Aguard. Admin', icon: '📋', color: 'bg-purple-50 border-purple-200 text-purple-600' },
    { key: 'inAdmin', label: 'Em Admin', icon: '📝', color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
    { key: 'waitingDoctor', label: 'Aguard. Médico', icon: '⏳', color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { key: 'inConsultation', label: 'Em Consulta', icon: '👨‍⚕️', color: 'bg-teal-50 border-teal-200 text-teal-600' },
    { key: 'waitingExam', label: 'Aguard. Exame', icon: '🔬', color: 'bg-cyan-50 border-cyan-200 text-cyan-600' },
    { key: 'inExam', label: 'Em Exame', icon: '🧪', color: 'bg-sky-50 border-sky-200 text-sky-600' },
    { key: 'waitingMedication', label: 'Aguard. Medicação', icon: '💊', color: 'bg-pink-50 border-pink-200 text-pink-600' },
    { key: 'inMedication', label: 'Em Medicação', icon: '💉', color: 'bg-rose-50 border-rose-200 text-rose-600' },
    { key: 'waitingHospitalization', label: 'Aguard. Internação', icon: '🏥', color: 'bg-red-50 border-red-200 text-red-600' },
    { key: 'inHospitalization', label: 'Em Internação', icon: '🛏️', color: 'bg-amber-50 border-amber-200 text-amber-600' },
    { key: 'waitingInterConsultation', label: 'Aguard. Inter-consulta', icon: '🔄', color: 'bg-lime-50 border-lime-200 text-lime-600' },
    { key: 'inInterConsultation', label: 'Em Inter-consulta', icon: '🤝', color: 'bg-green-50 border-green-200 text-green-600' },
    { key: 'waitingTransfer', label: 'Aguard. Transfer.', icon: '🚑', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
    { key: 'prescriptionIssued', label: 'Prescrição Emitida', icon: '📄', color: 'bg-violet-50 border-violet-200 text-violet-600' },
  ];

  const finalOutcomes = [
    { key: 'discharged', label: 'Alta', icon: '✅', color: 'bg-green-50 border-green-200 text-green-600' },
    { key: 'transferred', label: 'Transferido', icon: '↗️', color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { key: 'deceased', label: 'Óbito', icon: '💔', color: 'bg-gray-50 border-gray-200 text-gray-600' },
    { key: 'completed', label: 'Concluído', icon: '🏁', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          🏥 Fluxo de Pacientes - Indicadores em Tempo Real
        </h3>
        
        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{flowStats.totalActive}</div>
              <div className="text-sm text-blue-600">Pacientes Ativos</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{flowStats.totalProcessed}</div>
              <div className="text-sm text-green-600">Pacientes Processados</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{flowStats.totalActive + flowStats.totalProcessed}</div>
              <div className="text-sm text-purple-600">Total Geral</div>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores do Fluxo */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
          {indicators.map(indicator => (
            <Card key={indicator.key} className={indicator.color}>
              <CardContent className="p-3 text-center">
                <div className="text-lg mb-1">{indicator.icon}</div>
                <div className="text-2xl font-bold">{flowStats.byStatus[indicator.key as keyof typeof flowStats.byStatus]}</div>
                <div className="text-xs leading-tight">{indicator.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desfechos Finais */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-700">📊 Desfechos Finais</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {finalOutcomes.map(outcome => (
              <Card key={outcome.key} className={outcome.color}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{outcome.icon}</div>
                  <div className="text-3xl font-bold">{flowStats.byStatus[outcome.key as keyof typeof flowStats.byStatus]}</div>
                  <div className="text-sm">{outcome.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalFlowIndicators;
