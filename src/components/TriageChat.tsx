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
  isConfirmationQuestion?: boolean;
  suggestedPriority?: string;
  reasoning?: string;
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
  onCompleteTriagem?: () => void;
  isDialogOpen?: boolean;
}

const TriageChat: React.FC<TriageChatProps> = ({ triageData, onSuggestPriority, onCompleteTriagem, isDialogOpen = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<{
    priority: string;
    reasoning: string;
  } | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Trigger animation when dialog opens - duração de 5 segundos com delay
  useEffect(() => {
    if (isDialogOpen) {
      // Delay de 1 segundo antes de iniciar a animação
      setTimeout(() => {
        setShowAnimation(true);
      }, 1000);
      
      // Mostra "Digitando..." após 2 segundos e inicia streaming após 2.5 segundos
      setTimeout(() => {
        if (!initialMessageSent) {
          setIsLoading(true);
          
          // Inicia streaming após 0.5 segundos do "Digitando..."
          setTimeout(() => {
            setIsLoading(false);
            setIsStreaming(true);
            const fullMessage = 'Olá! Eu sou Lia. Sua Assistente pessoal de triagem Manchester. Se você tiver alguma dúvida sobre este atendimento é só perguntar';
            
            // Simula streaming da mensagem
            let currentIndex = 0;
            const streamInterval = setInterval(() => {
              setStreamingText(fullMessage.substring(0, currentIndex + 1));
              currentIndex++;
              
              if (currentIndex >= fullMessage.length) {
                clearInterval(streamInterval);
                setIsStreaming(false);
                
                // Adiciona a mensagem completa ao estado
                const initialMessage: Message = {
                  id: '1',
                  type: 'agent',
                  content: fullMessage,
                  timestamp: new Date()
                };
                setMessages([initialMessage]);
                setStreamingText('');
                setInitialMessageSent(true);
              }
            }, 50); // Velocidade do streaming (50ms por caractere)
          }, 500);
        }
      }, 2000);
    } else {
      setShowAnimation(false);
      setMessages([]);
      setInitialMessageSent(false);
      setHasAnalyzed(false);
      setStreamingText('');
      setIsStreaming(false);
    }
  }, [isDialogOpen]);

  // Verifica se todos os campos obrigatórios estão preenchidos
  const areAllFieldsCompleted = () => {
    return triageData.complaints &&
           triageData.symptoms &&
           triageData.painScale &&
           triageData.allergies &&
           triageData.medications &&
           triageData.observations &&
           triageData.vitals.bloodPressure &&
           triageData.vitals.heartRate &&
           triageData.vitals.temperature &&
           triageData.vitals.oxygenSaturation &&
           triageData.vitals.respiratoryRate;
  };

  // Análise automática quando TODOS os dados são preenchidos
  useEffect(() => {
    if (areAllFieldsCompleted() && !hasAnalyzed && isDialogOpen && initialMessageSent) {
      // Aguarda um pouco após todos os campos serem preenchidos
      setTimeout(() => {
        analyzeTriageData();
        setHasAnalyzed(true);
      }, 1000);
    }
  }, [triageData, hasAnalyzed, isDialogOpen, initialMessageSent]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const analyzeTriageData = () => {
    if (!areAllFieldsCompleted()) {
      const analysisMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: 'Para fazer uma análise completa, preciso que todos os campos da triagem sejam preenchidos. Posso ajudar com alguma dúvida específica sobre classificação?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisMessage]);
      return;
    }

    const { suggestedPriority, reasoning, confirmationQuestion } = performDetailedAnalysis();
    
    const analysisMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      content: `Análise completa dos dados da triagem:

**Classificação sugerida:** ${getPriorityText(suggestedPriority)}
**Justificativa:** ${reasoning}

**Dados analisados:**
- Queixas: ${triageData.complaints}
- Sintomas: ${triageData.symptoms}
- Dor (0-10): ${triageData.painScale}
- Temperatura: ${triageData.vitals.temperature}°C
- FC: ${triageData.vitals.heartRate} bpm
- PA: ${triageData.vitals.bloodPressure} mmHg
- SatO₂: ${triageData.vitals.oxygenSaturation}%
- FR: ${triageData.vitals.respiratoryRate} irpm
- Medicamentos: ${triageData.medications}
- Alergias: ${triageData.allergies}

${confirmationQuestion}`,
      timestamp: new Date(),
      isConfirmationQuestion: true,
      suggestedPriority,
      reasoning
    };

    setMessages(prev => [...prev, analysisMessage]);
    setAwaitingConfirmation({ priority: suggestedPriority, reasoning });
    onSuggestPriority(suggestedPriority, reasoning);
  };

  const performDetailedAnalysis = () => {
    const { complaints, symptoms, vitals, painScale } = triageData;
    
    let suggestedPriority = '';
    let reasoning = '';
    let confirmationQuestion = '';

    // Análise mais detalhada baseada nos dados
    const heartRate = parseInt(vitals.heartRate) || 0;
    const temp = parseFloat(vitals.temperature) || 0;
    const saturation = parseInt(vitals.oxygenSaturation) || 100;
    const pain = parseInt(painScale) || 0;
    const complaintsLower = complaints.toLowerCase();
    const symptomsLower = symptoms.toLowerCase();

    // Verificações específicas para diferentes fluxos
    if (complaintsLower.includes('dor no peito') || complaintsLower.includes('precordial')) {
      if (heartRate > 150 || saturation < 90 || pain >= 8) {
        suggestedPriority = 'vermelho';
        reasoning = 'Dor torácica com sinais de instabilidade hemodinâmica';
        confirmationQuestion = 'Confirma sinais de comprometimento circulatório? (sudorese, palidez, alteração de consciência)';
      } else if (pain >= 6 || heartRate > 100) {
        suggestedPriority = 'laranja';
        reasoning = 'Dor torácica moderada a intensa requer avaliação urgente';
        confirmationQuestion = 'O paciente apresenta irradiação da dor para braço, mandíbula ou pescoço?';
      } else {
        suggestedPriority = 'amarelo';
        reasoning = 'Dor torácica leve sem sinais de alarme';
        confirmationQuestion = 'Histórico de doença cardíaca prévia ou fatores de risco cardiovascular?';
      }
    } else if (temp > 39.5 || (temp > 38.5 && (heartRate > 120 || saturation < 92))) {
      suggestedPriority = 'laranja';
      reasoning = 'Febre alta com sinais de comprometimento sistêmico';
      confirmationQuestion = 'Paciente apresenta sinais de sepse? (confusão mental, hipotensão, taquicardia)';
    } else if (saturation < 85 || heartRate > 150 || heartRate < 40) {
      suggestedPriority = 'vermelho';
      reasoning = 'Sinais vitais críticos - risco de vida';
      confirmationQuestion = 'Confirma necessidade de suporte ventilatório ou circulatório imediato?';
    } else if (pain >= 8 || temp > 38.5 || heartRate > 120 || saturation < 92) {
      suggestedPriority = 'laranja';
      reasoning = 'Sintomas intensos requerem avaliação médica urgente';
      confirmationQuestion = 'Paciente consegue manter-se estável ou há deterioração clínica?';
    } else if (pain >= 5 || temp > 37.8 || symptomsLower.includes('vômito') || symptomsLower.includes('diarréia')) {
      suggestedPriority = 'amarelo';
      reasoning = 'Sintomas moderados necessitam avaliação médica';
      confirmationQuestion = 'Há sinais de desidratação ou comprometimento do estado geral?';
    } else if (pain >= 2 || temp > 37.2) {
      suggestedPriority = 'verde';
      reasoning = 'Sintomas leves, condição estável';
      confirmationQuestion = 'Paciente pode aguardar sem risco de complicações?';
    } else {
      suggestedPriority = 'azul';
      reasoning = 'Condição não urgente';
      confirmationQuestion = 'Confirma que não há urgência médica e pode aguardar atendimento eletivo?';
    }

    return { suggestedPriority, reasoning, confirmationQuestion };
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (!awaitingConfirmation) return;

    const responseMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      content: confirmed 
        ? `Perfeito! Classificação **${getPriorityText(awaitingConfirmation.priority)}** confirmada. Procedendo com a conclusão da triagem conforme protocolo Manchester.

A triagem será finalizada automaticamente com esta classificação.`
        : 'Entendi. Você pode revisar os dados e me fazer perguntas específicas sobre a classificação. Quando estiver pronto, posso fazer uma nova análise.',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, responseMessage]);
    
    if (confirmed && onCompleteTriagem) {
      setTimeout(() => {
        onCompleteTriagem();
      }, 2000);
    }
    
    setAwaitingConfirmation(null);
  };

  const handleTextConfirmation = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Detecta confirmação positiva
    if (lowerMessage.includes('sim') || lowerMessage.includes('confirmo') || 
        lowerMessage.includes('concordo') || lowerMessage.includes('ok') || 
        lowerMessage.includes('correto') || lowerMessage.includes('certo')) {
      handleConfirmation(true);
      return true;
    }
    
    // Detecta confirmação negativa
    if (lowerMessage.includes('não') || lowerMessage.includes('nao') || 
        lowerMessage.includes('revisar') || lowerMessage.includes('errado') || 
        lowerMessage.includes('incorreto') || lowerMessage.includes('discordo')) {
      handleConfirmation(false);
      return true;
    }
    
    return false;
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
      return 'Dor no peito é um sintoma importante. Avalie: início súbito, irradiação, intensidade e sinais vitais. Geralmente classifica como AMARELO ou superior dependendo da apresentação. Há comprometimento hemodinâmico?';
    }
    
    if (lowerMessage.includes('febre') || lowerMessage.includes('temperatura')) {
      return 'Para febre: <37.8°C = VERDE/AZUL, 37.8-39.5°C = AMARELO, >39.5°C = LARANJA/VERMELHO. Considere idade, imunossupressão e outros sintomas associados. Há sinais de sepse?';
    }
    
    if (lowerMessage.includes('criança') || lowerMessage.includes('pediatria')) {
      return 'Em pediatria: observe sinais de desidratação, irritabilidade, palidez. Crianças podem deteriorar rapidamente. Seja mais conservador na classificação. Use escalas específicas para idade.';
    }
    
    if (lowerMessage.includes('respiração') || lowerMessage.includes('falta de ar')) {
      return 'Dificuldade respiratória: avalie FR, SatO₂, uso de musculatura acessória, cianose. SatO₂ <92% = LARANJA, <85% = VERMELHO. Considere broncoespasmo ou insuficiência respiratória.';
    }
    
    if (lowerMessage.includes('protocolo') || lowerMessage.includes('manchester')) {
      return 'O Protocolo Manchester usa fluxogramas baseados em apresentação clínica. Identifique a queixa principal, siga o fluxograma correspondente e classifique conforme discriminadores específicos.';
    }
    
    if (lowerMessage.includes('sangue') || lowerMessage.includes('hemorragia')) {
      return 'Hemorragias: avalie volume perdido, sinais de choque, local do sangramento. Hemorragia ativa com instabilidade = VERMELHO. Sangramento controlado = AMARELO/VERDE conforme quantidade.';
    }
    
    return 'Entendi sua dúvida. Para uma orientação mais específica, posso analisar os dados completos do paciente. Os dados serão analisados automaticamente conforme você preenche o formulário.';
  };

  const sendMessage = () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    
    // Se estamos aguardando confirmação, tenta processar como resposta de confirmação
    if (awaitingConfirmation && handleTextConfirmation(currentInput)) {
      return; // A confirmação foi processada, não precisa gerar resposta adicional
    }
    
    setIsLoading(true);

    // Simula delay de resposta
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: generateResponse(currentInput),
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
    <Card 
      className={`h-full flex flex-col transition-all duration-[5000ms] ease-out ${
        showAnimation 
          ? 'transform scale-100 opacity-100 translate-x-0' 
          : 'transform scale-50 opacity-0 translate-x-16'
      }`}
    >
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div className="text-center leading-tight">
            <div>Converse com a LIA</div>
            <div className="text-sm">sobre este atendimento</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div
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
                
                {/* Botões de confirmação após análise */}
                {message.isConfirmationQuestion && awaitingConfirmation && (
                  <div className="flex justify-start mt-2">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleConfirmation(true)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-auto"
                        size="sm"
                      >
                        Sim, confirmo
                      </Button>
                      <Button 
                        onClick={() => handleConfirmation(false)}
                        variant="outline"
                        className="text-xs px-3 py-1 h-auto"
                        size="sm"
                      >
                        Não, revisar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Mensagem em streaming */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
                  <div className="flex items-start gap-2">
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm whitespace-pre-wrap">{streamingText}<span className="animate-pulse">|</span></div>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && !isStreaming && (
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
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={awaitingConfirmation ? 'Digite "sim" para confirmar ou "não" para revisar...' : 'Digite sua dúvida sobre triagem...'}
              disabled={isLoading || isStreaming}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isLoading || isStreaming}
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
