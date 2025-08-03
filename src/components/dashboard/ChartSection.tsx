
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useHospital } from '@/contexts/HospitalContext';

const ChartSection: React.FC = () => {
  const { patients, getPatientsByStatus } = useHospital();

  // Updated chart data based on system changes
  const flowData = [
    { stage: 'Triagem', waiting: getPatientsByStatus('waiting-triage').length, active: getPatientsByStatus('in-triage').length },
    { stage: 'Admin', waiting: getPatientsByStatus('waiting-admin').length, active: getPatientsByStatus('in-admin').length },
    { stage: 'Consulta', waiting: getPatientsByStatus('waiting-doctor').length, active: getPatientsByStatus('in-consultation').length },
    { stage: 'Exame', waiting: getPatientsByStatus('waiting-exam').length, active: getPatientsByStatus('in-exam').length },
    { stage: 'Medicação', waiting: getPatientsByStatus('waiting-medication').length, active: getPatientsByStatus('in-medication').length },
    { stage: 'Internação', waiting: getPatientsByStatus('waiting-hospitalization').length, active: getPatientsByStatus('in-hospitalization').length },
  ];

  const priorityData = [
    { name: 'Azul', value: patients.filter(p => p.triageData?.priority === 'azul').length, color: '#3B82F6' },
    { name: 'Verde', value: patients.filter(p => p.triageData?.priority === 'verde').length, color: '#10B981' },
    { name: 'Amarelo', value: patients.filter(p => p.triageData?.priority === 'amarelo').length, color: '#F59E0B' },
    { name: 'Laranja', value: patients.filter(p => p.triageData?.priority === 'laranja').length, color: '#F97316' },
    { name: 'Vermelho', value: patients.filter(p => p.triageData?.priority === 'vermelho').length, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // Outcome data (removed 'completed' as requested)
  const outcomeData = [
    { name: 'Alta', value: getPatientsByStatus('discharged').length, color: '#10B981' },
    { name: 'Transferido', value: getPatientsByStatus('transferred').length, color: '#3B82F6' },
    { name: 'Óbito', value: getPatientsByStatus('deceased').length, color: '#6B7280' },
    { name: 'Cancelado', value: getPatientsByStatus('cancelled').length, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // Mock hourly data for trend analysis
  const hourlyTrendData = [
    { hour: '08:00', admissions: 5, discharges: 2 },
    { hour: '10:00', admissions: 8, discharges: 4 },
    { hour: '12:00', admissions: 12, discharges: 6 },
    { hour: '14:00', admissions: 15, discharges: 8 },
    { hour: '16:00', admissions: 10, discharges: 12 },
    { hour: '18:00', admissions: 7, discharges: 15 },
    { hour: '20:00', admissions: 4, discharges: 10 },
    { hour: '22:00', admissions: 2, discharges: 5 },
  ];

  const chartConfig = {
    waiting: {
      label: "Aguardando",
      color: "#F59E0B",
    },
    active: {
      label: "Em Atendimento",
      color: "#10B981",
    },
    admissions: {
      label: "Admissões",
      color: "#3B82F6",
    },
    discharges: {
      label: "Altas",
      color: "#10B981",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Flow Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Status do Fluxo de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="waiting" stackId="a" fill="var(--color-waiting)" name="Aguardando" />
              <Bar dataKey="active" stackId="a" fill="var(--color-active)" name="Em Atendimento" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Distribuição por Prioridade (Manchester)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Hourly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Tendência por Horário</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={hourlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="admissions" stroke="var(--color-admissions)" strokeWidth={2} name="Admissões" />
              <Line type="monotone" dataKey="discharges" stroke="var(--color-discharges)" strokeWidth={2} name="Altas" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Outcomes Chart - Updated without 'completed' */}
      {outcomeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏁 Desfechos Finais</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChartSection;
