import "./CustomerDashboard.css";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CustomerDashboard({
  customer,
  progress = 0,
  branding = {},
  onBack,
  onCheckin,
  whatsappLink = "",
}) {
  const safeCustomer = customer || {};
  const firstName = safeCustomer?.name?.split(" ")[0] || "cliente";
  const spendGoal = Number(safeCustomer?.nextRewardAt || 250);
  const totalSpent = Number(safeCustomer?.totalSpent || 0);
  const remainingToGoal = Math.max(spendGoal - totalSpent, 0);

  const coupons = Array.isArray(safeCustomer?.coupons)
    ? safeCustomer.coupons.filter((coupon) => coupon?.active)
    : [];

  const promotions = Array.isArray(safeCustomer?.promotions)
    ? safeCustomer.promotions
    : [];

  const history = Array.isArray(safeCustomer?.history) ? safeCustomer.history : [];

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <header className="customer-header">
          <div className="customer-header__top">
            <button type="button" className="customer-top-btn" onClick={onBack}>
              Voltar
            </button>

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="customer-top-btn customer-top-btn--ghost"
              >
                WhatsApp
              </a>
            ) : (
              <span className="customer-top-btn customer-top-btn--disabled">
                Área do cliente
              </span>
            )}
          </div>

          <div className="customer-brand">
            {branding?.logoUrl ? (
              <div className="customer-brand__mark">
                <img
                  src={branding.logoUrl}
                  alt={branding?.softwareName || branding?.companyName || "Logo"}
                />
              </div>
            ) : (
              <div className="customer-brand__mark customer-brand__mark--fallback">
                {(branding?.softwareName || branding?.companyName || "V")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
            )}

            <div className="customer-brand__copy">
              <span>{branding?.companyName || "Sua loja"}</span>
              <h1>{branding?.softwareName || "Voltta"}</h1>
              <p>
                {branding?.welcomePhrase ||
                  "Fidelidade simples para cliente e loja."}
              </p>
            </div>
          </div>
        </header>

        <main className="customer-main">
          <section className="customer-hero">
            <span className="customer-chip">
              {safeCustomer?.tier || "Bronze"}
            </span>

            <h2>Olá, {firstName}.</h2>

            <p>
              Você acompanha aqui seus pontos, cupons, promoções e o quanto
              falta para alcançar sua próxima recompensa.
            </p>

            <div className="customer-hero__stats">
              <article className="customer-stat customer-stat--primary">
                <small>Pontos disponíveis</small>
                <strong>{Number(safeCustomer?.points || 0)}</strong>
              </article>

              <article className="customer-stat">
                <small>Visitas</small>
                <strong>{Number(safeCustomer?.visits || 0)}</strong>
              </article>

              <article className="customer-stat">
                <small>Total em compras</small>
                <strong>{formatCurrency(totalSpent)}</strong>
              </article>
            </div>
          </section>

          <section className="customer-card customer-card--highlight">
            <div className="customer-card__header">
              <div>
                <h3>Próxima recompensa</h3>
                <p>
                  Faltam {formatCurrency(remainingToGoal)} em compras para
                  atingir a meta de {formatCurrency(spendGoal)}.
                </p>
              </div>

              <strong className="customer-inline-value">
                {Math.round(progress)}%
              </strong>
            </div>

            <div className="customer-progress">
              <div style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__header">
              <div>
                <h3>Ofertas e destaques</h3>
                <p>Campanhas e mensagens da loja para você acompanhar.</p>
              </div>
            </div>

            <div className="customer-list">
              {promotions.length === 0 ? (
                <div className="customer-list-item">
                  Nenhuma promoção ativa no momento.
                </div>
              ) : (
                promotions.map((promo, index) => (
                  <div
                    key={`${promo}-${index}`}
                    className="customer-list-item customer-list-item--promo"
                  >
                    {promo}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__header">
              <div>
                <h3>Cupons ativos</h3>
                <p>Seus benefícios liberados para usar nos próximos pedidos.</p>
              </div>
            </div>

            <div className="customer-list">
              {coupons.length === 0 ? (
                <div className="customer-list-item">
                  Você ainda não tem cupons ativos no momento.
                </div>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="customer-coupon">
                    <div>
                      <strong>{coupon.title}</strong>
                      <p>Código: {coupon.code}</p>
                    </div>

                    <span>{Number(coupon.percent || 0)}% OFF</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-card__header">
              <div>
                <h3>Histórico recente</h3>
                <p>Resumo das últimas compras registradas no seu perfil.</p>
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
                      <p>
                        {new Date(item.date).toLocaleDateString("pt-BR")} ·{" "}
                        {formatCurrency(item.amount)}
                      </p>
                    </div>

                    <span>Compra registrada</span>
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
                Falar com a loja
              </a>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}