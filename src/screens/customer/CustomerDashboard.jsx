import "./CustomerDashboard.css";
import logoFallback from "../../assets/logo.png";

export default function CustomerDashboard({
  customer,
  progress,
  onBack,
  onCheckin,
  onLogout,
  branding,
  whatsappLink,
}) {
  const activeCoupons = (customer.coupons || []).filter((coupon) => coupon.active);
  const logoSrc = branding?.logoUrl || logoFallback;

  return (
    <div className="customer-page">
      <div className="customer-phone">
        <header className="customer-header">
          <div className="customer-top-actions">
            <button type="button" className="customer-back" onClick={onBack}>
              ← Voltar
            </button>
            <button type="button" className="customer-logout" onClick={onLogout}>
              Sair
            </button>
          </div>

          <div className="customer-brand">
            <img src={logoSrc} alt={`Logo ${branding.companyName}`} />
            <div>
              <h1>{branding.companyName}</h1>
              <p>{branding.softwareName}</p>
            </div>
          </div>
        </header>

        <main className="customer-content">
          <section className="customer-hero">
            <span className="customer-chip">{customer.tier}</span>
            <h2>{customer.name}</h2>
            <p>{customer.phone}</p>
          </section>

          <section className="customer-card">
            <div className="customer-card__row">
              <strong>Pontos</strong>
              <strong>{customer.points || 0}</strong>
            </div>

            <p>
              Faltam{" "}
              <strong>
                {Math.max((customer.nextRewardAt || 250) - (customer.points || 0), 0)}
              </strong>{" "}
              pontos para a próxima meta.
            </p>

            <div className="customer-progress">
              <div style={{ width: `${progress}%` }} />
            </div>
          </section>

          <section className="customer-card customer-card--highlight">
            <h3>Promoções</h3>
            <div className="customer-list">
              {(customer.promotions || []).length === 0 && (
                <div className="customer-list-item">Nenhuma promoção no momento.</div>
              )}

              {(customer.promotions || []).map((promo, index) => (
                <div key={`${promo}-${index}`} className="customer-list-item">
                  {promo}
                </div>
              ))}
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__row">
              <h3>Cupons</h3>
              <span>{activeCoupons.length}</span>
            </div>

            <div className="customer-list">
              {activeCoupons.length === 0 && (
                <div className="customer-list-item">Nenhum cupom ativo.</div>
              )}

              {activeCoupons.map((coupon) => (
                <div key={coupon.id} className="customer-coupon">
                  <strong>{coupon.title}</strong>
                  <span>{coupon.code}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__row">
              <h3>Check-in</h3>
              <span>{customer.visits || 0} visitas</span>
            </div>

            <p>Ganhe pontos e um novo cupom.</p>

            <button type="button" className="customer-primary-btn" onClick={onCheckin}>
              Fazer check-in
            </button>
          </section>

          {whatsappLink && (
            <section className="customer-card">
              <div className="customer-card__row">
                <h3>Contato</h3>
                <span>Loja</span>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="customer-link-btn"
              >
                Falar no WhatsApp
              </a>
            </section>
          )}

          <section className="customer-card">
            <div className="customer-card__row">
              <h3>Histórico</h3>
              <span>{customer.history?.length || 0}</span>
            </div>

            <div className="customer-list">
              {(customer.history || []).length === 0 && (
                <div className="customer-list-item">Nenhuma compra registrada.</div>
              )}

              {(customer.history || []).slice(0, 5).map((item) => (
                <div key={item.id} className="customer-history-item">
                  <strong>{item.product}</strong>
                  <span>R$ {Number(item.amount || 0).toFixed(2).replace(".", ",")}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}