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
  
    export const getUser = async (request: {id: string}) => {
      return fetchApi(`/usuarios/${request.id}`, {
        method: 'GET',
        credentials: 'include',
      });
    }

   export const getAllUsers = async () => {
      return fetchApi('/usuarios', {
        method: 'GET',
        credentials: 'include',
      });
    }

    export const deleteUser = async (request: {id: string}) => {
      return fetchApi(`/usuarios/${request.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    }

   export const createUser = async (request: {nome: string, email: string, perfilId: number}) => {
    return fetchApi('/usuarios/cadastro', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(request),
    });
  }

  export const updateUser = async (request: {nome: string, email: string, perfilId: number, status: number}, id: string) => {
    return fetchApi(`/usuarios/${id}`,{
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify(request),
    })
  }