
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';
import { AlertTriangle, TrendingUp, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const InsightsSection: React.FC = () => {
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA } = useHospital();

  // Calculate insights based on current data
  const generateInsights = () => {
    const activePatients = patients.filter(p => !['completed', 'cancelled', 'discharged', 'deceased', 'transferred'].includes(p.status));
    const waitingTriage = getPatientsByStatus('waiting-triage');
    const inConsultation = getPatientsByStatus('in-consultation');
    const slaViolations = patients.filter(patient => {
      const sla = isOverSLA(patient);
      return sla.triageSLA || sla.totalSLA;
    });

    const avgWaitTime = activePatients.length > 0 
      ? activePatients.reduce((acc, p) => acc + getTimeElapsed(p, 'generated'), 0) / activePatients.length
      : 0;

    const priorityDistribution = patients.reduce((acc, p) => {
      if (p.triageData?.priority) {
        acc[p.triageData.priority] = (acc[p.triageData.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      activePatients: activePatients.length,
      waitingTriage: waitingTriage.length,
      inConsultation: inConsultation.length,
      slaViolations: slaViolations.length,
      avgWaitTime: Math.round(avgWaitTime),
      priorityDistribution,
      totalProcessed: patients.filter(p => ['discharged', 'transferred'].includes(p.status)).length
    };
  };

  const insights = generateInsights();

  const getInsightCards = () => {
    const cards = [];

    // Flow Efficiency Insight
    if (insights.activePatients > 0) {
      const efficiency = insights.inConsultation / insights.activePatients * 100;
      cards.push({
        title: "Eficiência do Fluxo",
        value: `${Math.round(efficiency)}%`,
        description: `${insights.inConsultation} de ${insights.activePatients} pacientes ativos estão em atendimento`,
        icon: TrendingUp,
        color: efficiency > 60 ? "text-green-600" : efficiency > 30 ? "text-yellow-600" : "text-red-600",
        bgColor: efficiency > 60 ? "bg-green-50" : efficiency > 30 ? "bg-yellow-50" : "bg-red-50"
      });
    }

    // SLA Performance
    const slaPerformance = insights.activePatients > 0 
      ? ((insights.activePatients - insights.slaViolations) / insights.activePatients * 100)
      : 100;
    cards.push({
      title: "Performance SLA",
      value: `${Math.round(slaPerformance)}%`,
      description: `${insights.slaViolations} violações de SLA detectadas`,
      icon: slaPerformance > 80 ? CheckCircle : AlertTriangle,
      color: slaPerformance > 80 ? "text-green-600" : slaPerformance > 60 ? "text-yellow-600" : "text-red-600",
      bgColor: slaPerformance > 80 ? "bg-green-50" : slaPerformance > 60 ? "bg-yellow-50" : "bg-red-50"
    });

    // Wait Time Analysis
    cards.push({
      title: "Tempo Médio de Espera",
      value: `${insights.avgWaitTime} min`,
      description: insights.avgWaitTime > 60 ? "Acima do tempo ideal" : "Dentro do esperado",
      icon: Clock,
      color: insights.avgWaitTime > 60 ? "text-red-600" : insights.avgWaitTime > 30 ? "text-yellow-600" : "text-green-600",
      bgColor: insights.avgWaitTime > 60 ? "bg-red-50" : insights.avgWaitTime > 30 ? "bg-yellow-50" : "bg-green-50"
    });

    // Triage Bottleneck
    if (insights.waitingTriage > 3) {
      cards.push({
        title: "Gargalo na Triagem",
        value: `${insights.waitingTriage}`,
        description: "Muitos pacientes aguardando triagem",
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50"
      });
    }

    return cards;
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (insights.slaViolations > 0) {
      recommendations.push({
        type: "critical",
        title: "Violações de SLA Detectadas",
        description: `${insights.slaViolations} pacientes estão com tempo acima do SLA. Priorize o atendimento desses casos.`,
        action: "Revisar fila de prioridades"
      });
    }

    if (insights.waitingTriage > 3) {
      recommendations.push({
        type: "warning",
        title: "Gargalo na Triagem",
        description: `${insights.waitingTriage} pacientes aguardando triagem. Considere adicionar mais profissionais na triagem.`,
        action: "Reforçar equipe de triagem"
      });
    }

    if (insights.avgWaitTime > 60) {
      recommendations.push({
        type: "warning",
        title: "Tempo de Espera Elevado",
        description: `Tempo médio de espera de ${insights.avgWaitTime} minutos está acima do ideal.`,
        action: "Otimizar fluxo de atendimento"
      });
    }

    if (insights.priorityDistribution.vermelho > 0) {
      recommendations.push({
        type: "info",
        title: "Pacientes Críticos",
        description: `${insights.priorityDistribution.vermelho || 0} pacientes classificados como prioridade vermelha no sistema.`,
        action: "Monitorar ativamente"
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        title: "Fluxo Operando Normalmente",
        description: "Todos os indicadores estão dentro dos parâmetros esperados.",
        action: "Manter monitoramento"
      });
    }

    return recommendations;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          🧠 Insights Inteligentes
        </h3>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {getInsightCards().map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className={`${card.bgColor} border-l-4 ${card.color.replace('text-', 'border-l-')}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                    </div>
                    <IconComponent className={`h-8 w-8 ${card.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recomendações da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecommendations().map((rec, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'critical' ? 'bg-red-50 border-l-red-500' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-l-yellow-500' :
                    rec.type === 'success' ? 'bg-green-50 border-l-green-500' :
                    'bg-blue-50 border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        rec.type === 'critical' ? 'text-red-800' :
                        rec.type === 'warning' ? 'text-yellow-800' :
                        rec.type === 'success' ? 'text-green-800' :
                        'text-blue-800'
                      }`}>
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-2 ${
                        rec.type === 'critical' ? 'bg-red-100 text-red-800' :
                        rec.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        rec.type === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        💡 {rec.action}
                      </div>
                    </div>
                    {rec.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />}
                    {rec.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />}
                    {rec.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        {Object.keys(insights.priorityDistribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(insights.priorityDistribution).map(([priority, count]) => (
                  <div key={priority} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      priority === 'vermelho' ? 'bg-red-500' :
                      priority === 'laranja' ? 'bg-orange-500' :
                      priority === 'amarelo' ? 'bg-yellow-500' :
                      priority === 'verde' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}>
                      {count}
                    </div>
                    <p className="text-xs text-gray-600 mt-2 uppercase font-medium">{priority}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InsightsSection;
