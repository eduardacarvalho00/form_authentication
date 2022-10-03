import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
// eslint-disable-next-line import/no-cycle
import { SignOut } from '../contexts/AuthContext';
import { AuthTokenError } from './Errors/AuthTokenError';

let isRefreshing = false;
let failedRequestQueue = [];

interface AxiosErrorResponse {
  code?: string;
}

export function SetupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);
  
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['Auth.token']}`,
    },
  });

  api.interceptors.response.use((response) => {
    return response;
  }, (error : AxiosError<AxiosErrorResponse>) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies(ctx);

        const { 'Auth.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api.post('/refresh', {
            refreshToken,
          }).then((response) => {
            const { token } = response.data;
  
            setCookie(ctx, 'Auth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 dias ---  quanto tempo cookie fica salvo no navegador 
              path: '/',
            });
    
            setCookie(ctx, 'Auth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/',
            });
  
            api.defaults.headers.common.Authorization = `Bearer ${token}`;

            failedRequestQueue.forEach((request) => request.resolve(token));
            failedRequestQueue = [];
          }).catch((err) => {
            failedRequestQueue.forEach((request) => request.reject(err));
            failedRequestQueue = [];
            if (typeof window !== 'undefined') {
              SignOut();
            }
          }).finally(() => {
            isRefreshing = false;
          });
        }
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            resolve: (token : string) => {
              originalConfig.headers.Authorization = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            reject: (error: AxiosError) => {
              reject(error);
            },
          });
        });
      }
      if (typeof window !== 'undefined') {
        SignOut();
      } else {
        return Promise.reject(new AuthTokenError());
      }
    } 
  
    return Promise.reject(error);
  });
  return api;
}
