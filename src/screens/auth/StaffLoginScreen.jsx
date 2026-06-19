import "./StaffLoginScreen.css";
import logoFallback from "../../assets/logo.png";
import { useState } from "react";

export default function StaffLoginScreen({
  onBack,
  onLogin,
  branding,
  recoveryWhatsappLink,
}) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const logoSrc = branding?.logoUrl || logoFallback;

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onLogin({ login, password });
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
              <h1>Painel da equipe</h1>
              <p>Entrar com @id, matrícula, login ou e-mail.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Login
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="@id, matrícula, login ou e-mail"
              />
            </label>

            <label>
              Senha ou PIN
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit">
              Entrar no painel
            </button>
          </form>

          <div className="login-help-box">
            <strong>Recuperar acesso</strong>
            <p>Use WhatsApp da loja para recuperação rápida. E-mail pode ser usado depois na versão com Supabase.</p>

            {recoveryWhatsappLink ? (
              <a
                href={recoveryWhatsappLink}
                target="_blank"
                rel="noreferrer"
                className="login-recovery-link"
              >
                Recuperar login/senha
              </a>
            ) : (
              <button type="button" className="login-recovery-link login-recovery-link--disabled">
                Configure o WhatsApp da loja
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}