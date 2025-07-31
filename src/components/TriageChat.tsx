
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
    medications: { name: string; dosage: string }[];
    observations: string;
  };
  onSuggestPriority: (priority: string, reasoning: string) => void;
  onCompleteTriagem: () => void;
  isDialogOpen: boolean;
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
  isDialogOpen 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnalyzedData, setHasAnalyzedData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to check if all fields are filled
  const isFormComplete = () => {
    const { personalData, vitals } = triageData;
    return (
      personalData.fullName.trim() !== '' &&
      personalData.dateOfBirth !== '' &&
      personalData.gender !== '' &&
      triageData.complaints.trim() !== '' &&
      triageData.symptoms.trim() !== '' &&
      triageData.chronicDiseases.trim() !== '' &&
      triageData.allergies.length > 0 &&
      triageData.medications.length > 0 &&
      triageData.painScale !== '' &&
      vitals.bloodPressure.trim() !== '' &&
      vitals.heartRate.trim() !== '' &&
      vitals.temperature.trim() !== '' &&
      vitals.oxygenSaturation.trim() !== '' &&
      vitals.respiratoryRate.trim() !== '' &&
      vitals.glasgow.trim() !== '' &&
      vitals.glucose.trim() !== '' &&
      triageData.observations.trim() !== ''
    );
  };

  // Add initial LIA message with delay and streaming
  useEffect(() => {
    if (isDialogOpen && messages.length === 0) {
      setIsTyping(true);
      
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
        
        const welcomeText = "Olá! Eu sou Lia. Sua Assistente pessoal de triagem Manchester. Se você tiver alguma dúvida sobre este atendimento é só perguntar";
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

  // Analyze data automatically when form is complete - ONLY ONCE
  useEffect(() => {
    if (isFormComplete() && !hasAnalyzedData && messages.length > 0 && isDialogOpen) {
      setTimeout(() => {
        analyzeTriageData();
        setHasAnalyzedData(true);
      }, 1000);
    }
  }, [triageData, hasAnalyzedData, messages.length, isDialogOpen]);

  const analyzeTriageData = () => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      const { vitals, complaints, symptoms, painScale, personalData } = triageData;
      const heartRate = parseInt(vitals.heartRate) || 0;
      const temp = parseFloat(vitals.temperature) || 0;
      const saturation = parseInt(vitals.oxygenSaturation) || 100;
      const pain = parseInt(painScale) || 0;
      const age = calculateAge(personalData.dateOfBirth);
      
      let priority = 'azul';
      let reasoning = '';
      
      // Analysis based on Manchester protocol
      if (saturation < 85 || heartRate > 150 || heartRate < 40) {
        priority = 'vermelho';
        reasoning = 'Sinais vitais críticos detectados - requer atendimento imediato';
      } else if (temp > 39.5 || (temp > 38.5 && (heartRate > 120 || saturation < 92))) {
        priority = 'laranja';
        reasoning = 'Febre alta com comprometimento de sinais vitais';
      } else if (complaints.toLowerCase().includes('dor no peito') || complaints.toLowerCase().includes('precordial')) {
        if (pain >= 8 || heartRate > 150 || saturation < 90) {
          priority = 'vermelho';
          reasoning = 'Dor torácica com sinais de alarme';
        } else if (pain >= 6 || heartRate > 100) {
          priority = 'laranja';
          reasoning = 'Dor torácica significativa requer avaliação urgente';
        } else {
          priority = 'amarelo';
          reasoning = 'Dor torácica requer investigação';
        }
      } else if (pain >= 8 || temp > 38.5 || heartRate > 120 || saturation < 92) {
        priority = 'laranja';
        reasoning = 'Sinais de comprometimento moderado';
      } else if (pain >= 5 || temp > 37.8 || symptoms.toLowerCase().includes('vômito')) {
        priority = 'amarelo';
        reasoning = 'Sintomas que requerem avaliação em tempo adequado';
      } else if (pain >= 2 || temp > 37.2) {
        priority = 'verde';
        reasoning = 'Sintomas leves que podem aguardar';
      }
      
      // Special considerations for age
      if (age > 65 && priority === 'verde') {
        priority = 'amarelo';
        reasoning += ' (ajustado para idade avançada)';
      }
      
      const analysisMessage = `Análise completa realizada!\n\n**Classificação sugerida:** ${getPriorityText(priority)}\n\n**Justificativa:** ${reasoning}\n\n**Principais achados:**\n• FC: ${heartRate} bpm\n• Temperatura: ${temp}°C\n• Sat O₂: ${saturation}%\n• Dor: ${pain}/10\n• Idade: ${age} anos\n\nRecomendo revisar a classificação antes de finalizar a triagem.`;
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: analysisMessage,
        sender: 'lia',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      onSuggestPriority(priority, reasoning);
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

    // Simulate LIA response
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setMessages([]);
      setHasAnalyzedData(false);
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

      {/* Messages area with scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(80vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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

      {/* Message input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Input
            placeholder="Digite sua pergunta..."
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
