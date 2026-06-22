import { useState } from "react";

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

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <div style={styles.badge}>
            {branding.softwareName || "Clube Base"}
          </div>

          <h1 style={styles.heroTitle}>
            Fidelidade elegante, prática e feita para voltar sempre.
          </h1>

          <p style={styles.heroText}>
            Entre com seu telefone e PIN para acompanhar pontos, cupons,
            promoções e histórico. A loja acessa o painel por login interno.
          </p>

          <div style={styles.heroInfo}>
            <div style={styles.heroInfoItem}>
              <span style={styles.heroInfoLabel}>Loja</span>
              <strong style={styles.heroInfoValue}>
                {branding.companyName || "Minha Loja"}
              </strong>
            </div>

            <div style={styles.heroInfoItem}>
              <span style={styles.heroInfoLabel}>Experiência</span>
              <strong style={styles.heroInfoValue}>
                Cliente e operação no mesmo sistema
              </strong>
            </div>
          </div>
        </section>

        <section style={styles.formCard}>
          {!showAdminLogin ? (
            <>
              <p style={styles.eyebrow}>Área do cliente</p>
              <h2 style={styles.title}>Entrar na sua conta</h2>

              <div style={styles.formGrid}>
                <label style={styles.field}>
                  <span style={styles.label}>Telefone</span>
                  <input
                    style={styles.input}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(00) 12345-6789"
                  />
                </label>

                <label style={styles.field}>
                  <span style={styles.label}>PIN</span>
                  <input
                    style={styles.input}
                    value={customerPin}
                    onChange={(e) => setCustomerPin(e.target.value)}
                    placeholder="Seu PIN"
                    type="password"
                  />
                </label>

                <button type="button" style={styles.primaryButton} onClick={onCustomerEnter}>
                  Entrar na área do cliente
                </button>

                <button type="button" style={styles.linkButton}>
                  Recuperar acesso
                </button>

                <div style={styles.divider} />

                <button
                  type="button"
                  style={styles.secondaryButton}
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
              <p style={styles.eyebrow}>Painel da loja</p>
              <h2 style={styles.title}>Login da equipe</h2>
              <p style={styles.subtitle}>
                Use o login cadastrado no painel administrativo para acessar a operação.
              </p>

              <form onSubmit={handleAdminSubmit} style={styles.formGrid}>
                <label style={styles.field}>
                  <span style={styles.label}>Login</span>
                  <input
                    style={styles.input}
                    value={adminForm.login}
                    onChange={(e) =>
                      setAdminForm((prev) => ({ ...prev, login: e.target.value }))
                    }
                    placeholder="Seu login"
                  />
                </label>

                <label style={styles.field}>
                  <span style={styles.label}>Senha</span>
                  <input
                    style={styles.input}
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Sua senha"
                    type="password"
                  />
                </label>

                {adminError ? <div style={styles.errorBox}>{adminError}</div> : null}

                <button type="submit" style={styles.primaryButton} disabled={adminBusy}>
                  {adminBusy ? "Entrando..." : "Entrar no painel"}
                </button>

                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminError("");
                    setAdminForm({ login: "", password: "" });
                  }}
                >
                  Voltar para acesso do cliente
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "28px",
  },

  shell: {
    width: "100%",
    maxWidth: "1220px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "26px",
    alignItems: "stretch",
  },

  heroCard: {
    minHeight: "720px",
    borderRadius: "34px",
    padding: "42px 36px",
    background:
      "linear-gradient(180deg, #4d2a7d 0%, #5e34a3 48%, #7047be 100%)",
    color: "#fff",
    boxShadow: "0 30px 70px rgba(90, 54, 119, 0.24)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "24px",
  },

  badge: {
    alignSelf: "flex-start",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },

  heroTitle: {
    margin: 0,
    maxWidth: "540px",
    fontSize: "78px",
    lineHeight: 0.96,
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },

  heroText: {
    margin: 0,
    maxWidth: "520px",
    fontSize: "26px",
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.88)",
  },

  heroInfo: {
    display: "grid",
    gap: "14px",
  },

  heroInfoItem: {
    padding: "18px 20px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  heroInfoLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.68)",
    marginBottom: "6px",
  },

  heroInfoValue: {
    fontSize: "18px",
    lineHeight: 1.35,
  },

  formCard: {
    background: "#ffffff",
    borderRadius: "34px",
    padding: "34px 30px",
    boxShadow: "0 26px 60px rgba(104, 78, 136, 0.12)",
    border: "1px solid rgba(111, 60, 195, 0.10)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "720px",
  },

  eyebrow: {
    margin: 0,
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#8d74b6",
    fontWeight: 800,
  },

  title: {
    margin: "10px 0 8px",
    fontSize: "48px",
    lineHeight: 1.05,
    color: "#2f2340",
  },

  subtitle: {
    margin: "0 0 22px",
    fontSize: "17px",
    lineHeight: 1.55,
    color: "#78688f",
  },

  formGrid: {
    display: "grid",
    gap: "16px",
    marginTop: "14px",
  },

  field: {
    display: "grid",
    gap: "8px",
  },

  label: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#6f6280",
  },

  input: {
    height: "72px",
    borderRadius: "22px",
    border: "1px solid #eadff7",
    padding: "0 18px",
    fontSize: "28px",
    color: "#2f2340",
    outline: "none",
    background: "#fbf9ff",
  },

  primaryButton: {
    height: "64px",
    border: "none",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #6f3cc3 0%, #5a2fab 100%)",
    color: "#fff",
    fontSize: "18px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 18px 36px rgba(111, 60, 195, 0.24)",
  },

  secondaryButton: {
    height: "58px",
    borderRadius: "18px",
    border: "1px solid #eadff7",
    background: "#faf7ff",
    color: "#2f2340",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
  },

  linkButton: {
    background: "transparent",
    border: "none",
    padding: 0,
    textAlign: "left",
    color: "#6f3cc3",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
  },

  divider: {
    height: "1px",
    background: "#eee4f8",
    margin: "8px 0 6px",
  },

  errorBox: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #f1cad8",
    background: "#fff3f7",
    color: "#c74970",
    fontSize: "15px",
    fontWeight: 700,
  },
};