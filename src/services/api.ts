import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
// eslint-disable-next-line import/no-cycle
import { SignOut } from '../contexts/AuthContext';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];

interface AxiosErrorResponse {
  code?: string;
}

export const api = axios.create({
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
      cookies = parseCookies();

      const { 'Auth.refreshToken': refreshToken } = cookies;
      const originalConfig = error.config;

      if (!isRefreshing) {
        isRefreshing = true;

        api.post('/refresh', {
          refreshToken,
        }).then((response) => {
          const { token } = response.data;
  
          setCookie(undefined, 'Auth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 dias ---  quanto tempo cookie fica salvo no navegador 
            path: '/',
          });
    
          setCookie(undefined, 'Auth.refreshToken', response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
          });
  
          api.defaults.headers.common.Authorization = `Bearer ${token}`;

          failedRequestQueue.forEach((request) => request.resolve(token));
          failedRequestQueue = [];
        }).catch((err) => {
          failedRequestQueue.forEach((request) => request.reject(err));
          failedRequestQueue = [];
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
    SignOut();
  } 
  
  return Promise.reject(error);
});
