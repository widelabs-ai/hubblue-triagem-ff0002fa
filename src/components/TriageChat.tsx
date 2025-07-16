
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface TriageData {
  priority: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    respiratoryRate: string;
  };
  complaints: string;
  painScale: string;
  symptoms: string;
  allergies: string;
  medications: string;
  observations: string;
}

interface TriageChatProps {
  triageData: TriageData;
  onSuggestPriority: (priority: string, reasoning: string) => void;
}

const TriageChat: React.FC<TriageChatProps> = ({ triageData, onSuggestPriority }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Olá! Sou o agente especialista em triagem Manchester. Estou aqui para ajudar com dúvidas sobre classificação e diagnóstico. Como posso auxiliar?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeTriageData = () => {
    const { complaints, symptoms, vitals, painScale } = triageData;
    
    // Análise automática baseada nos dados
    let suggestedPriority = '';
    let reasoning = '';

    // Sinais vitais críticos
    const heartRate = parseInt(vitals.heartRate) || 0;
    const temp = parseFloat(vitals.temperature) || 0;
    const saturation = parseInt(vitals.oxygenSaturation) || 100;
    const pain = parseInt(painScale) || 0;

    if (heartRate > 150 || heartRate < 40 || temp > 39.5 || saturation < 85) {
      suggestedPriority = 'vermelho';
      reasoning = 'Sinais vitais críticos detectados. Necessita atendimento imediato.';
    } else if (pain >= 8 || temp > 38.5 || heartRate > 120 || saturation < 92) {
      suggestedPriority = 'laranja';
      reasoning = 'Sinais de urgência significativa. Atendimento em até 10 minutos.';
    } else if (pain >= 5 || temp > 37.8 || complaints.toLowerCase().includes('dor no peito')) {
      suggestedPriority = 'amarelo';
      reasoning = 'Sintomas que requerem avaliação médica em até 60 minutos.';
    } else if (pain >= 2 || symptoms.toLowerCase().includes('leve')) {
      suggestedPriority = 'verde';
      reasoning = 'Condição estável, pode aguardar até 120 minutos.';
    } else {
      suggestedPriority = 'azul';
      reasoning = 'Condição não urgente, pode aguardar até 240 minutos.';
    }

    return { suggestedPriority, reasoning };
  };

  const handleAnalyzeData = () => {
    if (!triageData.complaints || !triageData.priority) {
      const analysisMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: 'Para fazer uma análise completa, preciso que sejam preenchidas pelo menos as queixas principais. Posso ajudar com alguma dúvida específica sobre classificação?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisMessage]);
      return;
    }

    const { suggestedPriority, reasoning } = analyzeTriageData();
    
    const analysisMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      content: `Análise dos dados da triagem:

**Classificação sugerida:** ${getPriorityText(suggestedPriority)}
**Justificativa:** ${reasoning}

**Dados analisados:**
- Queixas: ${triageData.complaints}
- Dor (0-10): ${triageData.painScale || 'Não informado'}
- Temperatura: ${triageData.vitals.temperature || 'Não aferida'}°C
- FC: ${triageData.vitals.heartRate || 'Não aferida'} bpm
- SatO₂: ${triageData.vitals.oxygenSaturation || 'Não aferida'}%

Gostaria de aplicar esta classificação ou tem alguma dúvida sobre o protocolo?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, analysisMessage]);
    onSuggestPriority(suggestedPriority, reasoning);
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'vermelho': return '🔴 Vermelho - Emergência (imediato)';
      case 'laranja': return '🟠 Laranja - Muito urgente (10 min)';
      case 'amarelo': return '🟡 Amarelo - Urgente (60 min)';
      case 'verde': return '🟢 Verde - Pouco urgente (120 min)';
      case 'azul': return '🔵 Azul - Não urgente (240 min)';
      default: return priority;
    }
  };

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('dor no peito') || lowerMessage.includes('peito')) {
      return 'Dor no peito é um sintoma importante. Avalie: início súbito, irradiação, intensidade e sinais vitais. Geralmente classifica como AMARELO ou superior dependendo da apresentação.';
    }
    
    if (lowerMessage.includes('febre') || lowerMessage.includes('temperatura')) {
      return 'Para febre: <37.8°C = VERDE/AZUL, 37.8-39.5°C = AMARELO, >39.5°C = LARANJA/VERMELHO. Considere idade e outros sintomas associados.';
    }
    
    if (lowerMessage.includes('criança') || lowerMessage.includes('pediatria')) {
      return 'Em pediatria: observe sinais de desidratação, irritabilidade, palidez. Crianças podem deteriorar rapidamente. Seja mais conservador na classificação.';
    }
    
    if (lowerMessage.includes('respiração') || lowerMessage.includes('falta de ar')) {
      return 'Dificuldade respiratória: avalie FR, SatO₂, uso de musculatura acessória. SatO₂ <92% = LARANJA, <85% = VERMELHO.';
    }
    
    if (lowerMessage.includes('protocolo') || lowerMessage.includes('manchester')) {
      return 'O Protocolo Manchester usa fluxogramas baseados em apresentação clínica. Identifique a queixa principal, siga o fluxograma correspondente e classifique conforme discriminadores.';
    }
    
    return 'Entendi sua dúvida. Para uma orientação mais específica, posso analisar os dados completos do paciente. Você pode clicar em "Analisar Dados" ou me fornecer mais detalhes sobre o caso.';
  };

  const sendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simula delay de resposta
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: generateResponse(inputValue),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agente Especialista em Triagem
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'agent' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div className="text-sm">Digitando...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 space-y-3">
          <Button 
            onClick={handleAnalyzeData}
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
          >
            Analisar Dados do Paciente
          </Button>
          
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua dúvida sobre triagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TriageChat;
