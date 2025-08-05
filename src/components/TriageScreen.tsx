
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X, Speaker, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TriageChat from './TriageChat';
import CancellationModal from './CancellationModal';
import { getPatientName, getPatientAge, getPatientGender } from '@/utils/patientUtils';

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, cancelPatient, getTimeElapsed, isOverSLA } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const waitingPatients = getPatientsByStatus('waiting-triage').sort((a, b) => {
    const timeA = getTimeElapsed(a, 'generated');
    const timeB = getTimeElapsed(b, 'generated');
    return timeB - timeA;
  });
  const currentPatient = getPatientsByStatus('in-triage')[0];

  const handleCallPanel = (patientPassword: string) => {
    toast({
      title: "Chamando no painel",
      description: `Paciente ${patientPassword} foi chamado no painel de espera.`,
    });
  };

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-triage');
    setIsDialogOpen(true);
    toast({
      title: "Paciente chamado",
      description: "Paciente está sendo atendido na triagem.",
    });
  };

  const handleReturnToQueue = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-triage');
      setIsDialogOpen(false);
      toast({
        title: "Paciente retornado",
        description: "Paciente foi retornado para a fila de espera.",
      });
    }
  };

  const handleCancelPatient = (reason: string) => {
    if (currentPatient) {
      cancelPatient(currentPatient.id, reason);
      setIsDialogOpen(false);
      setIsCancellationModalOpen(false);
      toast({
        title: "Paciente cancelado",
        description: "Atendimento foi cancelado com sucesso.",
      });
    }
  };

  const handleCompleteChat = (triageData: any) => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-admin', { triageData });
      setIsDialogOpen(false);
      toast({
        title: "Triagem concluída",
        description: "Paciente encaminhado para o administrativo.",
      });
    }
  };

  const handleCloseDialog = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-triage');
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">🏥 Triagem - Classificação de Risco</CardTitle>
              <div className="w-10"></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Pacientes Aguardando Triagem</h3>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Senha</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-16">Idade</TableHead>
                    <TableHead className="w-16">Gênero</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-32">Tempo Aguardando</TableHead>
                    <TableHead className="w-32">Status SLA</TableHead>
                    <TableHead className="w-48">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'generated');
                    const slaStatus = isOverSLA(patient);
                    
                    return (
                      <TableRow 
                        key={patient.id}
                        className={`${
                          slaStatus.totalSLA ? 'bg-red-50 border-red-200' : 
                          timeWaiting > 80 ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <TableCell className="font-bold">{patient.password}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {getPatientName(patient)}
                        </TableCell>
                        <TableCell>
                          {getPatientAge(patient)}
                        </TableCell>
                        <TableCell>
                          {getPatientGender(patient)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                        </TableCell>
                        <TableCell className={`font-medium ${
                          slaStatus.totalSLA ? 'text-red-600' : 
                          timeWaiting > 80 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {timeWaiting} min
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            slaStatus.totalSLA ? 'bg-red-100 text-red-800' : 
                            timeWaiting > 80 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {slaStatus.totalSLA ? 'Atrasado' : timeWaiting > 80 ? 'Atenção' : 'No prazo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCallPanel(patient.password)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Speaker className="h-3 w-3 mr-1" />
                              Chamar no painel
                            </Button>
                            <Button 
                              onClick={() => handleCallPatient(patient.id)}
                              disabled={!!currentPatient}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Iniciar triagem
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Nenhum paciente aguardando triagem
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Triagem */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Triagem - Classificação de Risco</DialogTitle>
              <Button variant="ghost" onClick={handleCloseDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {currentPatient && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-bold text-xl">{currentPatient.password}</div>
                <div className="text-gray-600 capitalize">
                  {currentPatient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                </div>
                <div className="text-sm">
                  Tempo na triagem: {getTimeElapsed(currentPatient, 'triageStarted')} min
                </div>
              </div>

              <TriageChat 
                onComplete={handleCompleteChat}
                onCancel={() => setIsCancellationModalOpen(true)}
                onReturnToQueue={handleReturnToQueue}
                patient={currentPatient}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <CancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        onConfirm={handleCancelPatient}
        patientPassword={currentPatient?.password || ''}
      />
    </div>
  );
};

export default TriageScreen;
