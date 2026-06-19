import React, { useState } from 'react';
import { PHONE_KEY, COLORS } from '../lib/constants';
import { writeJSON, addToCustomerIndex } from '../lib/storage';
import { normalizeCustomer } from '../lib/customer';

export default function CustomerSignupScreen({ onBack, onCreated }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const digits = phone.replace(/\D/g, '');
    if (!fullName || digits.length < 10) {
      setError('Preencha nome e telefone corretamente.');
      return;
    }
    const customer = {
      fullName,
      phone: digits,
      birthDate,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      coupons: [],
      visits: [],
    };
    await writeJSON(PHONE_KEY(digits), customer);
    await addToCustomerIndex(digits);
    onCreated(normalizeCustomer(customer));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: COLORS.cream }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: 24 }}>
        <h2 style={{ color: COLORS.maroon }}>Cadastro do cliente</h2>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" style={{ width: '100%', padding: 12, marginTop: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone com DDD" style={{ width: '100%', padding: 12, marginTop: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="Aniversário (opcional)" style={{ width: '100%', padding: 12, marginTop: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        {error ? <p style={{ color: COLORS.danger }}>{error}</p> : null}
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          <button onClick={handleCreate}>Cadastrar e entrar</button>
          <button onClick={onBack}>Voltar</button>
        </div>
      </div>
    </div>
  );
}
