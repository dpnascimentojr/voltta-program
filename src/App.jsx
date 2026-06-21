import { useEffect, useMemo, useState } from "react";
import AdminPanel from "./screens/admin/AdminPanel";
import AccessHubScreen from "./screens/auth/AccessHubScreen";
import CustomerDashboard from "./screens/customer/CustomerDashboard";

const STORAGE_KEYS = {
  config: "savana_config",
  customers: "savana_customers",
  products: "savana_products",
  orders: "savana_orders",
  promos: "savana_promos",
  selectedCustomerId: "savana_selected_customer_id",
};

const initialConfig = {
  pointsPerReal: 10,
  spendGoal: 250,
  checkinPercent: 10,
};

const initialCustomers = [
  {
    id: "c1",
    name: "Cliente Savana",
    phone: "(75) 99999-0000",
    birth: "",
    pin: "1234",
    email: "cliente@savana.com",
    address: "Centro",
    tier: "Bronze",
    points: 180,
    totalSpent: 18,
    visits: 6,
    cashback: 12,
    coupons: [
      {
        id: "cp1",
        title: "10% no próximo pedido",
        code: "BEMVINDO10",
        percent: 10,
        active: true,
      },
      {
        id: "cp2",
        title: "Check-in premiado",
        code: "CHECKIN5",
        percent: 5,
        active: true,
      },
    ],
    promotions: [],
    history: [
      {
        id: "h1",
        product: "Açaí 500 ml",
        amount: 18,
        date: new Date().toISOString(),
      },
    ],
  },
];

const initialProducts = [
  {
    id: "p1",
    name: "Açaí 500 ml",
    category: "Açaí",
    price: 18,
    description: "Açaí tradicional com montagem livre.",
    available: true,
  },
  {
    id: "p2",
    name: "Copo 300 ml",
    category: "Açaí",
    price: 14,
    description: "Versão compacta para consumo rápido.",
    available: true,
  },
];

const initialOrders = [
  {
    id: "o1",
    customerId: "c1",
    customerName: "Cliente Savana",
    productId: "p1",
    productName: "Açaí 500 ml",
    channel: "Balcão",
    status: "Recebido",
    total: 18,
    note: "Sem banana",
    createdAt: new Date().toISOString(),
  },
];

