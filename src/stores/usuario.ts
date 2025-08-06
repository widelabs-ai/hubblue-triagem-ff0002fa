import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/shared/contracts/authentication';
import { doLogout } from '@/services/auth';

type UsuarioStore = {
  usuario: User | null;
  token: string | null;
  refreshToken: string | null;
  primeiroAcesso: boolean;
  setUsuario: (usuario: User) => void;
  setToken: (token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
};

const useUsuarioStore = create<UsuarioStore>()(
  persist(
    (set) => ({
    usuario: null,
    token: null,
    primeiroAcesso: false,
    refreshToken: null,
    setUsuario: (usuario) => {
      set({ usuario })
      if (usuario && usuario.criadoEm === usuario.atualizadoEm) {
        set({ primeiroAcesso: true })
      } else {
        set({ primeiroAcesso: false })
      }
      return { ...usuario }
    },

    setToken: (token, refreshToken) => {
      set({ token, refreshToken })
    },
    
    logout: async () => set({ usuario: null, token: null, primeiroAcesso: false, refreshToken: null }),
  }),
  {
    name: 'user-storage',
  }
));

export const logout = async (token: string, refreshToken: string) => {
  try {
    await doLogout({token: token, refreshToken: refreshToken});
  } finally {
    useUsuarioStore.getState().logout();
    // Forçar reload completo para garantir que o estado seja limpo
    window.location.replace('/');
  }
};

export default useUsuarioStore;