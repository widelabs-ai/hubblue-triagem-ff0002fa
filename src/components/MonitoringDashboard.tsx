
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';

const MonitoringDashboard: React.FC = () => {
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA } = useHospital();

  const stats = {
    total: patients.length,
    waitingTriage: getPatientsByStatus('waiting-triage').length,
    inTriage: getPatientsByStatus('in-triage').length,
    waitingAdmin: getPatientsByStatus('waiting-admin').length,
    inAdmin: getPatientsByStatus('in-admin').length,
    waitingDoctor: getPatientsByStatus('waiting-doctor').length,
    inConsultation: getPatientsByStatus('in-consultation').length,
    completed: getPatientsByStatus('completed').length,
  };

  const slaViolations = patients.filter(patient => {
    const sla = isOverSLA(patient);
    return sla.triageSLA || sla.totalSLA;
  });

  const avgTriageTime = patients
    .filter(p => p.timestamps.triageCompleted)
    .reduce((acc, p) => acc + getTimeElapsed(p, 'generated', 'triageCompleted'), 0) / 
    (patients.filter(p => p.timestamps.triageCompleted).length || 1);

  const avgTotalTime = patients
    .filter(p => p.timestamps.consultationCompleted)
    .reduce((acc, p) => acc + getTimeElapsed(p, 'generated', 'consultationCompleted'), 0) / 
    (patients.filter(p => p.timestamps.consultationCompleted).length || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-2xl">📊 Dashboard de Monitoramento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Stats Cards */}
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

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-red-600">🚨 Violações de SLA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{slaViolations.length}</div>
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

            {/* Detailed Patient List */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Pacientes Ativos</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {patients.filter(p => p.status !== 'completed').map((patient) => {
                  const totalTime = getTimeElapsed(patient, 'generated');
                  const sla = isOverSLA(patient);
                  
                  const statusColors = {
                    'waiting-triage': 'bg-yellow-100 border-yellow-300',
                    'in-triage': 'bg-orange-100 border-orange-300',
                    'waiting-admin': 'bg-purple-100 border-purple-300',
                    'in-admin': 'bg-indigo-100 border-indigo-300',
                    'waiting-doctor': 'bg-green-100 border-green-300',
                    'in-consultation': 'bg-teal-100 border-teal-300',
                    'completed': 'bg-gray-100 border-gray-300'
                  };

                  const statusLabels = {
                    'waiting-triage': 'Aguardando Triagem',
                    'in-triage': 'Em Triagem',
                    'waiting-admin': 'Aguardando Administrativo',
                    'in-admin': 'Em Atendimento Administrativo',
                    'waiting-doctor': 'Aguardando Médico',
                    'in-consultation': 'Em Consulta',
                    'completed': 'Concluído'
                  };

                  return (
                    <Card 
                      key={patient.id} 
                      className={`${statusColors[patient.status]} ${
                        (sla.triageSLA || sla.totalSLA) ? 'ring-2 ring-red-500' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-lg">{patient.password}</div>
                            <div className="text-sm text-gray-600">
                              {patient.personalData?.name || 'Nome não coletado'}
                            </div>
                            <div className="text-sm capitalize">
                              {patient.specialty.replace('-', ' ')} - {statusLabels[patient.status]}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              sla.totalSLA ? 'text-red-600' : 
                              totalTime > 90 ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              {totalTime} min
                            </div>
                            {patient.triageData && (
                              <div className={`text-sm ${
                                patient.triageData.priority === 'urgente' ? 'text-red-600' :
                                patient.triageData.priority === 'alta' ? 'text-orange-600' :
                                patient.triageData.priority === 'media' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {patient.triageData.priority}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {patients.filter(p => p.status !== 'completed').length === 0 && (
                  <p className="text-gray-500 text-center py-8">Nenhum paciente ativo no momento</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
