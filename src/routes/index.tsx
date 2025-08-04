import useUsuarioStore from "@/stores/usuario";
import LoginScreen from "@/components/LoginScreen";
import ForgotPasswordScreen from "@/components/ForgotPasswordScreen";
import UpdatePasswordScreen from "@/components/UpdatePasswordScreen";
import Header from "@/components/Header";
import PrivateRoutes from "./privateRoutes";
import TotemScreen from "@/components/TotemScreen";
import { useLocation } from "react-router-dom";
import AuthRoutes from "./authRoutes";

const AppRoutes = () => {
  const { usuario, token} = useUsuarioStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const routeConfig = [
    {
      condition: !usuario && currentPath === "/totem-atendimento",
      component: <TotemScreen />
    },
    {
      condition: usuario && usuario.criadoEm === usuario.atualizadoEm,
      component: <UpdatePasswordScreen />
    }
  ];

  const matchedRoute = routeConfig.find(route => route.condition);

  if (matchedRoute) {
    return matchedRoute.component;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {
        !usuario ? 
          <AuthRoutes />
        :
        <>
          <Header />
          <PrivateRoutes />
        </>
      }
    </div>
  );
};

export default AppRoutes;