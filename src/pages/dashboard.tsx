import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/Home.module.css';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  return (
    <div className={styles.main}>
      <h1>Uhuul, você é o escolhido. Seja bem vindo(a) {user?.email}!</h1>
    </div>
  );
}
