import useUsuarioStore from "@/stores/usuario";
import LoginScreen from "@/components/LoginScreen";
import UpdatePasswordScreen from "@/components/UpdatePasswordScreen";
import Header from "@/components/Header";
import PrivateRoutes from "./privateRoutes";
import TotemScreen from "@/components/TotemScreen";

const AppRoutes = () => {
    const {primeiroAcesso, token} = useUsuarioStore();

    if (!token) {
      return <LoginScreen />;
    }
  
    if (primeiroAcesso) {
      return <UpdatePasswordScreen />;
    }
  
    if (!token && location.pathname === "/totem-atendimento") {
      return <TotemScreen />
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PrivateRoutes/>
      </div>
    );
  };

export default AppRoutes;