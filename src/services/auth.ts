import { AlterarSenhaRequest, CadastroRequest, EsqueciMinhaSenhaRequest, LoginRequest, LogoutRequest} from '@/shared/contracts/authentication';
import useUsuarioStore from '@/stores/usuario';
import { logout } from '@/stores/usuario';

const API_BASE_URL = import.meta.env.VITE_HUBBLUE_API || 'localhost:3000/api';

 const fetchApi = async (url: string, options: RequestInit = {}) => {
    const {token, refreshToken} = useUsuarioStore.getState()
  
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
          logout(token, refreshToken);
        }
      }
      throw new Error(response.statusText);
    }
  
    return response.json();
  };
  
    export const doLogin = async (request: LoginRequest) => {
      return fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(request),
        credentials: 'include',
      });
    }
  
    export const doLogout = async (request: LogoutRequest) => {
      return fetchApi('/auth/logout', {
        method: 'POST',
        body: JSON.stringify(request),
        credentials: 'include',
      });
    }

    export const doCadastro = async (request: CadastroRequest) => {
       return fetchApi('/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify(request),
        credentials: 'include',
      });
    }


  export const doRecuperarSenha = async (request: EsqueciMinhaSenhaRequest) => {
    return fetchApi('/auth/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify(request),
      credentials: 'include',
    });
  }

  export const doAlterarSenha = async (request: AlterarSenhaRequest) => {
    
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${request.token}`,
    };

    const response = await fetch(`${API_BASE_URL}/auth/alterar-senha`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }