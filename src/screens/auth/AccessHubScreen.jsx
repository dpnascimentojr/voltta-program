import { useState } from "react";
import "./AccessHubScreen.css";
import brandLogo from "../../assets/logo.png";

export default function AccessHubScreen({
  onCustomerEnter,
  onAdminLogin,
  branding = {},
}) {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPin, setCustomerPin] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({ login: "", password: "" });
  const [adminError, setAdminError] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  const slogan =
    branding.welcomePhrase?.trim() ||
    "Programa de fidelidade, operação e relacionamento em uma experiência só.";

  async function handleAdminSubmit(event) {
    event.preventDefault();
    setAdminError("");

    try {
      setAdminBusy(true);
      await onAdminLogin?.(adminForm);
    } catch (error) {
      setAdminError(error?.message || "Não foi possível entrar no painel.");
    } finally {
      setAdminBusy(false);
    }
  }

  function handleBackToCustomer() {
    setShowAdminLogin(false);
    setAdminError("");
    setAdminForm({ login: "", password: "" });
  }

  return (
    <main className="accesshub-page">
      <div className="accesshub-shell">
        <section className="accesshub-login-card">
          <div className="accesshub-login-head">
            <img
              src={brandLogo}
              alt={`Logo ${branding.softwareName || "Voltta"}`}
              className="accesshub-logo"
            />
          </div>

          {!showAdminLogin ? (
            <>
              <div className="accesshub-heading">
                <p className="accesshub-eyebrow">Área do cliente</p>
                <h1>Entrar</h1>
                <p className="accesshub-subtitle">
                  Acesse seus pontos, cupons e benefícios em poucos segundos.
                </p>
              </div>

              <div className="accesshub-form">
                <label className="accesshub-field">
                  <span>Telefone</span>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="(00) 12345-6789"
                  />
                </label>

                <label className="accesshub-field">
                  <span>PIN</span>
                  <input
                    type="password"
                    value={customerPin}
                    onChange={(event) => setCustomerPin(event.target.value)}
                    placeholder="Seu PIN"
                  />
                </label>

                <div className="accesshub-actions">
                  <button
                    type="button"
                    className="accesshub-button accesshub-button--primary"
                    onClick={() =>
                      onCustomerEnter?.({
                        phone: customerPhone,
                        pin: customerPin,
                      })
                    }
                  >
                    Entrar na área do cliente
                  </button>

                  <button
                    type="button"
                    className="accesshub-button accesshub-button--secondary"
                  >
                    Recuperar acesso
                  </button>
                </div>
              </div>

              <div className="accesshub-divider" />

              <div className="accesshub-store-entry">
                <p className="accesshub-store-label">Painel da loja</p>

                <button
                  type="button"
                  className="accesshub-button accesshub-button--ghost"
                  onClick={() => {
                    setShowAdminLogin(true);
                    setAdminError("");
                  }}
                >
                  Entrar no painel da loja
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="accesshub-heading">
                <p className="accesshub-eyebrow">Painel da loja</p>
                <h1>Login da equipe</h1>
                <p className="accesshub-subtitle">
                  Entre com seu login e senha para acessar a operação interna.
                </p>
              </div>

              <form className="accesshub-form" onSubmit={handleAdminSubmit}>
                <label className="accesshub-field">
                  <span>Login</span>
                  <input
                    type="text"
                    value={adminForm.login}
                    onChange={(event) =>
                      setAdminForm((prev) => ({
                        ...prev,
                        login: event.target.value,
                      }))
                    }
                    placeholder="Seu login"
                  />
                </label>

                <label className="accesshub-field">
                  <span>Senha</span>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(event) =>
                      setAdminForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Sua senha"
                  />
                </label>

                {adminError ? (
                  <div className="accesshub-error">{adminError}</div>
                ) : null}

                <div className="accesshub-actions">
                  <button
                    type="submit"
                    disabled={adminBusy}
                    className="accesshub-button accesshub-button--primary"
                  >
                    {adminBusy ? "Entrando..." : "Entrar no painel"}
                  </button>

                  <button
                    type="button"
                    className="accesshub-button accesshub-button--secondary"
                    onClick={handleBackToCustomer}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </>
          )}
        </section>

        <aside className="accesshub-hero-card">
          <div className="accesshub-hero-inner">
            <p className="accesshub-hero-eyebrow">
              {branding.softwareName || "Voltta"}
            </p>

            <h2 className="accesshub-hero-title">{slogan}</h2>

            <p className="accesshub-hero-text">
              Fidelidade simples para cliente e loja.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}