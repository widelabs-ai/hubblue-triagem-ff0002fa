
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthUser, UserRole } from '@/types/user';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: Omit<AuthUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize with default admin user
  useEffect(() => {
    const storedUsers = localStorage.getItem('hospital-users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultAdmin: AuthUser = {
        id: '1',
        name: 'Administrador',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'administrador',
        createdAt: new Date(),
        isActive: true
      };
      setUsers([defaultAdmin]);
      localStorage.setItem('hospital-users', JSON.stringify([defaultAdmin]));
    }

    const storedCurrentUser = localStorage.getItem('hospital-current-user');
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('hospital-current-user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hospital-current-user');
  };

  const createUser = (userData: Omit<AuthUser, 'id' | 'createdAt'>) => {
    const newUser: AuthUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('hospital-users', JSON.stringify(updatedUsers));
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, ...userData } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('hospital-users', JSON.stringify(updatedUsers));
    
    if (currentUser?.id === id) {
      const updatedCurrentUser = { ...currentUser, ...userData };
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('hospital-current-user', JSON.stringify(updatedCurrentUser));
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('hospital-users', JSON.stringify(updatedUsers));
  };

  const publicUsers = users.map(({ password, ...user }) => user);

  return (
    <UserContext.Provider value={{
      users: publicUsers,
      currentUser,
      login,
      logout,
      createUser,
      updateUser,
      deleteUser,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </UserContext.Provider>
  );
};