const initialPromos = [
  {
    id: "m1",
    title: "Happy Hour Savana",
    type: "Happy Hour",
    description: "Desconto especial em horários selecionados.",
  },
];

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function App() {
  const [screen, setScreen] = useState("access");

  const [config, setConfig] = useState(() =>
    readStorage(STORAGE_KEYS.config, initialConfig)
  );
  const [customers, setCustomers] = useState(() =>
    readStorage(STORAGE_KEYS.customers, initialCustomers)
  );
  const [products, setProducts] = useState(() =>
    readStorage(STORAGE_KEYS.products, initialProducts)
  );
  const [orders, setOrders] = useState(() =>
    readStorage(STORAGE_KEYS.orders, initialOrders)
  );
  const [promos, setPromos] = useState(() =>
    readStorage(STORAGE_KEYS.promos, initialPromos)
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(() =>
    readStorage(STORAGE_KEYS.selectedCustomerId, "c1")
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.config, config);
  }, [config]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.customers, customers);
  }, [customers]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.orders, orders);
  }, [orders]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.promos, promos);
  }, [promos]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.selectedCustomerId, selectedCustomerId);
  }, [selectedCustomerId]);

  const selectedCustomer = useMemo(() => {
    return (
      customers.find((customer) => customer.id === selectedCustomerId) ||
      customers[0] ||
      null
    );
  }, [customers, selectedCustomerId]);

  const customerWithPromos = useMemo(() => {
    if (!selectedCustomer) return null;

    return {
      ...selectedCustomer,
      promotions: promos.map((promo) => promo.description),
    };
  }, [selectedCustomer, promos]);

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

  const handleAddCustomer = (payload) => {
    const newCustomer = {
      id: uid("c"),
      name: payload.name,
      phone: payload.phone,
      birth: payload.birth || "",
      pin: payload.pin,
      email: payload.email || "",
      address: payload.address || "",
      tier: payload.tier || "Bronze",
      points: 0,
      totalSpent: 0,
      visits: 0,
      cashback: 0,
      coupons: [],
      promotions: [],
      history: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setSelectedCustomerId(newCustomer.id);
  };

  const handleUpdateCustomer = (payload) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === payload.id
          ? {
              ...customer,
              name: payload.name,
              phone: payload.phone,
              birth: payload.birth || "",
              pin: payload.pin,
              email: payload.email || "",
              address: payload.address || "",
              tier: payload.tier || "Bronze",
            }
          : customer
      )
    );

    setSelectedCustomerId(payload.id);
  };

  const handleDeleteCustomer = (customerId) => {
    const remainingCustomers = customers.filter(
      (customer) => customer.id !== customerId
    );

    setCustomers(remainingCustomers);
    setOrders((prev) => prev.filter((order) => order.customerId !== customerId));

    if (selectedCustomerId === customerId) {
      setSelectedCustomerId(remainingCustomers[0]?.id || "");
    }
  };

  const handleAddProduct = (payload) => {
    const newProduct = {
      id: uid("p"),
      name: payload.name,
      category: payload.category,
      price: normalizeNumber(payload.price),
      description: payload.description || "",
      available: Boolean(payload.available),
    };

    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (payload) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === payload.id
          ? {
              ...product,
              name: payload.name,
              category: payload.category,
              price: normalizeNumber(payload.price),
              description: payload.description || "",
              available: Boolean(payload.available),
            }
          : product
      )
    );
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const handleAddPromo = (payload) => {
    const newPromo = {
      id: uid("m"),
      title: payload.title,
      type: payload.type,
      description: payload.description,
    };

    setPromos((prev) => [newPromo, ...prev]);
  };

  const handleUpdatePromo = (payload) => {
    setPromos((prev) =>
      prev.map((promo) =>
        promo.id === payload.id
          ? {
              ...promo,
              title: payload.title,
              type: payload.type,
              description: payload.description,
            }
          : promo
      )
    );
  };

  const handleDeletePromo = (promoId) => {
    setPromos((prev) => prev.filter((promo) => promo.id !== promoId));
  };

  const handleSaveConfig = (payload) => {
    setConfig({
      pointsPerReal: normalizeNumber(payload.pointsPerReal, 10),
      spendGoal: normalizeNumber(payload.spendGoal, 250),
      checkinPercent: normalizeNumber(payload.checkinPercent, 10),
    });
  };

  const handleAddBonus = ({ customerId, points }) => {
    const bonus = normalizeNumber(points);
    if (!customerId || !bonus) return;

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              points: normalizeNumber(customer.points) + bonus,
            }
          : customer
      )
    );
  };

  const handleAddOrder = (payload) => {
    const customer = customers.find((item) => item.id === payload.customerId);
    const product = products.find((item) => item.id === payload.productId);
    const total = normalizeNumber(payload.total);

    if (!customer || !product || !total) return;

    const now = new Date().toISOString();

    const newOrder = {
      id: uid("o"),
      customerId: customer.id,
      customerName: customer.name,
      productId: product.id,
      productName: product.name,
      channel: payload.channel,
      status: payload.status,
      total,
      note: payload.note || "",
      createdAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);

    setCustomers((prev) =>
      prev.map((item) => {
        if (item.id !== customer.id) return item;

        return {
          ...item,
          totalSpent: normalizeNumber(item.totalSpent) + total,
          points:
            normalizeNumber(item.points) +
            total * normalizeNumber(config.pointsPerReal, 10),
          visits: normalizeNumber(item.visits) + 1,
          history: [
            {
              id: uid("h"),
              product: product.name,
              amount: total,
              date: now,
            },
            ...(item.history || []),
          ],
        };
      })
    );
  };

  const handleCustomerCheckin = () => {
    if (!customerWithPromos) return;

    const coupon = {
      id: uid("cp"),
      title: `${normalizeNumber(config.checkinPercent, 10)}% no check-in`,
      code: `CHECKIN${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      percent: normalizeNumber(config.checkinPercent, 10),
      active: true,
    };

    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== customerWithPromos.id) return customer;

        return {
          ...customer,
          points: normalizeNumber(customer.points) + 10,
          visits: normalizeNumber(customer.visits) + 1,
          coupons: [coupon, ...(customer.coupons || [])],
        };
      })
    );
  };

  const adminProps = {
    onBack: handleBackToAccess,
    customers,
    products,
    orders,
    promos,
    config,
    selectedCustomerId,
    onSelectCustomer: handleSelectCustomer,
    onAddCustomer: handleAddCustomer,
    onUpdateCustomer: handleUpdateCustomer,
    onDeleteCustomer: handleDeleteCustomer,
    onAddProduct: handleAddProduct,
    onUpdateProduct: handleUpdateProduct,
    onDeleteProduct: handleDeleteProduct,
    onAddOrder: handleAddOrder,
    onAddPromo: handleAddPromo,
    onUpdatePromo: handleUpdatePromo,
    onDeletePromo: handleDeletePromo,
    onAddBonus: handleAddBonus,
    onSaveConfig: handleSaveConfig,
  };

  const customerProps =
    customerWithPromos && {
      customer: {
        ...customerWithPromos,
        nextRewardAt: config.spendGoal,
        progress: customerProgress,
      },
      onBack: handleBackToAccess,
      onCheckin: handleCustomerCheckin,
    };

  if (screen === "admin") {
    return (
      <div style={styles.appShell}>
        <div style={styles.backgroundGlowTop} />
        <div style={styles.backgroundGlowBottom} />
        <div style={styles.contentWrap}>
          <AdminPanel {...adminProps} />
        </div>
      </div>
    );
  }

  if (screen === "customer" && customerProps) {
    return (
      <div style={styles.appShell}>
        <div style={styles.backgroundGlowTop} />
        <div style={styles.backgroundGlowBottom} />
        <div style={styles.contentWrap}>
          <CustomerDashboard {...customerProps} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />
      <div style={styles.contentWrap}>
        <AccessHubScreen
          onCustomerEnter={handleEnterCustomer}
          onEmployeeEnter={handleEnterAdmin}
        />
      </div>
    </div>
  );
}

const styles = {
  appShell: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #fcfaff 0%, #f6f1fb 48%, #efe7f7 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#22182f",
  },
  contentWrap: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    left: -100,
    width: 360,
    height: 360,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(122, 76, 180, 0.18) 0%, rgba(122, 76, 180, 0) 70%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  backgroundGlowBottom: {
    position: "absolute",
    right: -140,
    bottom: -160,
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(182, 139, 233, 0.16) 0%, rgba(182, 139, 233, 0) 72%)",
    pointerEvents: "none",
    zIndex: 1,
  },
};