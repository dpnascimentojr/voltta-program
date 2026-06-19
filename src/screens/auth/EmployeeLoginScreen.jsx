import React, { useState } from 'react';
import { COLORS } from '../lib/constants';

const DEMO_EMPLOYEE = { email: 'admin@savana.com', password: '123456', name: 'Administrador' };

export default function EmployeeLoginScreen({ onBack, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (email === DEMO_EMPLOYEE.email && password === DEMO_EMPLOYEE.password) {
      onSuccess({ name: DEMO_EMPLOYEE.name, email: DEMO_EMPLOYEE.email });
      return;
    }
    setError('Login de funcionário inválido.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: COLORS.cream }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: 24 }}>
        <h2 style={{ color: COLORS.maroon }}>Login do funcionário</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" style={{ width: '100%', padding: 12, marginTop: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" style={{ width: '100%', padding: 12, marginTop: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        {error ? <p style={{ color: COLORS.danger }}>{error}</p> : null}
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          <button onClick={handleLogin}>Entrar</button>
          <button onClick={onBack}>Voltar</button>
        </div>
      </div>
    </div>
  );
}
