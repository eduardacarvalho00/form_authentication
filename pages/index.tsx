import { FormEvent, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    const data = {
      email,
      password,
    };
    console.log(data);
  }
  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.main}>
        <h1 className={styles.title}> Form Authentication</h1>
        <input className={styles.input} type='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
        <input className={styles.input} type='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
        <button className={styles.button} type='submit'>Entrar</button>
      </form>
      <footer className={styles.footer}> 
        <p>
          Feito com carinho por <a href='https://github.com/eduardacarvalho00'>Duda</a> 👌
        </p>
      </footer>
    </div>
    
  );
}
