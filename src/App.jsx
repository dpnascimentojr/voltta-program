import AdminPanel from "./screens/admin/AdminPanel";
import AccessHubScreen from "./screens/auth/AccessHubScreen";
import CustomerDashboard from "./screens/customer/CustomerDashboard";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { loading, authenticated, isEmployee, isCustomer, profile, logout } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 26%), radial-gradient(circle at bottom right, rgba(212, 193, 244, 0.32) 0, rgba(212, 193, 244, 0) 34%), linear-gradient(180deg, #f8f5ff 0, #f1ebfb 52%, #ece3f8 100%)",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#ffffff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 20px 60px rgba(72, 43, 115, 0.15)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              color: "#2d2047",
              fontWeight: 800,
            }}
          >
            Carregando...
          </h1>
          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              color: "#6d6284",
              lineHeight: 1.5,
            }}
          >
            Verificando sua sessão para abrir o painel ou a área do cliente.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <AccessHubScreen />;
  }

  if (isEmployee) {
    return <AdminPanel currentUser={profile} onExit={logout} />;
  }

  if (isCustomer) {
    return <CustomerDashboard customer={profile} onLogout={logout} />;
  }

  return <AccessHubScreen />;
}