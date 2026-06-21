import { useEffect, useMemo, useState } from "react";
import AccessHubScreen from "./screens/auth/AccessHubScreen";
import CustomerLoginScreen from "./screens/auth/CustomerLoginScreen";
import StaffLoginScreen from "./screens/auth/StaffLoginScreen";
import CustomerDashboard from "./screens/customer/CustomerDashboard";
import AdminPanel from "./screens/admin/AdminPanel";
import {
  addBonus,
  approveCheckin,
  createCustomer,
  createOrder,
  createProduct,
  createPromo,
  deleteCustomer,
  deleteProduct,
  deletePromo,
  fetchAllData,
  fetchPendingCheckins,
  rejectCheckin,
  requestInstagramCheckin,
  saveConfig,
  updateCustomer,
  updateProduct,
  updatePromo,
} from "./lib/api";

const initialBranding = {
  softwareName: "Clube Base",
  companyName: "Minha Loja",
  logoUrl: "",
  instagramUrl: "",
  whatsappNumber: "",
  whatsappMessage: "Olá! Vim pelo app.",
  welcomePhrase: "Seu clube de pontos da loja.",
};

function buildWhatsappLink(number, message = "") {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";
  const encodedMessage = encodeURIComponent(message || "");
  return encodedMessage
    ? `https://wa.me/${digits}?text=${encodedMessage}`
    : `https://wa.me/${digits}`;
}

