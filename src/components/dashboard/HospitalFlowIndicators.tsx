
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface PatientModalData {
  title: string;
  status: string;
  patients: any[];
}

const HospitalFlowIndicators: React.FC = () => {
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA } = useHospital();
  const [selectedPatientGroup, setSelectedPatientGroup] = useState<PatientModalData | null>(null);

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

  const handleIndicatorClick = (status: string, label: string) => {
    const statusPatients = getPatientsByStatus(status as any);
    setSelectedPatientGroup({
      title: label,
      status,
      patients: statusPatients
    });
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
    <>
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">🌊 Fluxo de Pacientes - Indicadores em Tempo Real</h3>
        
        {groups.map((group, index) => {
          const groupStats = calculateGroupStats(group.statuses);
          const hasAlert = groupStats.outSLA > 0;
          
          return (
            <Card key={index} className={`${group.color} border-2 ${hasAlert ? 'ring-2 ring-red-500 border-red-300 animate-pulse' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{group.icon}</span>
                    <span className="text-lg">{group.title}</span>
                    {hasAlert && <span className="text-xl animate-pulse">🚨</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    Tempo médio: {groupStats.avgTime} min
                  </div>
                </CardTitle>
                {groupStats.total > 0 && (
                  <div className="text-sm font-medium text-gray-700">
                    Total: {groupStats.total} pacientes - 
                    <span className="text-green-600 ml-1">{groupStats.inSLA} dentro</span> | 
                    <span className="text-red-600 ml-1">{groupStats.outSLA} fora</span>
                  </div>
                )}
                {hasAlert && (
                  <Alert className="bg-red-50 border-red-200 mt-2 animate-pulse">
                    <AlertDescription className="text-red-700 text-sm">
                      ⚠️ Atenção: {groupStats.outSLA} paciente{groupStats.outSLA > 1 ? 's' : ''} fora do prazo estabelecido
                    </AlertDescription>
                  </Alert>
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

                    const itemHasAlert = itemOutSLA > 0;
                    
                    return (
                      <div 
                        key={item.status} 
                        className={`bg-white/50 rounded-lg p-3 border cursor-pointer hover:bg-white/80 transition-colors ${itemHasAlert ? 'border-red-300 bg-red-50/50 animate-pulse' : ''}`}
                        onClick={() => handleIndicatorClick(item.status, item.label)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium text-sm">{item.label}</span>
                            {itemHasAlert && <span className="text-sm animate-pulse">🚨</span>}
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

      {/* Modal para exibir pacientes */}
      <Dialog open={!!selectedPatientGroup} onOpenChange={() => setSelectedPatientGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>📋</span>
              {selectedPatientGroup?.title}
              <Badge variant="secondary">{selectedPatientGroup?.patients.length} pacientes</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedPatientGroup?.patients.map((patient) => {
              const sla = isOverSLA(patient);
              const timeElapsed = getTimeElapsed(patient, 'generated');
              const isOvertime = sla.triageSLA || sla.totalSLA;
              
              return (
                <div 
                  key={patient.id} 
                  className={`p-4 rounded-lg border ${isOvertime ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={patient.specialty === 'prioritario' ? 'destructive' : 'secondary'}>
                        {patient.password}
                      </Badge>
                      <span className="font-medium">
                        {patient.personalData?.fullName || patient.personalData?.name || 'Nome não informado'}
                      </span>
                      {isOvertime && <span className="text-red-500 animate-pulse">🚨</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                      {timeElapsed} min
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div>Telefone: {patient.phone}</div>
                    <div>Especialidade: {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não Prioritário'}</div>
                    {patient.triageData?.priority && (
                      <div>Classificação: 
                        <Badge 
                          variant="outline" 
                          className={`ml-1 ${
                            patient.triageData.priority === 'vermelho' ? 'bg-red-100 text-red-800' :
                            patient.triageData.priority === 'laranja' ? 'bg-orange-100 text-orange-800' :
                            patient.triageData.priority === 'amarelo' ? 'bg-yellow-100 text-yellow-800' :
                            patient.triageData.priority === 'verde' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {patient.triageData.priority.charAt(0).toUpperCase() + patient.triageData.priority.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {isOvertime && (
                    <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                      ⚠️ Paciente fora do prazo estabelecido
                    </div>
                  )}
                </div>
              );
            })}
            
            {selectedPatientGroup?.patients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📋</span>
                Nenhum paciente nesta situação no momento
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HospitalFlowIndicators;
