import { useEffect, useMemo, useState } from "react";

function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}

function formatPhone(value = "") {
  const digits = digitsOnly(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function useIsMobile(breakpoint = 860) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function AccessHubScreen({
  branding,
  customers = [],
  onCustomerLogin,
  onEmployeeEnter,
  whatsappLink,
}) {
  const isMobile = useIsMobile();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const matchedCustomer = useMemo(() => {
    const normalized = digitsOnly(phone);
    if (!normalized) return null;
    return customers.find((customer) => digitsOnly(customer.phone) === normalized) || null;
  }, [phone, customers]);

  function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: "", text: "" });

    try {
      onCustomerLogin({ phone, pin });
    } catch (error) {
      setNotice({
        type: "error",
        text: error?.message || "Não foi possível entrar na conta.",
      });
    }
  }

  const emailRecovery = matchedCustomer?.email
    ? `mailto:${matchedCustomer.email}?subject=${encodeURIComponent("Recuperação de acesso - app Savana")}`
    : "";

  return (
    <div style={styles.page(isMobile)}>
      <div style={styles.content(isMobile)}>
        <section style={styles.heroCard(isMobile)}>
          <div style={styles.brandBadge}>{branding?.softwareName || "Voltta"}</div>

          <div>
            <h1 style={styles.heroTitle(isMobile)}>
              Fidelidade elegante, prática e feita para voltar sempre.
            </h1>

            <p style={styles.heroText(isMobile)}>
              Entre com seu telefone e PIN para acompanhar pontos, cupons, promoções e benefícios da{" "}
              {branding?.companyName || "loja"}.
            </p>
          </div>

          <div style={styles.heroHighlights(isMobile)}>
            <Badge text="Promoções vivas" />
            <Badge text="Cupons ativos" />
            <Badge text="Check-in premiado" />
          </div>
        </section>

        <section style={styles.loginCard(isMobile)}>
          <div style={styles.cardHeader(isMobile)}>
            <div>
              <p style={styles.eyebrow}>Área do cliente</p>
              <h2 style={styles.cardTitle(isMobile)}>Entrar na sua conta</h2>
            </div>
          </div>

          {notice.text ? (
            <div
              style={{
                ...styles.notice,
                background: notice.type === "error" ? "#fff0f3" : "#edf8f1",
                color: notice.type === "error" ? "#be395d" : "#2f8f57",
                borderColor: notice.type === "error" ? "#f4ccd7" : "#cde7d7",
              }}
            >
              {notice.text}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.field}>
              <span style={styles.label}>Telefone</span>
              <input
                style={styles.input}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                inputMode="numeric"
                placeholder="(00) 12345-6789"
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>PIN</span>
              <input
                style={styles.input}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="Seu PIN"
              />
            </label>

            <button type="submit" style={styles.primaryButton}>
              Entrar na área do cliente
            </button>
          </form>

          <div style={styles.recoveryBox}>
            <button
              type="button"
              style={styles.linkButton}
              onClick={() => setShowRecovery((prev) => !prev)}
            >
              Recuperar acesso
            </button>

            {showRecovery ? (
              <div style={styles.recoveryPanel(isMobile)}>
                <p style={styles.recoveryText}>
                  Digite seu telefone acima para localizar sua conta e escolher a melhor forma de
                  recuperação.
                </p>

                <div style={styles.recoveryActions(isMobile)}>
                  <a
                    href={whatsappLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.secondaryAction(isMobile)}
                  >
                    Recuperar por WhatsApp
                  </a>

                  <a
                    href={emailRecovery || "#"}
                    style={{
                      ...styles.secondaryAction(isMobile),
                      opacity: emailRecovery ? 1 : 0.48,
                      pointerEvents: emailRecovery ? "auto" : "none",
                    }}
                  >
                    Recuperar por e-mail
                  </a>
                </div>

                {matchedCustomer?.email ? (
                  <p style={styles.helperText}>
                    Conta encontrada com e-mail vinculado: {matchedCustomer.email}
                  </p>
                ) : (
                  <p style={styles.helperText}>
                    Se não houver e-mail cadastrado, use o WhatsApp da loja para recuperar.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div style={styles.divider} />

          <button type="button" style={styles.employeeButton} onClick={onEmployeeEnter}>
            Entrar no painel da loja
          </button>
        </section>
      </div>
    </div>
  );
}

function Badge({ text }) {
  return <span style={styles.badge}>{text}</span>;
}

const styles = {
  page: (isMobile) => ({
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: isMobile ? 14 : 24,
  }),

  content: (isMobile) => ({
    width: "100%",
    maxWidth: 1160,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.08fr 0.92fr",
    gap: isMobile ? 14 : 24,
    alignItems: "stretch",
  }),

  heroCard: (isMobile) => ({
    background: "linear-gradient(135deg, #3e255d 0%, #6f3cc3 100%)",
    color: "#fff",
    borderRadius: isMobile ? 24 : 32,
    padding: isMobile ? 22 : 34,
    boxShadow: "0 24px 64px rgba(86, 48, 124, 0.25)",
    display: "grid",
    alignContent: "space-between",
    minHeight: isMobile ? "auto" : 580,
    gap: isMobile ? 18 : 24,
  }),

  brandBadge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.14)",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  heroTitle: (isMobile) => ({
    margin: "8px 0 12px",
    fontSize: isMobile ? "2rem" : "clamp(2.4rem, 4vw, 4.6rem)",
    lineHeight: 1.02,
    maxWidth: isMobile ? "100%" : 12,
  }),

  heroText: (isMobile) => ({
    margin: 0,
    maxWidth: isMobile ? "100%" : "34ch",
    color: "rgba(255,255,255,0.88)",
    fontSize: isMobile ? 15 : 16,
    lineHeight: 1.7,
  }),

  heroHighlights: (isMobile) => ({
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: isMobile ? 2 : 28,
  }),

  badge: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#fff",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
  },

  loginCard: (isMobile) => ({
    background: "#fff",
    border: "1px solid #eadff7",
    borderRadius: isMobile ? 24 : 28,
    padding: isMobile ? 20 : 28,
    boxShadow: "0 20px 50px rgba(92, 63, 122, 0.10)",
    display: "grid",
    alignContent: "start",
    gap: 18,
  }),

  cardHeader: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
  }),

  eyebrow: {
    margin: 0,
    color: "#876ca8",
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: 800,
    letterSpacing: 1,
  },

  cardTitle: (isMobile) => ({
    margin: "6px 0 0",
    color: "#2f2340",
    fontSize: isMobile ? 24 : 28,
    lineHeight: 1.1,
  }),

  notice: {
    border: "1px solid",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 700,
    fontSize: 14,
  },

  form: {
    display: "grid",
    gap: 14,
  },

  field: {
    display: "grid",
    gap: 8,
  },

  label: {
    fontSize: 13,
    color: "#7b6d8d",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    border: "1px solid #eadff7",
    borderRadius: 16,
    background: "#fcfbfe",
    padding: "14px 16px",
    fontSize: 16,
    color: "#2f2340",
    outline: "none",
    minHeight: 52,
  },

  primaryButton: {
    border: 0,
    borderRadius: 16,
    padding: "15px 18px",
    background: "linear-gradient(135deg, #6f3cc3 0%, #532d92 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    minHeight: 52,
    width: "100%",
  },

  recoveryBox: {
    display: "grid",
    gap: 12,
  },

  linkButton: {
    border: 0,
    background: "transparent",
    color: "#6f3cc3",
    fontWeight: 800,
    padding: 0,
    textAlign: "left",
    cursor: "pointer",
  },

  recoveryPanel: (isMobile) => ({
    border: "1px solid #eadff7",
    background: "#faf7fe",
    borderRadius: isMobile ? 18 : 20,
    padding: isMobile ? 14 : 16,
    display: "grid",
    gap: 12,
  }),

  recoveryText: {
    margin: 0,
    color: "#6e627e",
    lineHeight: 1.6,
    fontSize: 14,
  },

  recoveryActions: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
    gap: 10,
  }),

  secondaryAction: (isMobile) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
    padding: isMobile ? "12px 14px" : "12px 16px",
    borderRadius: 14,
    background: "#fff",
    border: "1px solid #e4d6f4",
    color: "#3f2a60",
    fontWeight: 700,
    textDecoration: "none",
    textAlign: "center",
  }),

  helperText: {
    margin: 0,
    color: "#8a7d99",
    fontSize: 13,
    lineHeight: 1.6,
  },

  divider: {
    height: 1,
    background: "#efe7f8",
    margin: "6px 0 2px",
  },

  employeeButton: {
    border: "1px solid #eadff7",
    borderRadius: 16,
    padding: "14px 16px",
    background: "#fbf9fe",
    color: "#2f2340",
    fontWeight: 800,
    cursor: "pointer",
    minHeight: 52,
    width: "100%",
  },
};