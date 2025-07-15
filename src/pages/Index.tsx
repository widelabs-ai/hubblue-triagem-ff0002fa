
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, FileText, Monitor, UserPlus, ClipboardList, BarChart3 } from "lucide-react";

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏥 Sistema Hospitalar</h1>
          <p className="text-xl text-gray-600">Gestão integrada de atendimento</p>
        </div>

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
