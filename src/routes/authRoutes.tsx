import { Navigate, Route, Routes } from "react-router-dom";
import LoginScreen from "@/components/LoginScreen";
import ForgotPasswordScreen from "@/components/ForgotPasswordScreen";
import UpdatePasswordScreen from "@/components/UpdatePasswordScreen";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} index />
      <Route path="/recuperar-senha" element={<ForgotPasswordScreen />} />
      <Route path="/alterar-senha/:token" element={<UpdatePasswordScreen />} />
      <Route path="/primeiro-acesso" element={<UpdatePasswordScreen />} />
    </Routes>
  );
};

export default AuthRoutes;