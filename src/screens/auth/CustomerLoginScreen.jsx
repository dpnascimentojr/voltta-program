import "./CustomerLoginScreen.css";
import logoFallback from "../../assets/logo.png";
import { useState } from "react";

export default function CustomerLoginScreen({ onBack, onLogin, branding }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const logoSrc = branding?.logoUrl || logoFallback;

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onLogin({ phone, pin });
    if (!result?.ok) {
      setError(result?.message || "Não foi possível entrar.");
      return;
    }
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <button type="button" className="login-back" onClick={onBack}>
          ← Voltar
        </button>

        <section className="login-card">
          <div className="login-brand">
            <img src={logoSrc} alt={`Logo ${branding.companyName}`} />
            <div>
              <span className="login-pill">{branding.softwareName}</span>
              <h1>{branding.companyName}</h1>
              <p>Entrar com telefone e PIN.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Telefone
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(75) 99999-0000"
              />
            </label>

            <label>
              PIN
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
              />
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit">
              Entrar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}