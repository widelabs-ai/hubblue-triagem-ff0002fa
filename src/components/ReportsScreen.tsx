
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHospital } from '@/contexts/HospitalContext';
import { ArrowLeft, Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportsScreen: React.FC = () => {
  const { patients, getTimeElapsed, isOverSLA } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const navigate = useNavigate();

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchTerm || 
      patient.password.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.personalData?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.personalData?.cpf || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesSpecialty = specialtyFilter === 'all' || patient.specialty === specialtyFilter;
    
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const getStatusLabel = (status: string) => {
    const labels = {
      'waiting-triage': 'Aguardando Triagem',
      'in-triage': 'Em Triagem',
      'waiting-admin': 'Aguardando Administrativo',
      'in-admin': 'Em Atendimento Administrativo',
      'waiting-doctor': 'Aguardando Médico',
      'in-consultation': 'Em Consulta',
      'completed': 'Concluído'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'waiting-triage': 'text-yellow-600 bg-yellow-100',
      'in-triage': 'text-orange-600 bg-orange-100',
      'waiting-admin': 'text-purple-600 bg-purple-100',
      'in-admin': 'text-indigo-600 bg-indigo-100',
      'waiting-doctor': 'text-green-600 bg-green-100',
      'in-consultation': 'text-teal-600 bg-teal-100',
      'completed': 'text-gray-600 bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'azul': return 'text-blue-600 bg-blue-100';
      case 'verde': return 'text-green-600 bg-green-100';
      case 'amarelo': return 'text-yellow-600 bg-yellow-100';
      case 'laranja': return 'text-orange-600 bg-orange-100';
      case 'vermelho': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const exportToCSV = () => {
    const headers = [
      'Senha',
      'Nome',
      'CPF',
      'Idade',
      'Especialidade',
      'Status',
      'Prioridade',
      'Tempo Total (min)',
      'Gerado em',
      'Triagem Iniciada',
      'Triagem Concluída',
      'Admin Iniciado',
      'Admin Concluído',
      'Consulta Iniciada',
      'Consulta Concluída'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredPatients.map(patient => {
        const totalTime = getTimeElapsed(patient, 'generated');
        return [
          patient.password,
          patient.personalData?.name || '',
          patient.personalData?.cpf || '',
          patient.personalData?.age || '',
          patient.specialty.replace('-', ' '),
          getStatusLabel(patient.status),
          patient.triageData?.priority || '',
          totalTime,
          formatTimestamp(patient.timestamps.generated),
          formatTimestamp(patient.timestamps.triageStarted),
          formatTimestamp(patient.timestamps.triageCompleted),
          formatTimestamp(patient.timestamps.adminStarted),
          formatTimestamp(patient.timestamps.adminCompleted),
          formatTimestamp(patient.timestamps.consultationStarted),
          formatTimestamp(patient.timestamps.consultationCompleted)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">📊 Relatório de Pacientes</CardTitle>
              <Button
                variant="ghost"
                onClick={exportToCSV}
                className="text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por senha, nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="waiting-triage">Aguardando Triagem</SelectItem>
                  <SelectItem value="in-triage">Em Triagem</SelectItem>
                  <SelectItem value="waiting-admin">Aguardando Administrativo</SelectItem>
                  <SelectItem value="in-admin">Em Atendimento Administrativo</SelectItem>
                  <SelectItem value="waiting-doctor">Aguardando Médico</SelectItem>
                  <SelectItem value="in-consultation">Em Consulta</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as especialidades</SelectItem>
                  <SelectItem value="ortopedia">Ortopedia</SelectItem>
                  <SelectItem value="cirurgia-geral">Cirurgia Geral</SelectItem>
                  <SelectItem value="clinica-medica">Clínica Médica</SelectItem>
                  <SelectItem value="pediatria">Pediatria</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center text-sm text-gray-600">
                Total: {filteredPatients.length} pacientes
              </div>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Senha</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Tempo Total</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Gerado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const totalTime = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <TableRow key={patient.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{patient.password}</TableCell>
                        <TableCell>{patient.personalData?.name || 'Não coletado'}</TableCell>
                        <TableCell className="capitalize">
                          {patient.specialty.replace('-', ' ')}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                            {getStatusLabel(patient.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {patient.triageData?.priority ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.triageData.priority)}`}>
                              {patient.triageData.priority.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            slaStatus.totalSLA ? 'text-red-600' : 
                            totalTime > 90 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {totalTime} min
                          </span>
                        </TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{formatTimestamp(patient.timestamps.generated)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum paciente encontrado com os filtros aplicados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsScreen;