export default function App() {
  const [screen, setScreen] = useState("access");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [config, setConfig] = useState({
    pointsPerReal: 10,
    spendGoal: 250,
    checkinPercent: 10,
  });

  const [branding, setBranding] = useState(initialBranding);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [pendingCheckins, setPendingCheckins] = useState([]);

  const [staffUsers, setStaffUsers] = useState([
    {
      id: "s1",
      name: "Administrador",
      login: "001",
      role: "Administrador",
      password: "1234",
    },
  ]);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSession, setCustomerSession] = useState(null);
  const [staffSession, setStaffSession] = useState(null);

  async function loadAppData() {
    setLoading(true);
    setError("");

    try {
      const [data, pending] = await Promise.all([
        fetchAllData(),
        fetchPendingCheckins(),
      ]);

      setCustomers(data.customers || []);
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setPromos(data.promos || []);
      setPendingCheckins(pending || []);

      setConfig({
        pointsPerReal: Number(data.config?.pointsPerReal || 10),
        spendGoal: Number(data.config?.spendGoal || 250),
        checkinPercent: Number(data.config?.checkinPercent || 10),
      });

      setBranding({
        softwareName: data.config?.branding?.softwareName || "Clube Base",
        companyName: data.config?.branding?.companyName || "Minha Loja",
        logoUrl: data.config?.branding?.logoUrl || "",
        instagramUrl: data.config?.branding?.instagramUrl || "",
        whatsappNumber: data.config?.branding?.whatsappNumber || "",
        whatsappMessage: data.config?.branding?.whatsappMessage || "Olá! Vim pelo app.",
        welcomePhrase: data.config?.branding?.welcomePhrase || "Seu clube de pontos da loja.",
      });

      setSelectedCustomerId((current) => {
        if (current && (data.customers || []).some((customer) => customer.id === current)) {
          return current;
        }
        return data.customers?.[0]?.id || "";
      });
    } catch (err) {
      setError(err?.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppData();
  }, []);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) || customers[0] || null;

  const customerWithPromos = selectedCustomer
    ? {
        ...selectedCustomer,
        promotions: promos.map((promo) => promo.description),
        nextRewardAt: config.spendGoal,
      }
    : null;

  const customerProgress = useMemo(() => {
    if (!customerWithPromos) return 0;
    const total = customerWithPromos.nextRewardAt || config.spendGoal || 250;
    const current = customerWithPromos.points || 0;
    return Math.min((current / total) * 100, 100);
  }, [customerWithPromos, config]);

  const whatsappLink = buildWhatsappLink(branding.whatsappNumber, branding.whatsappMessage);

  const handleBackToAccess = () => {
    setScreen("access");
    setCustomerSession(null);
    setStaffSession(null);
  };

  const handleEnterCustomerArea = () => setScreen("customer-login");
  const handleEnterStaffArea = () => setScreen("staff-login");

  const handleCustomerLogin = ({ phone, pin }) => {
    const normalizedPhone = String(phone || "").replace(/\D/g, "");
    const found = customers.find((customer) => {
      const customerPhone = String(customer.phone || "").replace(/\D/g, "");
      return customerPhone === normalizedPhone && String(customer.pin || "") === String(pin || "").trim();
    });

    if (!found) return { ok: false, message: "Telefone ou PIN incorretos." };

    setSelectedCustomerId(found.id);
    setCustomerSession({ customerId: found.id });
    setScreen("customer");
    return { ok: true };
  };

  const handleStaffLogin = ({ login, password }) => {
    const normalizedLogin = String(login || "").trim().toLowerCase();
    const found = staffUsers.find((user) => {
      return (
        String(user.login || "").trim().toLowerCase() === normalizedLogin &&
        String(user.password || "") === String(password || "")
      );
    });

    if (!found) return { ok: false, message: "Usuário ou senha inválidos." };

    setStaffSession({ staffId: found.id, name: found.name });
    setScreen("admin");
    return { ok: true };
  };

  const handleLogoutCustomer = () => {
    setCustomerSession(null);
    setScreen("access");
  };

  const handleLogoutStaff = () => {
    setStaffSession(null);
    setScreen("access");
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
  };

  const handleAddCustomer = async (payload) => {
    await createCustomer(payload);
    await loadAppData();
  };

  const handleUpdateCustomer = async (payload) => {
    await updateCustomer(payload);
    await loadAppData();
    setSelectedCustomerId(payload.id);
  };

  const handleDeleteCustomer = async (customerId) => {
    await deleteCustomer(customerId);
    await loadAppData();
  };

  const handleAddProduct = async (payload) => {
    await createProduct(payload);
    await loadAppData();
  };

  const handleUpdateProduct = async (payload) => {
    await updateProduct(payload);
    await loadAppData();
  };

  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId);
    await loadAppData();
  };

  const handleAddPromo = async (payload) => {
    await createPromo(payload);
    await loadAppData();
  };

  const handleUpdatePromo = async (payload) => {
    await updatePromo(payload);
    await loadAppData();
  };

  const handleDeletePromo = async (promoId) => {
    await deletePromo(promoId);
    await loadAppData();
  };

  const handleSaveConfig = async (payload) => {
    await saveConfig(payload);

    setConfig({
      pointsPerReal: Number(payload.pointsPerReal || 10),
      spendGoal: Number(payload.spendGoal || 250),
      checkinPercent: Number(payload.checkinPercent || 10),
    });

    setBranding({
      softwareName: payload.softwareName || "Clube Base",
      companyName: payload.companyName || "Minha Loja",
      logoUrl: payload.logoUrl || "",
      instagramUrl: payload.instagramUrl || "",
      whatsappNumber: payload.whatsappNumber || "",
      whatsappMessage: payload.whatsappMessage || "Olá! Vim pelo app.",
      welcomePhrase: payload.welcomePhrase || "Seu clube de pontos da loja.",
    });
  };

  const handleAddStaffUser = (payload) => {
    setStaffUsers((prev) => [
      {
        id: `s_${Math.random().toString(36).slice(2, 9)}`,
        name: payload.name,
        login: payload.login,
        role: payload.role || "Funcionário",
        password: payload.password,
      },
      ...prev,
    ]);
  };

  const handleDeleteStaffUser = (staffId) => {
    setStaffUsers((prev) => prev.filter((user) => user.id !== staffId));
  };

  const handleAddBonus = async ({ customerId, points }) => {
    await addBonus({ customerId, points });
    await loadAppData();
  };

  const handleAddOrder = async (payload) => {
    await createOrder(payload, config);
    await loadAppData();
  };

  const handleInstagramCheckinRequest = async () => {
    if (!customerWithPromos) return;

    await requestInstagramCheckin({
      customerId: customerWithPromos.id,
      instagramHandle: branding.instagramUrl || "",
      storeLabel: branding.companyName || "Minha Loja",
    });

    window.alert(
      `Agora poste um Story marcando ${
        branding.instagramUrl || "@sua_loja"
      } e mostre no balcão para liberar seu desconto.`
    );

    await loadAppData();
  };

  const handleApproveCheckin = async (request) => {
    await approveCheckin({
      requestId: request.id,
      customerId: request.customer_id,
      percent: config.checkinPercent,
      approvedBy: staffSession?.name || "Equipe",
    });

    await loadAppData();
  };

  const handleRejectCheckin = async (request) => {
    await rejectCheckin({
      requestId: request.id,
      approvedBy: staffSession?.name || "Equipe",
    });

    await loadAppData();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #f7f2ff 0%, #efe7fb 100%)",
          color: "#5f2d79",
          fontWeight: 700,
          padding: "24px",
        }}
      >
        Carregando dados...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #f7f2ff 0%, #efe7fb 100%)",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            background: "#fff",
            border: "1px solid #eadff7",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 20px 50px rgba(90, 54, 119, 0.14)",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#341c45" }}>Erro de conexão</h2>
          <p style={{ color: "#7e6d93", lineHeight: 1.6 }}>{error}</p>
          <button
            type="button"
            onClick={loadAppData}
            style={{
              border: 0,
              borderRadius: 14,
              padding: "12px 16px",
              background: "linear-gradient(135deg, #5f2d79 0%, #8151a4 100%)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (screen === "customer-login") {
    return (
      <CustomerLoginScreen
        onBack={handleBackToAccess}
        onLogin={handleCustomerLogin}
        branding={branding}
      />
    );
  }

  if (screen === "staff-login") {
    return (
      <StaffLoginScreen
        onBack={handleBackToAccess}
        onLogin={handleStaffLogin}
        branding={branding}
      />
    );
  }

  if (screen === "customer" && customerWithPromos) {
    return (
      <CustomerDashboard
        customer={customerWithPromos}
        progress={customerProgress}
        onBack={handleBackToAccess}
        onCheckin={handleInstagramCheckinRequest}
        onLogout={handleLogoutCustomer}
        branding={branding}
        whatsappLink={whatsappLink}
      />
    );
  }

  if (screen === "admin") {
    return (
      <AdminPanel
        onBack={handleBackToAccess}
        onLogout={handleLogoutStaff}
        customers={customers}
        products={products}
        orders={orders}
        promos={promos}
        config={{ ...config, branding }}
        staffUsers={staffUsers}
        pendingCheckins={pendingCheckins}
        onApproveCheckin={handleApproveCheckin}
        onRejectCheckin={handleRejectCheckin}
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={handleSelectCustomer}
        onAddCustomer={handleAddCustomer}
        onUpdateCustomer={handleUpdateCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddOrder={handleAddOrder}
        onAddPromo={handleAddPromo}
        onUpdatePromo={handleUpdatePromo}
        onDeletePromo={handleDeletePromo}
        onAddBonus={handleAddBonus}
        onSaveConfig={handleSaveConfig}
        onAddStaffUser={handleAddStaffUser}
        onDeleteStaffUser={handleDeleteStaffUser}
        branding={branding}
        whatsappLink={whatsappLink}
      />
    );
  }

  return (
    <AccessHubScreen
      onCustomerEnter={handleEnterCustomerArea}
      onEmployeeEnter={handleEnterStaffArea}
      branding={branding}
      whatsappLink={whatsappLink}
    />
  );
}