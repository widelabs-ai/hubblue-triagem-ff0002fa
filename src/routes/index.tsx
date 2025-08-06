/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import PrivatePageLayout from './privatePageLayout';
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import UserManagement from "@/components/UserManagement";
import TotemScreen from "@/components/TotemScreen";
import TriageScreen from "@/components/TriageScreen";
import AdminScreen from "@/components/AdminScreen";
import DoctorScreen from "@/components/DoctorScreen";
import MonitoringDashboard from "@/components/MonitoringDashboard";
import ReportsScreen from "@/components/ReportsScreen";


const LazyLoginPage = lazy(() => import('@/components/LoginScreen'));
const LazyForgotPasswordPage = lazy(() => import('@/components/ForgotPasswordScreen'));
const LazyResetPasswordPage = lazy(() => import('@/components/UpdatePasswordScreen'));

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LazyLoginPage,
  },
  {
    path: '/recuperar-senha',
    Component: LazyForgotPasswordPage,
  },
  {
    path: '/alterar-senha/:token',
    Component: LazyResetPasswordPage,
  },
  {
    path: '/primeiro-acesso',
    Component: LazyResetPasswordPage,
  },

  // Private routes
  {
    path: '/',
    element: <PrivatePageLayout />,
    children: [
      {
        path: '/home',
        element: <Index />,
      },
      {
        path: '/usuarios',
        element: <UserManagement />,
      },
      {
        path: '/totem',
        element: <TotemScreen />,
      },
      {
        path: '/triagem',
        element: <TriageScreen />,
      },
      {
        path: '/administrativo',
        element: <AdminScreen />,
      },
      {
        path: '/medico',
        element: <DoctorScreen />,
      },
      {
        path: '/monitoramento',
        element: <MonitoringDashboard />,
      },
      {
        path: '/relatorios',
        element: <ReportsScreen />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);


