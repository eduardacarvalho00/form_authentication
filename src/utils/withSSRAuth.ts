/* eslint-disable consistent-return */
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import { AuthTokenError } from '../services/Errors/AuthTokenError';

// usuário não autenticado 

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if (!cookies['Auth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    try {
      return fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, 'Auth.token');
        destroyCookie(ctx, 'Auth.refreshToken');
        
        return { 
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
    }
  };
}
