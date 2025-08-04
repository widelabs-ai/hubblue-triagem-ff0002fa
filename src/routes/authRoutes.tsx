import { Route, Routes, Navigate } from "react-router-dom";
import LoginScreen from "@/components/LoginScreen";
import ForgotPasswordScreen from "@/components/ForgotPasswordScreen";
import UpdatePasswordScreen from "@/components/UpdatePasswordScreen";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} index />
      <Route path="/recuperar-senha" element={<ForgotPasswordScreen />} />
      <Route path="/alterar-senha/:token" element={<UpdatePasswordScreen />} />
    </Routes>
  );
};

export default AuthRoutes;