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

  const brandName =
    branding.companyName?.trim() || branding.softwareName?.trim() || "Voltta";

  const softwareName = branding.softwareName?.trim() || "Voltta";
  const slogan =
    branding.welcomePhrase?.trim() ||
    "Programa de fidelidade, operação e relacionamento em uma experiência só.";

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
      <div
        style={{
          ...styles.shell,
          gridTemplateColumns: showAdminLogin
            ? "minmax(0, 1.05fr) minmax(0, 0.95fr)"
            : "minmax(0, 1.08fr) minmax(0, 0.92fr)",
        }}
      >
        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.brandLockup}>
              <div style={styles.brandMark}>
                <img src={brandLogo} alt="Logo Voltta" style={styles.brandImage} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={styles.badge}>{softwareName}</div>
                <p style={styles.brandName}>{brandName}</p>
              </div>
            </div>

            <div style={styles.heroTag}>Webapp da loja</div>
          </div>

          <div style={styles.heroBody}>
            <h1 style={styles.heroTitle}>
              Fidelidade moderna com identidade Voltta e operação pronta para uso.
            </h1>

            <p style={styles.heroText}>
              Entre na área do cliente para acompanhar pontos, cupons e promoções,
              ou acesse o painel da loja com login interno da equipe.
            </p>
          </div>

          <div style={styles.heroHighlight}>
            <strong style={styles.heroHighlightTitle}>{slogan}</strong>
            <p style={styles.heroHighlightText}>
              Os arquivos visuais do projeto agora seguem a marca Voltta, usando os
              PNGs oficiais já existentes no app.
            </p>
          </div>

          <div style={styles.heroInfo}>
            <div style={styles.heroInfoItem}>
              <span style={styles.heroInfoLabel}>Marca ativa</span>
              <strong style={styles.heroInfoValue}>Voltta</strong>
            </div>

            <div style={styles.heroInfoItem}>
              <span style={styles.heroInfoLabel}>Logo principal usada aqui</span>
              <strong style={styles.heroInfoValue}>assets/logo.png</strong>
            </div>

            <div style={styles.heroInfoItem}>
              <span style={styles.heroInfoLabel}>Experiência</span>
              <strong style={styles.heroInfoValue}>
                Cliente e operação no mesmo ecossistema
              </strong>
            </div>
          </div>
        </section>

        <section style={styles.formCard}>
          {!showAdminLogin ? (
            <>
              <p style={styles.eyebrow}>Área do cliente</p>
              <h2 style={styles.title}>Entrar na sua conta</h2>
              <p style={styles.subtitle}>
                Consulte seu saldo, acompanhe vantagens e use seus benefícios no app.
              </p>

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
              <h2 style={styles.title}>Login da equipe</h2>
              <p style={styles.subtitle}>
                Use o login cadastrado internamente para acessar a operação da loja.
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
    maxWidth: "1240px",
    display: "grid",
    gap: "26px",
    alignItems: "stretch",
  },

  heroCard: {
    minHeight: "720px",
    borderRadius: "34px",
    padding: "38px 34px",
    background:
      "linear-gradient(180deg, #241531 0%, #342047 38%, #4b2f68 100%)",
    color: "#fff",
    boxShadow: "0 30px 70px rgba(58, 33, 87, 0.24)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "24px",
    overflow: "hidden",
  },

  heroTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },

  brandLockup: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minWidth: 0,
  },

  brandMark: {
    width: "86px",
    height: "86px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "grid",
    placeItems: "center",
    padding: "10px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
    flexShrink: 0,
  },

  brandImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "34px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },

  brandName: {
    margin: 0,
    fontSize: "17px",
    lineHeight: 1.2,
    color: "rgba(255,255,255,0.82)",
    fontWeight: 700,
  },

  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "34px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.82)",
  },

  heroBody: {
    display: "grid",
    gap: "18px",
  },

  heroTitle: {
    margin: 0,
    maxWidth: "680px",
    fontSize: "72px",
    lineHeight: 0.96,
    fontWeight: 800,
    letterSpacing: "-0.045em",
  },

  heroText: {
    margin: 0,
    maxWidth: "560px",
    fontSize: "24px",
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.88)",
  },

  heroHighlight: {
    padding: "20px 22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "grid",
    gap: "8px",
  },

  heroHighlightTitle: {
    fontSize: "18px",
    lineHeight: 1.35,
  },

  heroHighlightText: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.76)",
    maxWidth: "620px",
  },

  heroInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },

  heroInfoItem: {
    minWidth: 0,
    padding: "18px 18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  heroInfoLabel: {
    display: "block",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.66)",
    marginBottom: "8px",
  },

  heroInfoValue: {
    fontSize: "16px",
    lineHeight: 1.45,
    wordBreak: "break-word",
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
    fontSize: "46px",
    lineHeight: 1.04,
    color: "#2f2340",
  },

  subtitle: {
    margin: "0 0 22px",
    fontSize: "17px",
    lineHeight: 1.6,
    color: "#78688f",
    maxWidth: "480px",
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