
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUsuarioStore from '@/stores/usuario';
import Header from '@/components/Header';
import TotemScreen from '@/components/TotemScreen';

export function PrivatePageLayout() {
  const [isReady, setIsReady] = useState(false);
  const {usuario} = useUsuarioStore();

  useEffect(() => {
    // Aguarda um tick para garantir que o estado foi inicializado
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario && location.pathname !== '/totem') {
    return <Navigate to="/" replace />;
  }

  if(!usuario && location.pathname === '/totem') {
    return <TotemScreen/>;
  }

  return (
  <div>
    <Header />
    <Outlet />
  </div>
  )
}

export default PrivatePageLayout;
