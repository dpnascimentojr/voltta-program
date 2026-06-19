import "./AccessHubScreen.css";
import logoFallback from "../../assets/logo.png";

export default function AccessHubScreen({
  onCustomerEnter,
  onEmployeeEnter,
  branding,
  whatsappLink,
}) {
  const logoSrc = branding?.logoUrl || logoFallback;
  const hasInstagram = !!branding?.instagramUrl;
  const hasWhatsapp = !!whatsappLink;

  return (
    <div className="access-page">
      <div className="access-shell">
        <section className="access-hero">
          <div className="access-brand">
            <div className="access-brand__mark">
              <img src={logoSrc} alt={`Logo ${branding.companyName}`} />
            </div>

            <div className="access-brand__copy">
              <span className="access-eyebrow">{branding.softwareName}</span>
              <h1>{branding.companyName}</h1>
              <p>{branding.welcomePhrase}</p>
            </div>
          </div>

          <div className="access-actions-inline">
            {hasInstagram && (
              <a
                href={branding.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="access-link-chip"
              >
                Instagram
              </a>
            )}

            {hasWhatsapp && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="access-link-chip"
              >
                WhatsApp
              </a>
            )}
          </div>
        </section>

        <section className="access-actions">
          <article className="access-card">
            <span className="access-card__badge">Cliente</span>
            <h2>Entrar</h2>
            <p>Consulte pontos, cupons e promoções.</p>
            <button type="button" className="access-btn access-btn--primary" onClick={onCustomerEnter}>
              Acessar área do cliente
            </button>
          </article>

          <article className="access-card">
            <span className="access-card__badge">Equipe</span>
            <h2>Painel</h2>
            <p>Gerencie loja, clientes e fidelidade.</p>
            <button type="button" className="access-btn access-btn--secondary" onClick={onEmployeeEnter}>
              Acessar painel
            </button>
          </article>
        </section>
      </div>
    </div>
  );
}