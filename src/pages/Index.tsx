import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, FileText, Monitor, UserPlus, ClipboardList, BarChart3, AlertTriangle, Info, Clock, TestTube } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Totem de Atendimento",
      description: "Gerar senhas para pacientes",
      icon: <UserPlus className="h-8 w-8" />,
      path: "/totem",
      color: "bg-blue-500"
    },
    {
      title: "Triagem",
      description: "Classificação de risco dos pacientes",
      icon: <ClipboardList className="h-8 w-8" />,
      path: "/triagem",
      color: "bg-red-500"
    },
    {
      title: "Administrativo",
      description: "Coleta de dados pessoais",
      icon: <FileText className="h-8 w-8" />,
      path: "/administrativo",
      color: "bg-purple-500"
    },
    {
      title: "Médico",
      description: "Consultas médicas",
      icon: <Stethoscope className="h-8 w-8" />,
      path: "/medico",
      color: "bg-green-500"
    },
    {
      title: "Monitoramento",
      description: "Dashboard de acompanhamento",
      icon: <Monitor className="h-8 w-8" />,
      path: "/monitoramento",
      color: "bg-indigo-500"
    },
    {
      title: "Relatórios",
      description: "Visualizar dados de todos os pacientes",
      icon: <BarChart3 className="h-8 w-8" />,
      path: "/relatorios",
      color: "bg-orange-500"
    },
    {
      title: "Painel de TV",
      description: "Painel para exibição em TV",
      icon: <Monitor className="h-8 w-8" />,
      path: "/painel",
      color: "bg-cyan-500"
    },
    {
      title: "Status de Exames",
      description: "Acompanhamento de exames em tempo real",
      icon: <TestTube className="h-8 w-8" />,
      path: "/exames",
      color: "bg-teal-500"
    },
    {
      title: "Usuários",
      description: "Gerenciar usuários do sistema",
      icon: <Users className="h-8 w-8" />,
      path: "/usuarios",
      color: "bg-gray-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏥 LIA - Leitura Inteligente de Avaliação</h1>
          <p className="text-xl text-gray-600">Gestão integrada de atendimento</p>
        </div>

        {/* Alertas e Avisos */}
        <div className="mb-8 space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Atenção – Protocolo de Emergência</AlertTitle>
            <AlertDescription className="text-red-700">
              Em casos classificados como emergência (cor vermelha), o paciente deve ser
              encaminhado imediatamente para a Sala Vermelha.
              Tempo de espera: zero minutos.
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Tempos de Atendimento - Protocolo Manchester</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Vermelho: 0 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Laranja: 10 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Amarelo: 60 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Verde: 120 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Azul: 240 min</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Orientações Gerais</AlertTitle>
            <AlertDescription className="text-blue-700">
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Sempre registre a chegada do paciente no totem antes de iniciar a triagem</li>
                <li>Complete todos os dados administrativos antes do atendimento médico</li>
                <li>Monitore constantemente os pacientes em espera através do dashboard</li>
                <li>Utilize o sistema de relatórios para acompanhar métricas de atendimento</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Menu Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="text-center">
                <div className={`${item.color} text-white rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
