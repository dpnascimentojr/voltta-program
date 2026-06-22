import { useState } from "react";
import brandLogo from "../../assets/logo.png";

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

  const slogan =
    branding.welcomePhrase?.trim() || "Conecte clientes. Movimente sua marca.";

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
        <section style={styles.formCard}>
          <div style={styles.loginBrand}>
            <div style={styles.loginLogoWrap}>
              <img src={brandLogo} alt="Logo da marca" style={styles.loginLogo} />
            </div>
          </div>

          {!showAdminLogin ? (
            <>
              <p style={styles.eyebrow}>Área do cliente</p>
              <h1 style={styles.title}>Entrar</h1>

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

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={onCustomerEnter}
                >
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
              <h1 style={styles.title}>Login da equipe</h1>

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
                  Voltar
                </button>
              </form>
            </>
          )}
        </section>

        <section style={styles.heroCard}>
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>Voltta</p>
            <h2 style={styles.heroSlogan}>{slogan}</h2>
            <p style={styles.heroText}>Fidelidade simples para cliente e loja.</p>
          </div>
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
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.92) 0, rgba(255,255,255,0) 24%), radial-gradient(circle at bottom right, rgba(208,190,241,0.42) 0, rgba(208,190,241,0) 32%), linear-gradient(180deg, #f8f5ff 0%, #f3eefb 100%)",
  },

  shell: {
    width: "100%",
    maxWidth: "1240px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.92fr) minmax(0, 1.08fr)",
    gap: "26px",
    alignItems: "stretch",
  },

  formCard: {
    background: "#ffffff",
    borderRadius: "34px",
    padding: "34px 30px",
    boxShadow: "0 26px 60px rgba(104, 78, 136, 0.12)",
    border: "1px solid rgba(111, 60, 195, 0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "720px",
  },

  loginBrand: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "22px",
  },

  loginLogoWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 18px",
    borderRadius: "24px",
    background: "#f6f1ff",
  },

  loginLogo: {
    width: "150px",
    height: "150px",
    objectFit: "contain",
    display: "block",
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
    margin: "10px 0 18px",
    fontSize: "54px",
    lineHeight: 1.02,
    color: "#2f2340",
  },

  formGrid: {
    display: "grid",
    gap: "16px",
    marginTop: "8px",
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
    height: "68px",
    borderRadius: "20px",
    border: "1px solid #eadff7",
    padding: "0 18px",
    fontSize: "22px",
    color: "#2f2340",
    outline: "none",
    background: "#fbf9ff",
  },

  primaryButton: {
    height: "62px",
    border: "none",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #6f3cc3 0%, #51279a 100%)",
    color: "#fff",
    fontSize: "18px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 18px 36px rgba(111, 60, 195, 0.20)",
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

  heroCard: {
    minHeight: "720px",
    borderRadius: "34px",
    padding: "42px 40px",
    background:
      "linear-gradient(180deg, #241531 0%, #342047 42%, #4d3170 100%)",
    color: "#fff",
    boxShadow: "0 30px 70px rgba(58, 33, 87, 0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    width: "100%",
    display: "grid",
    gap: "18px",
    alignContent: "center",
  },

  heroEyebrow: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.68)",
  },

  heroSlogan: {
    margin: 0,
    maxWidth: "680px",
    fontSize: "78px",
    lineHeight: 0.95,
    fontWeight: 800,
    letterSpacing: "-0.05em",
    color: "#ffffff",
  },

  heroText: {
    margin: 0,
    maxWidth: "460px",
    fontSize: "24px",
    lineHeight: 1.4,
    color: "rgba(255,255,255,0.82)",
  },
};