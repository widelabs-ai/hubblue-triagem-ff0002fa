
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Clock, TestTube, CheckCircle, AlertCircle, FileSearch } from 'lucide-react';

const ExamStatusScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processando':
        return 'bg-yellow-500';
      case 'parcial':
        return 'bg-orange-500';
      case 'pronto':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processando':
        return <AlertCircle className="h-5 w-5" />;
      case 'parcial':
        return <TestTube className="h-5 w-5" />;
      case 'pronto':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <FileSearch className="h-5 w-5" />;
    }
  };

  const mockExams = {
    processando: [
      { password: 'PR007', exam: 'Raio-X Tórax', estimatedTime: '15 min' },
      { password: 'NP024', exam: 'Hemograma Completo', estimatedTime: '30 min' },
      { password: 'PR006', exam: 'Tomografia Craniana', estimatedTime: '45 min' },
      { password: 'NP023', exam: 'Ultrassom Abdominal', estimatedTime: '20 min' },
    ],
    parcial: [
      { password: 'NP021', exam: 'Exames Laboratoriais', ready: ['Glicemia', 'Colesterol'], pending: ['Hemoglobina', 'Ureia'] },
      { password: 'PR004', exam: 'Ressonância Magnética', ready: ['Imagens'], pending: ['Laudo Médico'] },
      { password: 'NP020', exam: 'Eletrocardiograma', ready: ['ECG'], pending: ['Análise Cardiológica'] },
    ],
    prontos: [
      { password: 'NP019', exam: 'Raio-X Joelho', completedAt: '14:30' },
      { password: 'PR003', exam: 'Exames de Sangue', completedAt: '14:15' },
      { password: 'NP018', exam: 'Ultrassom Pélvico', completedAt: '14:00' },
      { password: 'NP017', exam: 'Mamografia', completedAt: '13:45' },
      { password: 'NP016', exam: 'Densitometria Óssea', completedAt: '13:30' },
    ]
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    data: any[],
    status: string,
    bgColor: string
  ) => {
    return (
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm h-full">
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg sm:text-xl lg:text-2xl text-center text-white flex items-center justify-center ${bgColor} p-3 lg:p-4 rounded-lg`}>
            <span className="hidden sm:inline">{icon}</span>
            <span className="ml-0 sm:ml-3 font-bold">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:px-6">
          <div className="text-center mb-4">
            <Badge className="bg-white/20 text-white text-sm sm:text-base lg:text-lg px-3 sm:px-4 py-1 sm:py-2 font-bold">
              {data.length} {data.length === 1 ? 'exame' : 'exames'}
            </Badge>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.length > 0 ? (
              data.map((item, index) => (
                <div
                  key={`${item.password}-${index}`}
                  className="bg-white/20 rounded-lg p-3 sm:p-4 border border-white/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white mr-3">
                        {item.password}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} flex-shrink-0`}></div>
                    </div>
                    {getStatusIcon(status)}
                  </div>
                  
                  <div className="text-white/90 text-sm sm:text-base mb-2">
                    <strong>{item.exam}</strong>
                  </div>
                  
                  {status === 'processando' && item.estimatedTime && (
                    <div className="text-white/70 text-xs sm:text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Tempo estimado: {item.estimatedTime}
                    </div>
                  )}
                  
                  {status === 'parcial' && (
                    <div className="text-xs sm:text-sm">
                      <div className="text-green-300 mb-1">
                        ✓ Prontos: {item.ready.join(', ')}
                      </div>
                      <div className="text-yellow-300">
                        ⏳ Pendentes: {item.pending.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {status === 'pronto' && item.completedAt && (
                    <div className="text-white/70 text-xs sm:text-sm flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Finalizado às {item.completedAt}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white/10 rounded-lg p-4 border border-white/20 text-center">
                <p className="text-white/60 text-sm">Nenhum exame nesta categoria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-blue-900 text-white pb-20">
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <TestTube className="h-6 w-6 sm:h-8 w-8 lg:h-10 w-10 mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold">STATUS DOS EXAMES</h1>
          </div>
          <div className="flex items-center justify-center text-sm sm:text-base lg:text-xl mb-4">
            <Clock className="h-4 w-4 sm:h-5 w-5 mr-2" />
            <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
          </div>
          <div className="text-sm sm:text-base lg:text-lg text-white/80">
            Acompanhe o andamento dos seus exames em tempo real
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
          {/* Exames Processando */}
          {renderSection(
            'EM PROCESSAMENTO',
            <AlertCircle className="h-5 w-5 sm:h-6 w-6" />,
            mockExams.processando,
            'processando',
            'bg-yellow-600'
          )}

          {/* Exames Parciais */}
          {renderSection(
            'PARCIALMENTE PRONTOS',
            <TestTube className="h-5 w-5 sm:h-6 w-6" />,
            mockExams.parcial,
            'parcial',
            'bg-orange-600'
          )}

          {/* Exames Prontos */}
          {renderSection(
            'EXAMES PRONTOS',
            <CheckCircle className="h-5 w-5 sm:h-6 w-6" />,
            mockExams.prontos,
            'pronto',
            'bg-green-600'
          )}
        </div>
      </div>

      {/* Rodapé com informações */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 sm:p-4">
        <div className="text-center text-white/80">
          <p className="text-xs sm:text-sm lg:text-lg font-medium">
            🏥 LIA - Sistema de Acompanhamento de Exames | Atualizado automaticamente a cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamStatusScreen;
