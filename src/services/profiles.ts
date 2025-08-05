import useUsuarioStore from '@/stores/usuario';
import { logout } from '@/stores/usuario';

const API_BASE_URL = import.meta.env.VITE_HUBBLUE_API || 'localhost:3000/api';

 const fetchApi = async (url: string, options: RequestInit = {}) => {
    const {token} = useUsuarioStore.getState()
  
    const baseHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  
    if (!options.headers) {
      options.headers = {};
    }
  
    Object.assign(options.headers, baseHeaders);
  
    const response = await fetch(`${API_BASE_URL}${url}`, options);
  
    if (!response.ok) {
      if (response.status === 401) {
        const error = await response.json().catch(() => null);
  
        if (error?.message === 'Unauthorized') {
          logout();
        }
      }
      throw new Error(response.statusText);
    }
  
    return response.json();
  };
  
    export const listaPerfis = async () => {
      return fetchApi('/perfis', {
        method: 'GET',
        credentials: 'include',
      });
    }

    export const buscaPerfil = async (id: string) => {
      return fetchApi(`/perfis/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
    }

    export const atualizaPerfil = async (id: string, nome: string, permissoes: string[]) => {
      return fetchApi(`/perfis/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({nome, permissoes}),
      });
    }

    export const deletaPerfil = async (id: string) => {
        return fetchApi(`/perfis/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    }

    export const criaPerfil = async (nome: string, permissoes: string[]) => {
        return fetchApi('/perfis', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({nome, permissoes}),
        });
    }
    