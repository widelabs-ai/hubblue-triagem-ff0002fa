
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';
import StatsGrid from './dashboard/StatsGrid';
import KPICards from './dashboard/KPICards';
import PatientList from './dashboard/PatientList';
import ChartSection from './dashboard/ChartSection';

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
            <StatsGrid stats={stats} />
            <KPICards 
              slaViolations={slaViolations.length}
              avgTriageTime={avgTriageTime}
              avgTotalTime={avgTotalTime}
            />
            
            {/* Nova seção de gráficos */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Análises Visuais</h3>
              <ChartSection />
            </div>
            
            <PatientList 
              patients={patients}
              getTimeElapsed={getTimeElapsed}
              isOverSLA={isOverSLA}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
