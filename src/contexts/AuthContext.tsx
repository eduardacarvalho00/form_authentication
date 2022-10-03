/* eslint-disable import/no-cycle */
/* eslint-disable no-unused-vars */
import Router from 'next/router';
import {
  createContext, ReactNode, useEffect, useState, 
} from 'react';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { api } from '../services/apiClient';

type User ={
  email: string,
  permissions : string[],
  roles: string[],
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn(credentials : SignInCredentials): Promise<void>; // função assincrona retorna uma void
  isAuthenticated: boolean;
  user: User;
}

type AuthProviderProps={
  children: ReactNode;
}

export function SignOut() {
  destroyCookie(undefined, 'Auth.refreshToken');
  destroyCookie(undefined, 'Auth.token');

  Router.push('/');
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'Auth.token': token } = parseCookies();
    if (token) {
      api.get('/me').then((response) => {
        const { email, permissions, roles } = response.data;
        setUser({ email, permissions, roles });
      })
        .catch(() => {
          SignOut();
        });
    }
  }, []);
  
  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      });

      const {
        token, refreshToken, permissions, roles, 
      } = response.data;

      setCookie(undefined, 'Auth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias ---  quanto tempo cookie fica salvo no navegador 
        path: '/',
      });

      setCookie(undefined, 'Auth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
