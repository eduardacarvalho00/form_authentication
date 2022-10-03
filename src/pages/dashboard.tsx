/* eslint-disable no-unused-vars */
import { destroyCookie } from 'nookies';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SetupAPIClient } from '../services/api';
import styles from '../styles/Home.module.css';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  return (
    <div className={styles.main}>
      <h1>Uhuul, você é o escolhido. Seja bem vindo(a) {user?.email}!</h1>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = SetupAPIClient(ctx);
  const response = await apiClient.get('/me');
  
  return {
    props: {},
  };
});
