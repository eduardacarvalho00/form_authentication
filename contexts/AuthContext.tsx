/* eslint-disable no-unused-vars */
import { createContext, ReactNode } from 'react';

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn(credentials : SignInCredentials): Promise<void>; // função assincrona retorna uma void
  isAuthenticated: boolean;
}

type AuthProviderProps={
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = false;
  
  async function signIn({ email, password }: SignInCredentials) {
    console.log({ email, password });
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
