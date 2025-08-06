import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, FileText, Minus, Maximize2 } from 'lucide-react';

interface TriageChatProps {
  triageData: {
    priority: string;
    vitals: {
      bloodPressure: string;
      heartRate: string;
      temperature: string;
      oxygenSaturation: string;
      respiratoryRate: string;
      glasgow: string;
      glucose: string;
    };
    personalData: {
      fullName: string;
      dateOfBirth: string;
      gender: string;
    };
    complaints: string;
    painScale: string;
    symptoms: string;
    chronicDiseases: string;
    allergies: string[];
    medications: string[];
    observations: string;
  };
  onSuggestPriority: (priority: string, reasoning: string) => void;
  onCompleteTriagem: () => void;
  isDialogOpen: boolean;
  isFormComplete: boolean;
  hasPerformedAnalysis: boolean;
  onAnalysisPerformed: () => void;
  onOpenClinicalModal: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lia';
  timestamp: Date;
  hasActionButton?: boolean;
}

const TriageChat: React.FC<TriageChatProps> = ({ 
  triageData, 
  onSuggestPriority, 
  onCompleteTriagem,
  isDialogOpen,
  isFormComplete,
  hasPerformedAnalysis,
  onAnalysisPerformed,
  onOpenClinicalModal
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adicionar mensagem inicial da LIA com delay e streaming
  useEffect(() => {
    if (isDialogOpen && messages.length === 0) {
      setIsTyping(true);
      
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
        
        const welcomeText = "Olá! Eu sou Lia. Sua Assistente pessoal de triagem Manchester. Preencha todos os campos do formulário e clique em 'Revisar com LIA' para que eu possa fazer a análise completa do paciente.";
        let currentText = "";
        let charIndex = 0;
        
        const addMessage = () => {
          setMessages([{
            id: '1',
            text: currentText,
            sender: 'lia',
            timestamp: new Date()
          }]);
        };
        
        const streamingTimer = setInterval(() => {
          if (charIndex < welcomeText.length) {
            currentText += welcomeText[charIndex];
            charIndex++;
            addMessage();
          } else {
            clearInterval(streamingTimer);
          }
        }, 30);
        
        return () => clearInterval(streamingTimer);
      }, 2000);
      
      return () => clearTimeout(typingTimer);
    }
  }, [isDialogOpen, messages.length]);

  // Trigger analysis only when hasPerformedAnalysis changes from false to true
  useEffect(() => {
    if (hasPerformedAnalysis && isFormComplete && messages.length > 0) {
      setTimeout(() => {
        askContextualQuestion();
      }, 1000);
    }
  }, [hasPerformedAnalysis]);

  const generateContextualQuestion = () => {
    const { vitals, complaints, symptoms, painScale, personalData } = triageData;
    const heartRate = parseInt(vitals.heartRate) || 0;
    const temp = parseFloat(vitals.temperature) || 0;
    const saturation = parseInt(vitals.oxygenSaturation) || 100;
    const pain = parseInt(painScale) || 0;
    const age = calculateAge(personalData.dateOfBirth);
    const complaintsLower = complaints.toLowerCase();
    const symptomsLower = symptoms.toLowerCase();

    // Gerar perguntas baseadas nos dados clínicos com orientações para atualizar o formulário
    const questions = [];

    // Perguntas baseadas na temperatura
    if (temp > 37.8) {
      questions.push("O paciente apresenta sudorese associada à febre? **Se sim, adicione essa informação nos sintomas ou observações do formulário antes de revisá-lo.**");
      questions.push("Há quanto tempo o paciente está com febre? **Atualize as observações do formulário com essa informação temporal antes de concluir a análise.**");
      questions.push("O paciente teve calafrios recentes? **Se houver calafrios, inclua essa informação nos sintomas do formulário.**");
    }

    // Perguntas baseadas na frequência cardíaca
    if (heartRate > 100) {
      questions.push("O paciente refere palpitações ou sensação de coração acelerado? **Se confirmar palpitações, adicione aos sintomas no formulário.**");
      questions.push("A taquicardia está presente em repouso? **Atualize as observações do formulário com essa informação contextual.**");
    }

    // Perguntas baseadas nas queixas
    if (complaintsLower.includes('dor no peito') || complaintsLower.includes('precordial')) {
      questions.push("A dor no peito irradia para braço, mandíbula ou costas? **Se houver irradiação, atualize a descrição das queixas principais no formulário.**");
      questions.push("A dor piora com inspiração profunda ou movimento? **Adicione essa característica da dor nas observações do formulário.**");
      questions.push("O paciente apresenta sudorese fria associada à dor? **Se confirmar sudorese, inclua nos sintomas do formulário.**");
    }

    if (complaintsLower.includes('cefaleia') || complaintsLower.includes('dor de cabeça')) {
      questions.push("A cefaleia é pulsátil ou em peso? **Atualize a descrição da cefaleia nas queixas principais do formulário com essa característica.**");
      questions.push("Há fotofobia ou fonofobia associada? **Se houver, adicione esses sintomas no campo apropriado do formulário.**");
      questions.push("O paciente apresenta rigidez de nuca? **Se confirmar rigidez de nuca, inclua essa informação crítica nos sintomas do formulário.**");
    }

    if (complaintsLower.includes('dispneia') || complaintsLower.includes('falta de ar')) {
      questions.push("A dispneia ocorre em repouso ou apenas aos esforços? **Atualize as queixas principais com essa especificação antes de continuar.**");
      questions.push("Há presença de tosse ou expectoração? **Se houver, adicione esses sintomas no formulário.**");
      questions.push("O paciente apresenta cianose de extremidades? **Se observar cianose, inclua essa informação nos sintomas do formulário.**");
    }

    if (complaintsLower.includes('dor abdominal') || complaintsLower.includes('abdome')) {
      questions.push("A dor abdominal é localizada ou difusa? **Especifique a localização da dor nas queixas principais do formulário.**");
      questions.push("Há náuseas ou vômitos associados? **Se houver, adicione aos sintomas no formulário.**");
      questions.push("O paciente consegue deambular normalmente? **Inclua essa informação funcional nas observações do formulário.**");
    }

    // Perguntas baseadas nos sintomas
    if (symptomsLower.includes('vômito') || symptomsLower.includes('náusea')) {
      questions.push("Os vômitos são em grande quantidade ou pequenos volumes? **Atualize a descrição dos vômitos nos sintomas do formulário.**");
      questions.push("Há presença de sangue nos vômitos? **Se houver sangue, essa informação crítica deve ser adicionada aos sintomas do formulário.**");
    }

    if (symptomsLower.includes('tontura') || symptomsLower.includes('vertigem')) {
      questions.push("A tontura é rotatória ou sensação de desmaio? **Especifique o tipo de tontura nos sintomas do formulário.**");
      questions.push("Os sintomas pioram com mudança de posição? **Adicione essa informação contextual nas observações do formulário.**");
    }

    // Perguntas baseadas na idade
    if (age > 65) {
      questions.push("O paciente tem cuidador ou familiar presente? **Inclua essa informação social nas observações do formulário.**");
      questions.push("Houve alguma alteração no padrão de sono ou apetite? **Se houver alterações, adicione essas informações nos sintomas do formulário.**");
    }

    if (age < 18) {
      questions.push("A criança está irritadiça ou sonolenta? **Atualize os sintomas do formulário com essas características comportamentais.**");
      questions.push("Há diminuição da aceitação alimentar? **Se houver, inclua essa informação nos sintomas do formulário.**");
    }

    // Perguntas baseadas na saturação
    if (saturation < 95) {
      questions.push("O paciente apresenta cianose visível? **Se observar cianose, adicione essa informação crítica nos sintomas do formulário.**");
      questions.push("Há uso de musculatura acessória para respirar? **Inclua essa observação clínica nos sintomas do formulário.**");
    }

    // Perguntas baseadas na dor
    if (pain >= 7) {
      questions.push("O paciente consegue se movimentar ou prefere ficar imóvel? **Adicione essa informação funcional nas observações do formulário.**");
      questions.push("A dor interfere na capacidade de falar ou concentrar-se? **Inclua essa característica da dor nas observações do formulário.**");
    }

    // Perguntas gerais baseadas no conjunto de sintomas
    if (temp > 37.5 && heartRate > 100) {
      questions.push("O paciente apresenta sinais de desidratação como boca seca ou diminuição da diurese? **Se houver sinais de desidratação, adicione aos sintomas do formulário.**");
    }

    // Retornar uma pergunta aleatória ou a mais relevante
    if (questions.length > 0) {
      return questions[Math.floor(Math.random() * questions.length)];
    }

    // Pergunta genérica se nenhuma específica for gerada
    return "Há algum sinal ou sintoma adicional que não foi mencionado que possa ser relevante para o caso? **Se houver informações adicionais, atualize o formulário antes de concluir a análise.**";
  };

  const askContextualQuestion = () => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      const contextualQuestion = generateContextualQuestion();
      
      const questionMessage: Message = {
        id: Date.now().toString(),
        text: `Analisando os dados clínicos apresentados...\n\n**Pergunta para esclarecimento:**\n${contextualQuestion}\n\nVocê pode responder à pergunta e atualizar o formulário se necessário, ou seguir diretamente para a revisão da ficha clínica.`,
        sender: 'lia',
        timestamp: new Date(),
        hasActionButton: true
      };
      
      setMessages(prev => [...prev, questionMessage]);
      setWaitingForAnswer(true);
    }, 2000);
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    
    return age;
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'vermelho': return '🔴 Vermelho - Emergência';
      case 'laranja': return '🟠 Laranja - Muito urgente';
      case 'amarelo': return '🟡 Amarelo - Urgente';
      case 'verde': return '🟢 Verde - Pouco urgente';
      case 'azul': return '🔵 Azul - Não urgente';
      default: return priority;
    }
  };

  const handleOpenClinicalModal = () => {
    setWaitingForAnswer(false);
    
    // Simular resposta da LIA
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const liaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Entendido! Vou abrir a ficha clínica com todos os dados coletados para revisão final.",
        sender: 'lia',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, liaResponse]);
      
      // Abrir modal após resposta
      setTimeout(() => {
        onOpenClinicalModal();
      }, 1000);
    }, 1000);
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
    setNewMessage('');

    // Se estava esperando resposta da pergunta contextual
    if (waitingForAnswer) {
      setWaitingForAnswer(false);
      
      // Simular resposta da LIA e abrir modal
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const liaResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Obrigada pela informação! Certifique-se de que todas as informações relevantes estão atualizadas no formulário. Agora vou abrir a ficha clínica com todos os dados para revisão final.",
          sender: 'lia',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, liaResponse]);
        
        // Abrir modal após resposta
        setTimeout(() => {
          onOpenClinicalModal();
        }, 1500);
      }, 1000);
    } else {
      // Resposta padrão para outras perguntas
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const liaResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Obrigada pela sua pergunta! Estou aqui para ajudar com qualquer dúvida sobre a triagem. Posso esclarecer sobre os protocolos Manchester, sinais vitais ou qualquer aspecto do atendimento.",
          sender: 'lia',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, liaResponse]);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reset quando o dialog fecha
  useEffect(() => {
    if (!isDialogOpen) {
      setMessages([]);
      setIsTyping(false);
      setIsMinimized(false);
    }
  }, [isDialogOpen]);

  // Não renderizar se o dialog não estiver aberto
  if (!isDialogOpen) {
    return null;
  }

  // Versão minimizada - botão flutuante
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-16 h-16 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl">
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-row items-center justify-between py-3 rounded-t-lg flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            LIA - Assistente de Triagem
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsMinimized(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Área de mensagens com scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-4' 
                    : 'bg-white text-gray-800 mr-4 border border-gray-100'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.sender === 'lia' && (
                      <Bot className="h-4 w-4 mt-1 text-purple-600 flex-shrink-0" />
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  
                  {/* Botão de ação para mensagens da LIA com pergunta contextual */}
                  {message.sender === 'lia' && message.hasActionButton && waitingForAnswer && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <Button
                        onClick={handleOpenClinicalModal}
                        size="sm"
                        variant="outline"
                        className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 shadow-sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Seguir para Ficha Clínica
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 max-w-[80%] p-3 rounded-lg mr-4 shadow-md border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem */}
          <div className="p-4 border-t bg-white shadow-inner flex-shrink-0">
            <div className="flex space-x-2">
              <Input
                placeholder={waitingForAnswer ? "Digite sua resposta..." : "Digite sua pergunta..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
              />
              <Button 
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TriageChat;
