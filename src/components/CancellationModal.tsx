
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, cancelledBy: string) => void;
  patientPassword: string;
}

const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientPassword
}) => {
  const [reason, setReason] = useState('');
  const [cancelledBy, setCancelledBy] = useState('');

  const handleConfirm = () => {
    if (!reason.trim() || !cancelledBy) {
      return;
    }
    onConfirm(reason, cancelledBy);
    setReason('');
    setCancelledBy('');
  };

  const handleClose = () => {
    setReason('');
    setCancelledBy('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl text-red-600">⚠️ Cancelar Atendimento</DialogTitle>
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Paciente:</strong> {patientPassword}
            </p>
            <p className="text-sm text-red-600 mt-1">
              Esta ação cancelará permanentemente o atendimento do paciente.
            </p>
          </div>

          <div>
            <Label>Responsável pelo Cancelamento *</Label>
            <Select value={cancelledBy} onValueChange={setCancelledBy}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione quem está cancelando" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="triagem">Equipe de Triagem</SelectItem>
                <SelectItem value="administrativo">Equipe Administrativa</SelectItem>
                <SelectItem value="medico">Equipe Médica</SelectItem>
                <SelectItem value="paciente">Paciente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Justificativa do Cancelamento *</Label>
            <Textarea
              placeholder="Descreva o motivo do cancelamento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!reason.trim() || !cancelledBy}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationModal;
