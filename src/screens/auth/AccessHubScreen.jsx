import { useMemo, useState } from "react";
import brandLogo from "../../assets/logo.png";
import "./AccessHubScreen-2.css";

export default function AccessHubScreen({
  onCustomerEnter,
  onAdminLogin,
  branding = {},
}) {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPin, setCustomerPin] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    login: "",
    password: "",
  });
  const [adminError, setAdminError] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  const softwareName = useMemo(
    () => branding.softwareName?.trim() || "Voltta",
    [branding.softwareName]
  );

  const companyName = useMemo(
    () => branding.companyName?.trim() || "Sua loja",
    [branding.companyName]
  );

  const slogan = useMemo(
    () =>
      branding.welcomePhrase?.trim() || "Voltta — fidelidade que gira negócio.",
    [branding.welcomePhrase]
  );

  const customerHelper = useMemo(() => {
    if (companyName && companyName !== softwareName) {
      return `Acesse seus pontos, cupons e benefícios da ${companyName}.`;
    }
    return "Acesse seus pontos, cupons e benefícios em poucos segundos.";
  }, [companyName, softwareName]);

  function handleCustomerSubmit(event) {
    event.preventDefault();
    onCustomerEnter?.({
      phone: customerPhone,
      pin: customerPin,
    });
  }

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

  function handleOpenAdminLogin() {
    setShowAdminLogin(true);
    setAdminError("");
  }

  function handleBackToCustomer() {
    setShowAdminLogin(false);
    setAdminError("");
    setAdminForm({ login: "", password: "" });
  }

  return (
    <div className="accesshub-page">
      <div className="accesshub-shell">
        <section className="accesshub-login-card">
          <div className="accesshub-login-head">
            <img
              src={brandLogo}
              alt={`Logo ${softwareName}`}
              className="accesshub-logo"
            />
          </div>

          {!showAdminLogin ? (
            <>
              <div className="accesshub-heading">
                <p className="accesshub-eyebrow">Área do cliente</p>
                <h1>Entrar</h1>
                <p className="accesshub-subtitle">{customerHelper}</p>
              </div>

              <form className="accesshub-form" onSubmit={handleCustomerSubmit}>
                <label className="accesshub-field">
                  <span>Telefone</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="(00) 12345-6789"
                  />
                </label>

                <label className="accesshub-field">
                  <span>PIN</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    value={customerPin}
                    onChange={(event) => setCustomerPin(event.target.value)}
                    placeholder="Seu PIN"
                  />
                </label>

                <div className="accesshub-actions">
                  <button
                    type="submit"
                    className="accesshub-button accesshub-button--primary"
                  >
                    Entrar na área do cliente
                  </button>

                  <button
                    type="button"
                    className="accesshub-text-button"
                  >
                    Recuperar acesso
                  </button>
                </div>
              </form>

              <div className="accesshub-divider" />

              <div className="accesshub-store-entry">
                <p className="accesshub-store-label">Painel da loja</p>
                <button
                  type="button"
                  className="accesshub-button accesshub-button--secondary"
                  onClick={handleOpenAdminLogin}
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
                  Acesso interno para operação, cadastro e acompanhamento.
                </p>
              </div>

              <form className="accesshub-form" onSubmit={handleAdminSubmit}>
                <label className="accesshub-field">
                  <span>Login</span>
                  <input
                    type="text"
                    autoComplete="username"
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
                    autoComplete="current-password"
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
                    className="accesshub-button accesshub-button--primary"
                    disabled={adminBusy}
                  >
                    {adminBusy ? "Entrando..." : "Entrar no painel"}
                  </button>

                  <button
                    type="button"
                    className="accesshub-button accesshub-button--ghost"
                    onClick={handleBackToCustomer}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </>
          )}
        </section>

        <section className="accesshub-hero-card">
          <div className="accesshub-hero-inner">
            <p className="accesshub-hero-eyebrow">{softwareName}</p>
            <h2 className="accesshub-hero-title">{slogan}</h2>
            <p className="accesshub-hero-text">
              Fidelidade simples para cliente e loja.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}