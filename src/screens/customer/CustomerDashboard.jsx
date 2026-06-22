import "./CustomerDashboard.css";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CustomerDashboard({
  customer,
  branding = {},
  progress = 0,
  onBack,
  onCheckin,
  whatsappLink = "",
}) {
  const spendGoal = Number(customer?.nextRewardAt || 250);
  const totalSpent = Number(customer?.totalSpent || 0);
  const remainingToGoal = Math.max(spendGoal - totalSpent, 0);

  const activeCoupons = Array.isArray(customer?.coupons)
    ? customer.coupons.filter((coupon) => coupon.active)
    : [];

  const promotions = Array.isArray(customer?.promotions)
    ? customer.promotions
    : [];

  const history = Array.isArray(customer?.history) ? customer.history : [];

  const companyName = branding?.companyName?.trim() || "Minha Loja";
  const welcomePhrase =
    branding?.welcomePhrase?.trim() || "Seu clube de benefícios da loja.";
  const instagramUrl = branding?.instagramUrl?.trim() || "";
  const progressValue = Math.max(0, Math.min(Number(progress || 0), 100));
  const customerInitial = (companyName || "L").slice(0, 1).toUpperCase();
  const customerName = customer?.name?.split(" ")[0] || "cliente";

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <header className="customer-header">
          <div className="customer-header__top">
            <button type="button" className="customer-top-btn" onClick={onBack}>
              Voltar
            </button>
          </div>

          <div className="customer-brand-banner">
            <div className="customer-brand-banner__logo">
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={companyName || "Logo da loja"}
                />
              ) : (
                <div className="customer-brand-banner__fallback">
                  {customerInitial}
                </div>
              )}
            </div>

            <div className="customer-brand-banner__copy">
              <span>Clube da loja</span>
              <h1>{companyName}</h1>
              <p>{welcomePhrase}</p>
            </div>
          </div>
        </header>

        <main className="customer-main">
          <section className="customer-hero">
            <span className="customer-chip">Olá, {customerName}.</span>

            <h2>Seus pontos e recompensas</h2>
            <p>
              Você acompanha aqui seus pontos, cupons, promoções e o quanto
              falta para alcançar sua próxima recompensa.
            </p>

            <div className="customer-hero__stats">
              <div className="customer-stat customer-stat--primary">
                <small>Pontos disponíveis</small>
                <strong>{Number(customer?.points || 0)}</strong>
              </div>

              <div className="customer-stat">
                <small>Total consumido</small>
                <strong>{formatCurrency(totalSpent)}</strong>
              </div>

              <div className="customer-stat">
                <small>Visitas registradas</small>
                <strong>{Number(customer?.visits || 0)}</strong>
              </div>
            </div>
          </section>

          <section className="customer-card customer-card--highlight">
            <div className="customer-card__header">
              <div>
                <h3>Progresso para a próxima recompensa</h3>
                <p>
                  Faltam {formatCurrency(remainingToGoal)} em compras para
                  atingir a meta de {formatCurrency(spendGoal)}.
                </p>
              </div>

              <div className="customer-inline-value">
                {Math.round(progressValue)}%
              </div>
            </div>

            <div className="customer-progress">
              <div style={{ width: `${progressValue}%` }} />
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__header">
              <div>
                <h3>Ofertas e destaques</h3>
                <p>Veja campanhas e promoções disponíveis na loja.</p>
              </div>
            </div>

            <div className="customer-list">
              {promotions.length === 0 ? (
                <div className="customer-list-item">
                  Nenhuma promoção disponível no momento.
                </div>
              ) : (
                promotions.map((promo, index) => (
                  <div
                    key={`${String(promo)}-${index}`}
                    className="customer-list-item customer-list-item--promo"
                  >
                    <strong>Campanha {index + 1}</strong>
                    <p>{promo}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__header">
              <div>
                <h3>Cupons ativos</h3>
                <p>Use seus benefícios nas próximas compras.</p>
              </div>
            </div>

            <div className="customer-list">
              {activeCoupons.length === 0 ? (
                <div className="customer-list-item">
                  Você ainda não tem cupons ativos no momento.
                </div>
              ) : (
                activeCoupons.map((coupon) => (
                  <div key={coupon.id} className="customer-coupon">
                    <div>
                      <strong>{coupon.title}</strong>
                      <p>Código: {coupon.code}</p>
                    </div>

                    <span>{coupon.percent}% OFF</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__header">
              <div>
                <h3>Histórico recente</h3>
                <p>Suas compras e visitas mais recentes aparecem aqui.</p>
              </div>
            </div>

            <div className="customer-list">
              {history.length === 0 ? (
                <div className="customer-list-item">
                  Suas visitas vão aparecer aqui depois da primeira compra.
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="customer-history-item">
                    <div>
                      <strong>{item.product}</strong>
                      <p>{new Date(item.date).toLocaleDateString("pt-BR")}</p>
                    </div>

                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="customer-card customer-card--checkin">
            <div className="customer-card__header">
              <div>
                <h3>Check-in premiado</h3>
                <p>
                  Poste um story com a marca da loja e solicite seu benefício de
                  check-in.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="customer-primary-btn"
              onClick={onCheckin}
            >
              Solicitar check-in
            </button>

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="customer-link-btn"
              >
                Falar com a loja no WhatsApp
              </a>
            ) : null}

            {instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="customer-link-btn"
              >
                Ver Instagram da loja
              </a>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}