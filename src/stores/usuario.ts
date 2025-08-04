import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/shared/contracts/authentication';
import { doLogout } from '@/services/auth';

type UsuarioStore = {
  usuario: User | null;
  token: string | null;
  setUsuario: (usuario: User) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
};

const useUsuarioStore = create<UsuarioStore>()(
  persist(
    (set) => ({
    usuario: null,
    token: null,
    
    setUsuario: (usuario) => {
      set({ usuario })
      return { ...usuario }
    },

    setToken: (token) => {
      set({ token })
    },
    
    logout: async () => set({ usuario: null, token: null }),
  }),
  {
    name: 'user-storage',
  }
));

export const logout = async () => {
  try {
    await doLogout();
  } finally {
    useUsuarioStore.getState().logout();
  }
};

export default useUsuarioStore;