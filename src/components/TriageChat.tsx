import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

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
        
        const welcomeText = "Olá! Eu sou Lia. Sua Assistente pessoal de triagem Manchester. Preencha todos os campos do formulário e clique em 'Revisar e Concluir' para que eu possa fazer a análise completa do paciente.";
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

    // Gerar perguntas baseadas nos dados clínicos
    const questions = [];

    // Perguntas baseadas na temperatura
    if (temp > 37.8) {
      questions.push("O paciente apresenta sudorese associada à febre?");
      questions.push("Há quanto tempo o paciente está com febre?");
      questions.push("O paciente teve calafrios recentes?");
    }

    // Perguntas baseadas na frequência cardíaca
    if (heartRate > 100) {
      questions.push("O paciente refere palpitações ou sensação de coração acelerado?");
      questions.push("A taquicardia está presente em repouso?");
    }

    // Perguntas baseadas nas queixas
    if (complaintsLower.includes('dor no peito') || complaintsLower.includes('precordial')) {
      questions.push("A dor no peito irradia para braço, mandíbula ou costas?");
      questions.push("A dor piora com inspiração profunda ou movimento?");
      questions.push("O paciente apresenta sudorese fria associada à dor?");
    }

    if (complaintsLower.includes('cefaleia') || complaintsLower.includes('dor de cabeça')) {
      questions.push("A cefaleia é pulsátil ou em peso?");
      questions.push("Há fotofobia ou fonofobia associada?");
      questions.push("O paciente apresenta rigidez de nuca?");
    }

    if (complaintsLower.includes('dispneia') || complaintsLower.includes('falta de ar')) {
      questions.push("A dispneia ocorre em repouso ou apenas aos esforços?");
      questions.push("Há presença de tosse ou expectoração?");
      questions.push("O paciente apresenta cianose de extremidades?");
    }

    if (complaintsLower.includes('dor abdominal') || complaintsLower.includes('abdome')) {
      questions.push("A dor abdominal é localizada ou difusa?");
      questions.push("Há náuseas ou vômitos associados?");
      questions.push("O paciente consegue deambular normalmente?");
    }

    // Perguntas baseadas nos sintomas
    if (symptomsLower.includes('vômito') || symptomsLower.includes('náusea')) {
      questions.push("Os vômitos são em grande quantidade ou pequenos volumes?");
      questions.push("Há presença de sangue nos vômitos?");
    }

    if (symptomsLower.includes('tontura') || symptomsLower.includes('vertigem')) {
      questions.push("A tontura é rotatória ou sensação de desmaio?");
      questions.push("Os sintomas pioram com mudança de posição?");
    }

    // Perguntas baseadas na idade
    if (age > 65) {
      questions.push("O paciente tem cuidador ou familiar presente?");
      questions.push("Houve alguma alteração no padrão de sono ou apetite?");
    }

    if (age < 18) {
      questions.push("A criança está irritadiça ou sonolenta?");
      questions.push("Há diminuição da aceitação alimentar?");
    }

    // Perguntas baseadas na saturação
    if (saturation < 95) {
      questions.push("O paciente apresenta cianose visível?");
      questions.push("Há uso de musculatura acessória para respirar?");
    }

    // Perguntas baseadas na dor
    if (pain >= 7) {
      questions.push("O paciente consegue se movimentar ou prefere ficar imóvel?");
      questions.push("A dor interfere na capacidade de falar ou concentrar-se?");
    }

    // Perguntas gerais baseadas no conjunto de sintomas
    if (temp > 37.5 && heartRate > 100) {
      questions.push("O paciente apresenta sinais de desidratação como boca seca ou diminuição da diurese?");
    }

    // Retornar uma pergunta aleatória ou a mais relevante
    if (questions.length > 0) {
      return questions[Math.floor(Math.random() * questions.length)];
    }

    // Pergunta genérica se nenhuma específica for gerada
    return "Há algum sinal ou sintoma adicional que não foi mencionado que possa ser relevante para o caso?";
  };

  const askContextualQuestion = () => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      const contextualQuestion = generateContextualQuestion();
      
      const questionMessage: Message = {
        id: Date.now().toString(),
        text: `Analisando os dados clínicos apresentados...\n\n**Pergunta para esclarecimento:**\n${contextualQuestion}\n\nPor favor, responda para que eu possa finalizar a análise e abrir a ficha clínica.`,
        sender: 'lia',
        timestamp: new Date()
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
          text: "Obrigada pela informação! Agora vou abrir a ficha clínica com todos os dados para revisão final.",
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
    }
  }, [isDialogOpen]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">LIA - Assistente de Triagem</h3>
        </div>
      </div>

      {/* Área de mensagens com scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)]">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-blue-600 text-white ml-4' 
                : 'bg-gray-100 text-gray-800 mr-4'
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
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-[80%] p-3 rounded-lg mr-4">
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
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Input
            placeholder={waitingForAnswer ? "Digite sua resposta..." : "Digite sua pergunta..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TriageChat;
