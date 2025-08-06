export interface User {
    nome: string;
    email: string;
    id: string,
    perfil: Perfil,
    permissoes: string[],
    criadoEm: string,
    atualizadoEm: string
  }

  interface Perfil {
    id: string;
    nome: string;
    status: number;
    criadoEm: string;
    atualizadoEm: string;
  }
  
 export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
  }
  
  export interface LoginRequest {
    email: string;
    senha: string;
  }

  export interface CadastroRequest {
    nome: string;
    email: string;
    perfilId: number
  }

  export interface UpdateUserRequest {
    nome: string;
    email: string;
    perfilId: number;
    status: number;
    id: string;
  }


  export interface AlterarSenhaRequest {
   token: string;
   novaSenha: string;
  }

  export interface EsqueciMinhaSenhaRequest {
    email: string;
  }