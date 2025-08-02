
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHospital } from '@/contexts/HospitalContext';
import StatsGrid from './dashboard/StatsGrid';
import KPICards from './dashboard/KPICards';
import PatientList from './dashboard/PatientList';
import ChartSection from './dashboard/ChartSection';
import HospitalFlowIndicators from './dashboard/HospitalFlowIndicators';
import PatientFlowVisualization from './dashboard/PatientFlowVisualization';

const MonitoringDashboard: React.FC = () => {
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA, getPatientFlowStats } = useHospital();

  const flowStats = getPatientFlowStats();
  
  const stats = {
    total: patients.length,
    waitingTriage: getPatientsByStatus('waiting-triage').length,
    inTriage: getPatientsByStatus('in-triage').length,
    waitingAdmin: getPatientsByStatus('waiting-admin').length,
    inAdmin: getPatientsByStatus('in-admin').length,
    waitingDoctor: getPatientsByStatus('waiting-doctor').length,
    inConsultation: getPatientsByStatus('in-consultation').length,
    waitingExam: getPatientsByStatus('waiting-exam').length,
    inExam: getPatientsByStatus('in-exam').length,
    waitingMedication: getPatientsByStatus('waiting-medication').length,
    inMedication: getPatientsByStatus('in-medication').length,
    waitingHospitalization: getPatientsByStatus('waiting-hospitalization').length,
    inHospitalization: getPatientsByStatus('in-hospitalization').length,
    waitingInterConsultation: getPatientsByStatus('waiting-inter-consultation').length,
    inInterConsultation: getPatientsByStatus('in-inter-consultation').length,
    waitingTransfer: getPatientsByStatus('waiting-transfer').length,
    prescriptionIssued: getPatientsByStatus('prescription-issued').length,
    discharged: getPatientsByStatus('discharged').length,
    deceased: getPatientsByStatus('deceased').length,
    transferred: getPatientsByStatus('transferred').length,
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
    .filter(p => p.timestamps.discharged)
    .reduce((acc, p) => acc + getTimeElapsed(p, 'generated', 'discharged'), 0) / 
    (patients.filter(p => p.timestamps.discharged).length || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-2xl">🏥 Dashboard de Monitoramento Hospitalar Completo</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Indicadores do Fluxo Completo */}
            <HospitalFlowIndicators />
            
            {/* Visualização do Fluxo */}
            <PatientFlowVisualization />
            
            {/* Grid de Estatísticas Detalhadas */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Estatísticas Detalhadas</h3>
              <StatsGrid stats={stats} />
            </div>
            
            {/* KPIs Principais */}
            <KPICards 
              slaViolations={slaViolations.length}
              avgTriageTime={avgTriageTime}
              avgTotalTime={avgTotalTime}
            />
            
            {/* Seção de Gráficos */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Análises Visuais</h3>
              <ChartSection />
            </div>
            
            {/* Lista de Pacientes */}
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
