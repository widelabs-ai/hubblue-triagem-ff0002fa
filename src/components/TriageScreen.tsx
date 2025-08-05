
import React, { useState } from 'react';
import { useHospital } from '../contexts/HospitalContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Clock, Phone, User, AlertCircle } from 'lucide-react';
import { CancellationModal } from './CancellationModal';

const TriageScreen = () => {
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA, callPatient } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingPatient, setCancellingPatient] = useState<string | null>(null);

  const waitingPatients = getPatientsByStatus('waiting-triage');
  
  const filteredPatients = waitingPatients.filter(patient =>
    patient.password.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.personalData?.name && patient.personalData.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPriorityColor = (specialty: string) => {
    return specialty === 'prioritario' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (specialty: string) => {
    return specialty === 'prioritario' ? 'Prioritário' : 'Não Prioritário';
  };

  const handleCallPatient = (patientId: string) => {
    callPatient(patientId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fila de Triagem</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {filteredPatients.length} pacientes aguardando
          </Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar por senha, telefone ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">Nenhum paciente aguardando triagem</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => {
            const timeWaiting = getTimeElapsed(patient, 'generated');
            const slaStatus = isOverSLA(patient);
            
            return (
              <Card key={patient.id} className={`${slaStatus.triageSLA ? 'border-red-300 bg-red-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {patient.password}
                      </div>
                      <Badge className={getPriorityColor(patient.specialty)}>
                        {getStatusText(patient.specialty)}
                      </Badge>
                      {slaStatus.triageSLA && (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>SLA Excedido</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleCallPatient(patient.id)}
                        className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                      >
                        <span>Chamar no painel</span>
                        {patient.callCount > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {patient.callCount}
                          </Badge>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCancellingPatient(patient.id)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-medium">{patient.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Tempo de espera:</span>
                      <span className={`font-medium ${timeWaiting > 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {timeWaiting} min
                      </span>
                    </div>

                    {patient.personalData?.name && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Nome:</span>
                        <span className="font-medium">{patient.personalData.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Gerado em: {new Date(patient.timestamps.generated).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {cancellingPatient && (
        <CancellationModal
          patientId={cancellingPatient}
          onClose={() => setCancellingPatient(null)}
        />
      )}
    </div>
  );
};

export default TriageScreen;
