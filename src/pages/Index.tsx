
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Activity, 
  UserCheck, 
  ClipboardList, 
  Stethoscope, 
  BarChart3, 
  FileText,
  Monitor
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const modules = [
    {
      title: "Totem de Senhas",
      description: "Geração de senhas para pacientes",
      icon: Activity,
      path: "/totem",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Triagem",
      description: "Atendimento de triagem e classificação",
      icon: UserCheck,
      path: "/triagem",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Administrativo",
      description: "Coleta de dados pessoais",
      icon: ClipboardList,
      path: "/administrativo",
      color: "bg-yellow-500 hover:bg-yellow-600"
    },
    {
      title: "Médico",
      description: "Atendimento médico",
      icon: Stethoscope,
      path: "/medico",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Monitoramento",
      description: "Dashboard de acompanhamento",
      icon: BarChart3,
      path: "/monitoramento",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Relatórios",
      description: "Relatórios e estatísticas",
      icon: FileText,
      path: "/relatorios",
      color: "bg-gray-500 hover:bg-gray-600"
    },
    {
      title: "Painel",
      description: "Painel de TV para exibição de senhas",
      icon: Monitor,
      path: "/painel",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  // Add user management for admin users
  if (user?.role === 'admin') {
    modules.unshift({
      title: "Gerenciar Usuários",
      description: "Cadastro e gestão de usuários",
      icon: Users,
      path: "/usuarios",
      color: "bg-red-500 hover:bg-red-600"
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Gestão Hospitalar
        </h1>
        <p className="text-xl text-gray-600">
          Bem-vindo, {user?.name}! Selecione um módulo para começar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.path} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${module.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">{module.description}</p>
                <Button 
                  onClick={() => navigate(module.path)}
                  className="w-full"
                  variant="outline"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
