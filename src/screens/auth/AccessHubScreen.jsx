import { useState } from "react";
import brandLogo from "../../assets/logo.png";
import "./AccessHubScreen.css";

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

  const softwareName = branding.softwareName?.trim() || "Voltta";
  const companyName = branding.companyName?.trim() || "Sua loja";
  const slogan =
    branding.welcomePhrase?.trim() || "Conecte clientes. Movimente sua marca.";
  const supportText = "Fidelidade simples para cliente e loja.";
  const instagramUrl = branding.instagramUrl?.trim();
  const whatsappNumber = branding.whatsappNumber?.trim();
  const whatsappMessage =
    branding.whatsappMessage?.trim() ||
    "Olá! Quero falar com a equipe da loja.";
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : "";

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

  function handleCustomerSubmit(event) {
    event.preventDefault();
    onCustomerEnter?.({
      phone: customerPhone,
      pin: customerPin,
    });
  }

  return (
    <div className="access-page">
      <div className="access-shell">
        <div className="access-grid">
          <section className="access-panel">
            <div className="access-panel__top">
              <div className="access-brand">
                <div className="access-brand__mark">
                  <img src={brandLogo} alt={`${softwareName} logo`} />
                </div>

                <div className="access-brand__copy">
                  <span className="access-eyebrow">{softwareName}</span>
                  <h1>Entrar</h1>
                  <p>{supportText}</p>
                </div>
              </div>

              <div className="access-switch" role="tablist" aria-label="Tipo de acesso">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!showAdminLogin}
                  className={`access-switch__button ${!showAdminLogin ? "is-active" : ""}`}
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminError("");
                  }}
                >
                  Área do cliente
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={showAdminLogin}
                  className={`access-switch__button ${showAdminLogin ? "is-active" : ""}`}
                  onClick={() => {
                    setShowAdminLogin(true);
                    setAdminError("");
                  }}
                >
                  Painel da loja
                </button>
              </div>
            </div>

            {!showAdminLogin ? (
              <div className="access-card">
                <span className="access-card__badge">Área do cliente</span>
                <h2>Acesse seu clube de pontos</h2>
                <p>
                  Consulte seus pontos, cupons, histórico e promoções da loja
                  em um só lugar.
                </p>

                <form className="access-form" onSubmit={handleCustomerSubmit}>
                  <div className="access-field">
                    <label htmlFor="customerPhone">Telefone</label>
                    <input
                      id="customerPhone"
                      type="tel"
                      placeholder="Digite seu telefone"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                    />
                  </div>

                  <div className="access-field">
                    <label htmlFor="customerPin">PIN</label>
                    <input
                      id="customerPin"
                      type="password"
                      placeholder="Digite seu PIN"
                      value={customerPin}
                      onChange={(event) => setCustomerPin(event.target.value)}
                    />
                  </div>

                  <div className="access-actions">
                    <button type="submit" className="access-btn access-btn--primary">
                      Entrar na área do cliente
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="access-card">
                <span className="access-card__badge">Login da equipe</span>
                <h2>Entrar no painel da loja</h2>
                <p>
                  Acompanhe clientes, pedidos, promoções, equipe e operação
                  interna em um painel único.
                </p>

                <form className="access-form" onSubmit={handleAdminSubmit}>
                  <div className="access-field">
                    <label htmlFor="adminLogin">Login</label>
                    <input
                      id="adminLogin"
                      type="text"
                      placeholder="Digite seu login"
                      value={adminForm.login}
                      onChange={(event) =>
                        setAdminForm((current) => ({
                          ...current,
                          login: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="access-field">
                    <label htmlFor="adminPassword">Senha</label>
                    <input
                      id="adminPassword"
                      type="password"
                      placeholder="Digite sua senha"
                      value={adminForm.password}
                      onChange={(event) =>
                        setAdminForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                    />
                  </div>

                  {adminError ? (
                    <div className="access-feedback access-feedback--error">
                      {adminError}
                    </div>
                  ) : null}

                  <div className="access-actions">
                    <button
                      type="submit"
                      className="access-btn access-btn--primary"
                      disabled={adminBusy}
                    >
                      {adminBusy ? "Entrando..." : "Entrar no painel da loja"}
                    </button>

                    <button
                      type="button"
                      className="access-btn access-btn--ghost"
                      onClick={() => {
                        setShowAdminLogin(false);
                        setAdminError("");
                      }}
                    >
                      Voltar para cliente
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          <aside className="access-hero">
            <div className="access-hero__content">
              <span className="access-hero__badge">{companyName}</span>
              <h2>{slogan}</h2>
              <p>
                Uma experiência de fidelidade elegante para quem compra e um
                painel claro para quem opera a loja.
              </p>
            </div>

            <div className="access-hero__footer">
              {(instagramUrl || whatsappUrl) && (
                <div className="access-inline-links">
                  {instagramUrl ? (
                    <a
                      className="access-link-chip"
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Instagram
                    </a>
                  ) : null}

                  {whatsappUrl ? (
                    <a
                      className="access-link-chip access-link-chip--success"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}