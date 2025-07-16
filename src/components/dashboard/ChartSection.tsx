
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useHospital } from '@/contexts/HospitalContext';

const ChartSection: React.FC = () => {
  const { patients, getPatientsByStatus } = useHospital();

  // Dados para gráfico de barras - Status dos pacientes
  const statusData = [
    { name: 'Aguard. Triagem', value: getPatientsByStatus('waiting-triage').length, fill: '#EAB308' },
    { name: 'Em Triagem', value: getPatientsByStatus('in-triage').length, fill: '#F97316' },
    { name: 'Aguard. Admin', value: getPatientsByStatus('waiting-admin').length, fill: '#8B5CF6' },
    { name: 'Em Admin', value: getPatientsByStatus('in-admin').length, fill: '#6366F1' },
    { name: 'Aguard. Médico', value: getPatientsByStatus('waiting-doctor').length, fill: '#10B981' },
    { name: 'Em Consulta', value: getPatientsByStatus('in-consultation').length, fill: '#14B8A6' },
    { name: 'Concluídos', value: getPatientsByStatus('completed').length, fill: '#6B7280' },
  ];

  // Dados para gráfico de pizza - Especialidades
  const specialtyData = [
    { 
      name: 'Ortopedia', 
      value: patients.filter(p => p.specialty === 'ortopedia').length,
      fill: '#3B82F6'
    },
    { 
      name: 'Cirurgia Geral', 
      value: patients.filter(p => p.specialty === 'cirurgia-geral').length,
      fill: '#EF4444'
    },
    { 
      name: 'Clínica Médica', 
      value: patients.filter(p => p.specialty === 'clinica-medica').length,
      fill: '#10B981'
    },
    { 
      name: 'Pediatria', 
      value: patients.filter(p => p.specialty === 'pediatria').length,
      fill: '#F59E0B'
    },
  ];

  // Dados para gráfico de linha - Prioridades de triagem
  const priorityData = [
    { 
      name: 'Azul', 
      value: patients.filter(p => p.triageData?.priority === 'azul').length,
      fill: '#3B82F6'
    },
    { 
      name: 'Verde', 
      value: patients.filter(p => p.triageData?.priority === 'verde').length,
      fill: '#10B981'
    },
    { 
      name: 'Amarelo', 
      value: patients.filter(p => p.triageData?.priority === 'amarelo').length,
      fill: '#F59E0B'
    },
    { 
      name: 'Laranja', 
      value: patients.filter(p => p.triageData?.priority === 'laranja').length,
      fill: '#F97316'
    },
    { 
      name: 'Vermelho', 
      value: patients.filter(p => p.triageData?.priority === 'vermelho').length,
      fill: '#EF4444'
    },
  ].filter(item => item.value > 0);

  const chartConfig = {
    value: {
      label: "Pacientes",
    },
    waiting: {
      label: "Aguardando",
      color: "#F59E0B",
    },
    inProgress: {
      label: "Em Atendimento", 
      color: "#3B82F6",
    },
    completed: {
      label: "Concluído",
      color: "#10B981",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Gráfico de Status dos Pacientes */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">📊 Status dos Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Especialidades */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏥 Por Especialidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Prioridades */}
      {priorityData.length > 0 && (
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">🚨 Prioridades de Triagem (Manchester)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priorityData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Tempo Médio por Fase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⏱️ Tempo Médio por Fase</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Triagem', value: 8, fill: '#F59E0B' },
                  { name: 'Admin', value: 15, fill: '#8B5CF6' },
                  { name: 'Consulta', value: 25, fill: '#10B981' },
                ]}
                layout="horizontal"
              >
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value} min`, 'Tempo Médio']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartSection;
