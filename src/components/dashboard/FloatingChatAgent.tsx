import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Lightbulb, Minus, Maximize2 } from 'lucide-react';
import { useHospital } from '@/contexts/HospitalContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const FloatingChatAgent: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { patients, getPatientsByStatus, getTimeElapsed, isOverSLA } = useHospital();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem inicial com exemplo
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        text: "Olá! Sou seu assistente de análise de dados hospitalares. Posso ajudar você a entender os indicadores e estatísticas do hospital. Faça perguntas sobre fluxo de pacientes, tempos de espera, eficiência, ou qualquer outro dado relevante.",
        sender: 'agent',
        timestamp: new Date()
      },
      {
        id: '2',
        text: "Qual é o melhor horário para os pacientes virem ao hospital?",
        sender: 'user',
        timestamp: new Date(Date.now() + 1000)
      },
      {
        id: '3',
        text: "Baseado nos dados históricos, o melhor horário para atendimento é entre **08:00 e 10:00** pela manhã, quando:\n\n• Menor tempo de espera (média de 15-20 min)\n• Equipe médica está mais disponível\n• Menos pacientes aguardando triagem\n• Taxa de satisfação 23% maior\n\n**Horários a evitar:**\n• 14:00-16:00 (pico de atendimentos)\n• Após 18:00 (equipe reduzida)\n\nEssa análise considera o fluxo atual de pacientes e a capacidade operacional do hospital.",
        sender: 'agent',
        timestamp: new Date(Date.now() + 3000)
      }
    ];
    
    setMessages(initialMessages);
  }, []);

  const analyzeQuestion = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    const totalPatients = patients.length;
    const activePatientsArray = patients.filter(p => !['discharged', 'deceased', 'transferred', 'cancelled'].includes(p.status));
    const activePatients = activePatientsArray.length;
    const waitingTriage = getPatientsByStatus('waiting-triage').length;
    const inConsultation = getPatientsByStatus('in-consultation').length;
    
    const slaViolations = patients.filter(patient => {
      const sla = isOverSLA(patient);
      return sla.triageSLA || sla.totalSLA;
    }).length;

    const avgWaitTime = activePatients > 0 
      ? Math.round(activePatientsArray.reduce((acc, p) => acc + getTimeElapsed(p, 'generated'), 0) / activePatients)
      : 0;

    if (lowerQuestion.includes('tempo') && (lowerQuestion.includes('espera') || lowerQuestion.includes('aguarda'))) {
      return `O tempo médio de espera atual é de **${avgWaitTime} minutos**.\n\n**Análise detalhada:**\n• ${waitingTriage} pacientes aguardando triagem\n• ${inConsultation} pacientes em consulta\n• ${slaViolations} violações de SLA detectadas\n\n**Recomendação:** ${avgWaitTime > 30 ? 'Considere reforçar a equipe de triagem' : 'Tempos dentro do esperado'}`;
    }
    
    if (lowerQuestion.includes('quantos') && lowerQuestion.includes('paciente')) {
      return `**Situação atual dos pacientes:**\n\n• **Total de pacientes:** ${totalPatients}\n• **Pacientes ativos:** ${activePatients}\n• **Aguardando triagem:** ${waitingTriage}\n• **Em atendimento:** ${inConsultation}\n• **Alta/Transferidos:** ${totalPatients - activePatients}\n\n**Taxa de ocupação:** ${Math.round((activePatients / Math.max(totalPatients, 1)) * 100)}%`;
    }
    
    if (lowerQuestion.includes('sla') || lowerQuestion.includes('prazo') || lowerQuestion.includes('atraso')) {
      const slaPerformance = activePatients > 0 ? Math.round(((activePatients - slaViolations) / activePatients) * 100) : 100;
      return `**Performance SLA atual:**\n\n• **Conformidade:** ${slaPerformance}%\n• **Violações:** ${slaViolations} casos\n• **Status:** ${slaPerformance > 80 ? '✅ Dentro do padrão' : '⚠️ Requer atenção'}\n\n**Principais causas de atraso:**\n${slaViolations > 0 ? '• Sobrecarga na triagem\n• Falta de leitos disponíveis' : '• Sistema operando normalmente'}`;
    }
    
    if (lowerQuestion.includes('eficiência') || lowerQuestion.includes('desempenho')) {
      const efficiency = activePatients > 0 ? Math.round((inConsultation / activePatients) * 100) : 0;
      return `**Análise de Eficiência:**\n\n• **Taxa de atendimento:** ${efficiency}%\n• **Fluxo de pacientes:** ${efficiency > 50 ? 'Otimizado' : 'Pode melhorar'}\n• **Gargalos identificados:** ${waitingTriage > 3 ? 'Triagem sobrecarregada' : 'Fluxo normal'}\n\n**Sugestões:**\n${efficiency < 50 ? '• Redistribuir equipe médica\n• Priorizar casos urgentes' : '• Manter ritmo atual\n• Monitorar continuamente'}`;
    }
    
    if (lowerQuestion.includes('prioridade') || lowerQuestion.includes('urgente') || lowerQuestion.includes('grave')) {
      const priorityDistribution = patients.reduce((acc, p) => {
        if (p.triageData?.priority) {
          acc[p.triageData.priority] = (acc[p.triageData.priority] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      return `**Distribuição por Prioridade:**\n\n🔴 **Vermelho (Emergência):** ${priorityDistribution.vermelho || 0}\n🟠 **Laranja (Muito urgente):** ${priorityDistribution.laranja || 0}\n🟡 **Amarelo (Urgente):** ${priorityDistribution.amarelo || 0}\n🟢 **Verde (Pouco urgente):** ${priorityDistribution.verde || 0}\n🔵 **Azul (Não urgente):** ${priorityDistribution.azul || 0}\n\n**Recomendação:** ${priorityDistribution.vermelho > 0 ? 'Priorizar casos vermelhos imediatamente' : 'Fluxo de prioridades equilibrado'}`;
    }

    // Resposta genérica
    return `Baseado nos dados atuais:\n\n• **${totalPatients} pacientes** no sistema\n• **${activePatients} ativos**, **${inConsultation} em atendimento**\n• **Tempo médio de espera:** ${avgWaitTime} min\n• **Performance SLA:** ${Math.round(((activePatients - slaViolations) / Math.max(activePatients, 1)) * 100)}%\n\nPode fazer perguntas mais específicas sobre tempo de espera, prioridades, eficiência ou qualquer indicador que desejar analisar!`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const questionToAnalyze = newMessage;
    setNewMessage('');

    // Simular typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: analyzeQuestion(questionToAnalyze),
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentResponse]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Quantos pacientes estão aguardando atendimento?",
    "Qual a performance do SLA hoje?",
    "Como está a eficiência do hospital?",
    "Quantos casos de alta prioridade temos?",
    "Qual setor tem mais gargalos?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] shadow-2xl">
      <Card className="h-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex-row items-center justify-between py-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Assistente de Dados
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsMinimized(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 max-h-[500px]">
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2 rounded-lg text-sm ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white ml-2' 
                    : 'bg-gray-100 text-gray-800 mr-2'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.sender === 'agent' && (
                      <Bot className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    )}
                    <div className="whitespace-pre-wrap text-xs leading-relaxed">{message.text}</div>
                    {message.sender === 'user' && (
                      <User className="h-3 w-3 mt-1 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-[85%] p-2 rounded-lg mr-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-3 w-3 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-600">Analisando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Perguntas sugeridas */}
          <div className="px-3 py-2 border-t bg-gray-50 max-h-20 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-gray-700">Sugestões:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs h-6 px-2"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Input de mensagem */}
          <div className="p-3 border-t bg-white">
            <div className="flex space-x-2">
              <Input
                placeholder="Faça uma pergunta..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
              />
              <Button 
                onClick={handleSendMessage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingChatAgent;
