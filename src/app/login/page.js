'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Chiamiamo la rotta POST che abbiamo creato in /api/login
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Se lo status è 200-299, il login è ok. 
        // Il cookie è già stato impostato dal server!
        router.push('/admin'); // Reindirizziamo alla dashboard protetta
      } else {
        // Se lo status è 401 o altro, mostriamo l'errore all'utente
        setError(data.error || 'Errore durante il login');
      }
    } catch (err) {
      setError('Problema di connessione con il server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>🚀 KANBAN Board</h1>
        <p style={styles.subtitle}>Accesso Amministratore</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="admin@kanban.it"
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Verifica in corso...' : 'Entra nel sistema'}
        </button>
      </form>
    </div>
  );
}

// Stili rapidi per rendere la pagina gradevole
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', color: '#0288d1', margin: '0 0 10px 0' },
  subtitle: { textAlign: 'center', color: '#7f8c8d', marginBottom: '30px' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' },
  inputGroup: { marginBottom: '20px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#0288d1', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};