
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';

const HospitalFlowIndicators: React.FC = () => {
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA } = useHospital();

  // Função para calcular estatísticas de um grupo de status
  const calculateGroupStats = (statuses: string[]) => {
    const groupPatients = statuses.flatMap(status => getPatientsByStatus(status as any));
    const total = groupPatients.length;
    
    if (total === 0) return { total: 0, inSLA: 0, outSLA: 0, avgTime: 0 };

    let outSLA = 0;
    let totalTime = 0;

    groupPatients.forEach(patient => {
      const sla = isOverSLA(patient);
      if (sla.triageSLA || sla.totalSLA) {
        outSLA++;
      }
      totalTime += getTimeElapsed(patient, 'generated');
    });

    return {
      total,
      inSLA: total - outSLA,
      outSLA,
      avgTime: Math.round(totalTime / total)
    };
  };

  // Definir os grupos
  const groups = [
    {
      title: "Aguardando Classificação de Risco (Triagem)",
      icon: "🏥",
      color: "bg-blue-100 border-blue-200",
      statuses: ['waiting-triage', 'in-triage'],
      items: [
        { status: 'waiting-triage', label: 'Aguardando Triagem', icon: '🏥' },
        { status: 'in-triage', label: 'Em Triagem', icon: '🩺' }
      ]
    },
    {
      title: "Aguardando Abertura do Atendimento (Administrativo)",
      icon: "📋",
      color: "bg-purple-100 border-purple-200",
      statuses: ['waiting-admin', 'in-admin'],
      items: [
        { status: 'waiting-admin', label: 'Aguard. Recepção', icon: '📋' },
        { status: 'in-admin', label: 'Atend. Recepção', icon: '📝' }
      ]
    },
    {
      title: "Aguardando Consultório Médico",
      icon: "👨‍⚕️",
      color: "bg-green-100 border-green-200",
      statuses: ['waiting-doctor', 'in-consultation'],
      items: [
        { status: 'waiting-doctor', label: 'Aguardando Médico', icon: '⏳' },
        { status: 'in-consultation', label: 'Em Atendimento', icon: '👨‍⚕️' }
      ]
    },
    {
      title: "Outros",
      icon: "🔄",
      color: "bg-gray-100 border-gray-200",
      statuses: ['waiting-exam', 'in-exam', 'waiting-medication', 'in-medication', 'waiting-hospitalization', 'in-hospitalization', 'waiting-transfer'],
      items: [
        { status: 'waiting-exam', label: 'Aguardando Exame', icon: '🔬' },
        { status: 'in-exam', label: 'Em Exame', icon: '🧪' },
        { status: 'waiting-medication', label: 'Aguardando Medicação', icon: '💊' },
        { status: 'in-medication', label: 'Em Medicação', icon: '💉' },
        { status: 'waiting-hospitalization', label: 'Aguard. Repouso no Leito', icon: '🛏️' },
        { status: 'in-hospitalization', label: 'Internado', icon: '🛏️' },
        { status: 'waiting-transfer', label: 'Aguardando Transferência', icon: '🚑' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">🌊 Fluxo de Pacientes - Indicadores em Tempo Real</h3>
      
      {groups.map((group, index) => {
        const groupStats = calculateGroupStats(group.statuses);
        
        return (
          <Card key={index} className={`${group.color} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{group.icon}</span>
                  <span className="text-lg">{group.title}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Tempo médio: {groupStats.avgTime} min
                </div>
              </CardTitle>
              {groupStats.total > 0 && (
                <div className="text-sm font-medium text-gray-700">
                  Total: {groupStats.total} pacientes - 
                  <span className="text-green-600 ml-1">{groupStats.inSLA} dentro do SLA</span> | 
                  <span className="text-red-600 ml-1">{groupStats.outSLA} fora do SLA</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((item) => {
                  const count = getPatientsByStatus(item.status as any).length;
                  const itemPatients = getPatientsByStatus(item.status as any);
                  
                  let itemInSLA = 0;
                  let itemOutSLA = 0;
                  let itemAvgTime = 0;
                  
                  if (count > 0) {
                    let totalTime = 0;
                    itemPatients.forEach(patient => {
                      const sla = isOverSLA(patient);
                      if (sla.triageSLA || sla.totalSLA) {
                        itemOutSLA++;
                      } else {
                        itemInSLA++;
                      }
                      totalTime += getTimeElapsed(patient, 'generated');
                    });
                    itemAvgTime = Math.round(totalTime / count);
                  }
                  
                  return (
                    <div key={item.status} className="bg-white/50 rounded-lg p-3 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <span className="text-xl font-bold">{count}</span>
                      </div>
                      {count > 0 && (
                        <div className="text-xs text-gray-600">
                          <div>Tempo médio: {itemAvgTime} min</div>
                          <div className="mt-1">
                            <span className="text-green-600">{itemInSLA} dentro</span> | 
                            <span className="text-red-600 ml-1">{itemOutSLA} fora</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HospitalFlowIndicators;
