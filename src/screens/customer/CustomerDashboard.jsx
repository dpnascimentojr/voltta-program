import { useMemo, useState } from "react";
import { ArrowLeft, Camera, Gift, LogOut, Sparkles, Ticket, Trophy } from "lucide-react";

export default function CustomerDashboard({
  customer,
  promos = [],
  branding,
  settings,
  onBack,
  onLogout,
  onCheckin,
  recoveryWhatsappLink,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeCoupons = useMemo(
    () => (customer?.coupons || []).filter((coupon) => coupon.active),
    [customer]
  );

  const spendGoal = Number(settings?.spendGoal || 250);
  const remainingToGoal = Math.max(spendGoal - Number(customer?.totalSpent || 0), 0);
  const safePromos = promos.length
    ? promos
    : [
        {
          id: "fallback-1",
          title: "Promoção da semana",
          type: "Destaque",
          description: "Acompanhe novidades e benefícios exclusivos no seu painel.",
          image:
            "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
        },
      ];

  const promo = safePromos[currentSlide] || safePromos[0];

  function goNext() {
    setCurrentSlide((prev) => (prev + 1) % safePromos.length);
  }

  function goPrev() {
    setCurrentSlide((prev) => (prev - 1 + safePromos.length) % safePromos.length);
  }

  return (
    <div style={styles.page}>
      <header style={styles.topbar}>
        <button type="button" style={styles.iconButton} onClick={onBack}>
          <ArrowLeft size={18} />
        </button>

        <div style={styles.topbarBrand}>
          <p style={styles.eyebrow}>{branding?.softwareName || "Voltta"}</p>
          <strong style={styles.topbarTitle}>{branding?.companyName || "Sua loja"}</strong>
        </div>

        <button type="button" style={styles.exitButton} onClick={onLogout}>
          <LogOut size={16} />
          Sair
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroTextBlock}>
            <span style={styles.heroBadge}>Clube do cliente</span>
            <h1 style={styles.heroTitle}>Olá, {customer?.name?.split(" ")[0] || "cliente"}.</h1>
            <p style={styles.heroText}>
              Você acompanha aqui seus pontos, cupons, promoções e o quanto falta para alcançar
              sua próxima recompensa.
            </p>
          </div>

          <div style={styles.scoreCard}>
            <div style={styles.scoreTop}>
              <span style={styles.scoreLabel}>Pontos atuais</span>
              <Sparkles size={18} color="#ffd66b" />
            </div>
            <strong style={styles.scoreValue}>{Number(customer?.points || 0)}</strong>
            <p style={styles.scoreHelper}>
              Faltam {remainingToGoal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}{" "}
              em compras para atingir a meta de {spendGoal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.
            </p>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(Number(customer?.progress || 0), 100)}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section style={styles.promoSection}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionEyebrow}>Vitrine promocional</p>
              <h2 style={styles.sectionTitle}>Ofertas e destaques</h2>
            </div>

            {safePromos.length > 1 ? (
              <div style={styles.carouselControls}>
                <button type="button" style={styles.smallControl} onClick={goPrev}>
                  Anterior
                </button>
                <button type="button" style={styles.smallControl} onClick={goNext}>
                  Próximo
                </button>
              </div>
            ) : null}
          </div>

          <div
            style={{
              ...styles.promoBanner,
              backgroundImage: `linear-gradient(135deg, rgba(47,28,70,0.66), rgba(111,60,195,0.42)), url(${promo.image})`,
            }}
          >
            <div style={styles.promoOverlay}>
              <span style={styles.promoType}>{promo.type || "Promoção"}</span>
              <h3 style={styles.promoTitle}>{promo.title}</h3>
              <p style={styles.promoDescription}>{promo.description}</p>
            </div>
          </div>

          {safePromos.length > 1 ? (
            <div style={styles.dots}>
              {safePromos.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    ...styles.dot,
                    ...(currentSlide === index ? styles.dotActive : {}),
                  }}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardIcon}><Gift size={18} /></div>
              <h3 style={styles.cardTitle}>Resumo da conta</h3>
            </div>

            <div style={styles.dataRows}>
              <Row label="Telefone" value={customer?.phone || "-"} />
              <Row label="E-mail" value={customer?.email || "-"} />
              <Row label="Nível" value={customer?.tier || "Bronze"} />
              <Row label="Visitas" value={customer?.visits || 0} />
            </div>
          </article>

          <article style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardIcon}><Ticket size={18} /></div>
              <h3 style={styles.cardTitle}>Cupons ativos</h3>
            </div>

            {!activeCoupons.length ? (
              <p style={styles.emptyText}>Você ainda não tem cupons ativos no momento.</p>
            ) : (
              <div style={styles.couponList}>
                {activeCoupons.map((coupon) => (
                  <div key={coupon.id} style={styles.couponCard}>
                    <div>
                      <strong style={styles.couponTitle}>{coupon.title}</strong>
                      <p style={styles.couponCode}>Código: {coupon.code}</p>
                    </div>
                    <span style={styles.couponPercent}>{coupon.percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardIcon}><Trophy size={18} /></div>
              <h3 style={styles.cardTitle}>Histórico recente</h3>
            </div>

            {!customer?.history?.length ? (
              <p style={styles.emptyText}>Suas visitas vão aparecer aqui depois da primeira compra.</p>
            ) : (
              <div style={styles.historyList}>
                {customer.history.slice(0, 4).map((item) => (
                  <div key={item.id} style={styles.historyItem}>
                    <div>
                      <strong style={styles.historyProduct}>{item.product}</strong>
                      <p style={styles.historyDate}>
                        {new Date(item.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span style={styles.historyAmount}>
                      {Number(item.amount || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardIcon}><Camera size={18} /></div>
              <h3 style={styles.cardTitle}>Check-in premiado</h3>
            </div>

            <p style={styles.cardText}>
              Poste um story com a marca da loja e solicite seu benefício de check-in.
            </p>

            <div style={styles.cardActions}>
              <button type="button" style={styles.primaryAction} onClick={onCheckin}>
                Solicitar check-in
              </button>

              {recoveryWhatsappLink ? (
                <a
                  href={recoveryWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.secondaryAction}
                >
                  Falar com a loja
                </a>
              ) : null}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <strong style={styles.rowValue}>{String(value)}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 18,
    color: "#2f2340",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    maxWidth: 1180,
    margin: "0 auto 18px",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid #eadff7",
    background: "#fff",
    color: "#2f2340",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  topbarBrand: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    margin: 0,
    color: "#8b76aa",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  topbarTitle: {
    display: "block",
    marginTop: 4,
    fontSize: 18,
  },
  exitButton: {
    border: "1px solid #eadff7",
    background: "#fff",
    color: "#2f2340",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  main: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gap: 18,
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 18,
  },
  heroTextBlock: {
    background: "linear-gradient(135deg, #fff 0%, #fbf8ff 100%)",
    border: "1px solid #eadff7",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 18px 44px rgba(90, 54, 119, 0.08)",
  },
  heroBadge: {
    display: "inline-flex",
    padding: "8px 12px",
    background: "#f1e9fb",
    color: "#5f349f",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 12,
  },
  heroTitle: {
    margin: "18px 0 10px",
    fontSize: "clamp(2rem, 4vw, 3.6rem)",
    lineHeight: 1.02,
  },
  heroText: {
    margin: 0,
    maxWidth: "42ch",
    color: "#6f6480",
    lineHeight: 1.7,
  },
  scoreCard: {
    background: "linear-gradient(135deg, #3a214f 0%, #6f3cc3 100%)",
    color: "#fff",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 22px 54px rgba(78, 45, 114, 0.20)",
  },
  scoreTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: 700,
  },
  scoreValue: {
    display: "block",
    marginTop: 14,
    fontSize: 44,
    lineHeight: 1,
  },
  scoreHelper: {
    margin: "14px 0 0",
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.7,
    fontSize: 14,
  },
  progressTrack: {
    marginTop: 18,
    width: "100%",
    height: 12,
    borderRadius: 999,
    background: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #ffd66b 0%, #fff0a9 100%)",
  },
  promoSection: {
    background: "#fff",
    borderRadius: 28,
    border: "1px solid #eadff7",
    padding: 24,
    boxShadow: "0 18px 44px rgba(90, 54, 119, 0.08)",
    display: "grid",
    gap: 16,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionEyebrow: {
    margin: 0,
    color: "#8b76aa",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "4px 0 0",
    fontSize: 26,
  },
  carouselControls: {
    display: "flex",
    gap: 8,
  },
  smallControl: {
    border: "1px solid #eadff7",
    background: "#fbf8ff",
    color: "#35244f",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  promoBanner: {
    minHeight: 280,
    borderRadius: 24,
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "flex-end",
  },
  promoOverlay: {
    width: "100%",
    padding: 24,
    background: "linear-gradient(180deg, rgba(24,14,36,0) 0%, rgba(24,14,36,0.82) 100%)",
    color: "#fff",
  },
  promoType: {
    display: "inline-flex",
    padding: "8px 12px",
    background: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 12,
  },
  promoTitle: {
    margin: "14px 0 8px",
    fontSize: 28,
  },
  promoDescription: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.7,
    maxWidth: "56ch",
  },
  dots: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    border: 0,
    background: "#d9c9ef",
    cursor: "pointer",
  },
  dotActive: {
    width: 28,
    background: "#6f3cc3",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    border: "1px solid #eadff7",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 18px 44px rgba(90, 54, 119, 0.08)",
    display: "grid",
    gap: 16,
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: "#f2eafb",
    color: "#5b3198",
    display: "grid",
    placeItems: "center",
  },
  cardTitle: {
    margin: 0,
    fontSize: 20,
  },
  cardText: {
    margin: 0,
    color: "#6f6480",
    lineHeight: 1.7,
  },
  dataRows: {
    display: "grid",
    gap: 12,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 10,
    borderBottom: "1px solid #f1ebf8",
  },
  rowLabel: {
    color: "#7e708f",
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    textAlign: "right",
  },
  emptyText: {
    margin: 0,
    color: "#7d6f8d",
    lineHeight: 1.7,
  },
  couponList: {
    display: "grid",
    gap: 12,
  },
  couponCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    background: "#faf7fe",
    border: "1px solid #eadff7",
    borderRadius: 18,
    padding: 14,
  },
  couponTitle: {
    display: "block",
    fontSize: 15,
  },
  couponCode: {
    margin: "6px 0 0",
    color: "#7f708d",
    fontSize: 13,
  },
  couponPercent: {
    background: "#6f3cc3",
    color: "#fff",
    borderRadius: 999,
    padding: "8px 10px",
    fontWeight: 800,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  historyList: {
    display: "grid",
    gap: 12,
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    paddingBottom: 10,
    borderBottom: "1px solid #f1ebf8",
  },
  historyProduct: {
    display: "block",
    fontSize: 15,
  },
  historyDate: {
    margin: "6px 0 0",
    color: "#7f708d",
    fontSize: 13,
  },
  historyAmount: {
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  cardActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryAction: {
    border: 0,
    borderRadius: 14,
    padding: "13px 16px",
    background: "linear-gradient(135deg, #6f3cc3 0%, #532d92 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #eadff7",
    borderRadius: 14,
    padding: "13px 16px",
    background: "#faf7fe",
    color: "#35244f",
    fontWeight: 800,
    textDecoration: "none",
  },
};