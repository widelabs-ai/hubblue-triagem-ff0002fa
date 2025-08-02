import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHospital } from '@/contexts/HospitalContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TriageForm from './TriageForm';
import CancellationModal from './CancellationModal';

const TriageScreen: React.FC = () => {
  const { getPatientsByStatus, updatePatientStatus, getTimeElapsed, cancelPatient } = useHospital();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const navigate = useNavigate();

  const waitingPatients = getPatientsByStatus('waiting-triage').sort((a, b) => {
    const timeA = getTimeElapsed(a, 'generated');
    const timeB = getTimeElapsed(b, 'generated');
    return timeB - timeA;
  });
  const currentPatient = getPatientsByStatus('in-triage')[0];

  const handleCallPatient = (patientId: string) => {
    updatePatientStatus(patientId, 'in-triage');
    setSelectedPatientId(patientId);
    setIsDialogOpen(true);
    toast({
      title: "Paciente chamado",
      description: "O formulário de triagem está pronto para ser preenchido.",
    });
  };

  const handleCompleteTriage = (patientId: string, triageData: any) => {
    updatePatientStatus(patientId, 'waiting-admin', { triageData });
    setIsDialogOpen(false);
    setSelectedPatientId(null);
    toast({
      title: "Triagem Concluída",
      description: "Os dados da triagem foram salvos com sucesso.",
    });
  };

  const handleCancelTriage = (reason: string) => {
    if (currentPatient) {
      cancelPatient(currentPatient.id, reason);
      setIsDialogOpen(false);
      setIsCancellationModalOpen(false);
      toast({
        title: "Triagem Cancelada",
        description: "A triagem foi cancelada com sucesso.",
      });
    }
  };

  const handleCloseDialog = () => {
    if (currentPatient) {
      updatePatientStatus(currentPatient.id, 'waiting-triage');
    }
    setIsDialogOpen(false);
    setSelectedPatientId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">🏥 Triagem Médica</CardTitle>
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
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-32">Tempo Aguardando</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPatients.map((patient) => {
                    const timeWaiting = getTimeElapsed(patient, 'generated');
                    
                    return (
                      <TableRow 
                        key={patient.id}
                        className={timeWaiting > 10 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}
                      >
                        <TableCell className="font-bold">{patient.password}</TableCell>
                        <TableCell className="capitalize">
                          {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não prioritário'}
                        </TableCell>
                        <TableCell className={`font-medium ${timeWaiting > 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {timeWaiting} min
                        </TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => handleCallPatient(patient.id)}
                            disabled={!!currentPatient}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Chamar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {waitingPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
              <DialogTitle className="text-xl">Formulário de Triagem</DialogTitle>
              <Button variant="ghost" onClick={handleCloseDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedPatientId && (
            <TriageForm 
              patientId={selectedPatientId}
              onComplete={handleCompleteTriage}
              onCancel={() => setIsCancellationModalOpen(true)}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <CancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        onConfirm={handleCancelTriage}
        patientPassword={currentPatient?.password || ''}
      />
    </div>
  );
};

export default TriageScreen;
