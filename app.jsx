import { useEffect, useMemo, useState } from "react";
import AdminPanel from "./screens/admin/AdminPanel";
import AccessHubScreen from "./screens/auth/AccessHubScreen";
import CustomerDashboard from "./screens/customer/CustomerDashboard";
import {
  addBonusPoints,
  createCustomer,
  createOrder,
  createProduct,
  createPromo,
  deleteCustomer,
  deleteProduct,
  deletePromo,
  fetchCustomers,
  fetchOrders,
  fetchProducts,
  fetchPromos,
  fetchSettings,
  registerCheckin,
  saveSettings,
  updateCustomer,
  updateProduct,
  updatePromo,
} from "./lib/db";

const initialConfig = {
  pointsPerReal: 10,
  spendGoal: 250,
  checkinPercent: 10,
};

export default function App() {
  const [screen, setScreen] = useState("access");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(initialConfig);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [settingsData, customersData, productsData, ordersData, promosData] = await Promise.all([
        fetchSettings(),
        fetchCustomers(),
        fetchProducts(),
        fetchOrders(),
        fetchPromos(),
      ]);

      setConfig(settingsData || initialConfig);
      setCustomers(customersData || []);
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setPromos(promosData || []);

      if (!selectedCustomerId && customersData?.length) {
        setSelectedCustomerId(customersData[0].id);
      } else if (
        selectedCustomerId &&
        !customersData.some((customer) => customer.id === selectedCustomerId)
      ) {
        setSelectedCustomerId(customersData[0]?.id || "");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados do Supabase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
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

  const handleEnterCustomer = () => setScreen("customer");
  const handleEnterAdmin = () => setScreen("admin");
  const handleBackToAccess = () => setScreen("access");

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
  };

  const handleAddCustomer = async (payload) => {
    try {
      const customer = await createCustomer(payload);
      setCustomers((prev) => [customer, ...prev]);
      setSelectedCustomerId(customer.id);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar cliente.");
    }
  };

  const handleUpdateCustomer = async (payload) => {
    try {
      const updated = await updateCustomer(payload);
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === updated.id ? updated : customer))
      );
      setSelectedCustomerId(updated.id);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar cliente.");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await deleteCustomer(customerId);
      setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
      setOrders((prev) => prev.filter((order) => order.customerId !== customerId));
      if (selectedCustomerId === customerId) {
        const remaining = customers.filter((customer) => customer.id !== customerId);
        setSelectedCustomerId(remaining[0]?.id || "");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir cliente.");
    }
  };

  const handleAddProduct = async (payload) => {
    try {
      const product = await createProduct(payload);
      setProducts((prev) => [product, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar produto.");
    }
  };

  const handleUpdateProduct = async (payload) => {
    try {
      const updated = await updateProduct(payload);
      setProducts((prev) =>
        prev.map((product) => (product.id === updated.id ? updated : product))
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar produto.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir produto.");
    }
  };

  const handleAddPromo = async (payload) => {
    try {
      const promo = await createPromo(payload);
      setPromos((prev) => [promo, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar promoção.");
    }
  };

  const handleUpdatePromo = async (payload) => {
    try {
      const updated = await updatePromo(payload);
      setPromos((prev) => prev.map((promo) => (promo.id === updated.id ? updated : promo)));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar promoção.");
    }
  };

  const handleDeletePromo = async (promoId) => {
    try {
      await deletePromo(promoId);
      setPromos((prev) => prev.filter((promo) => promo.id !== promoId));
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir promoção.");
    }
  };

  const handleSaveConfig = async (payload) => {
    try {
      await saveSettings(payload);
      setConfig({
        pointsPerReal: Number(payload.pointsPerReal || 10),
        spendGoal: Number(payload.spendGoal || 250),
        checkinPercent: Number(payload.checkinPercent || 10),
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações.");
    }
  };

  const handleAddBonus = async ({ customerId, points }) => {
    try {
      await addBonusPoints({ customerId, points });
      await loadAll();
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar bônus.");
    }
  };

  const handleAddOrder = async (payload) => {
    try {
      await createOrder(payload, config);
      await loadAll();
    } catch (error) {
      console.error(error);
      alert("Erro ao lançar pedido.");
    }
  };

  const handleCustomerCheckin = async () => {
    if (!customerWithPromos) return;
    try {
      await registerCheckin({
        customerId: customerWithPromos.id,
        checkinPercent: config.checkinPercent,
      });
      await loadAll();
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar check-in.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f2ff",
          color: "#5f2d79",
          fontWeight: 700,
        }}
      >
        Carregando dados...
      </div>
    );
  }

  if (screen === "admin") {
    return (
      <AdminPanel
        onBack={handleBackToAccess}
        customers={customers}
        products={products}
        orders={orders}
        promos={promos}
        config={config}
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
      />
    );
  }

  if (screen === "customer" && customerWithPromos) {
    return (
      <CustomerDashboard
        customer={customerWithPromos}
        onLogout={handleBackToAccess}
        promos={promos}
        settings={config}
        onCheckin={handleCustomerCheckin}
      />
    );
  }

  return (
    <AccessHubScreen
      onCustomerEnter={handleEnterCustomer}
      onEmployeeEnter={handleEnterAdmin}
    />
  );
}