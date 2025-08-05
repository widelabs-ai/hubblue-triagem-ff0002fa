import useUsuarioStore from "@/stores/usuario";
import Header from "@/components/Header";
import PrivateRoutes from "./privateRoutes";
import TotemScreen from "@/components/TotemScreen";
import { useLocation } from "react-router-dom";
import AuthRoutes from "./authRoutes";

const AppRoutes = () => {
  const { usuario, primeiroAcesso} = useUsuarioStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const routeConfig = [
    {
      condition: !usuario && currentPath === "/totem-atendimento",
      component: <TotemScreen />
    }
  ];

  const matchedRoute = routeConfig.find(route => route.condition);

  if (matchedRoute) {
    return matchedRoute.component;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {
        !usuario || primeiroAcesso ? 
          <AuthRoutes />
        :
        <div>
              <Header />
              <PrivateRoutes />
        </div>
      }
    </div>
  );
};

export default AppRoutes;