
import React, { useState } from 'react';
import { useHospital } from '@/contexts/HospitalContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useNavigate } from 'react-router-dom';

const TriageScreen = () => {
  const { patients, getPatientsByStatus, updatePatientStatus, callPatient } = useHospital();
  const waitingTriage = getPatientsByStatus('waiting-triage');
  const { toast } = useToast()
  const navigate = useNavigate();

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: ptBR });
  };

  const handleStartTriage = (patient: any) => {
    navigate(`/triage-form/${patient.id}`);
  };

  const handleCallPatient = (patientId: string) => {
    callPatient(patientId);
    toast({
      title: "Paciente chamado",
      description: "O paciente foi chamado no painel.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Pacientes Aguardando Triagem</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Senha</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waitingTriage.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.password}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>
                  <Badge variant={patient.specialty === 'prioritario' ? 'destructive' : 'secondary'}>
                    {patient.specialty === 'prioritario' ? 'Prioritário' : 'Não Prioritário'}
                  </Badge>
                </TableCell>
                <TableCell>{formatTime(patient.timestamps.generated)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleCallPatient(patient.id)}
                      size="sm"
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                      Chamar no Painel
                      {patient.callCount > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                          {patient.callCount}x
                        </Badge>
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleStartTriage(patient)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Iniciar Triagem
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TriageScreen;
