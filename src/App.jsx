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
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.promos, JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.selectedCustomerId,
      JSON.stringify(selectedCustomerId)
    );
  }, [selectedCustomerId]);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ||
    customers[0] ||
    null;

  const customerWithPromos = selectedCustomer
    ? {
        ...selectedCustomer,
        promotions: promos.map((promo) => promo.description),
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
    setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    setOrders((prev) => prev.filter((order) => order.customerId !== customerId));

    if (selectedCustomerId === customerId) {
      const remaining = customers.filter((customer) => customer.id !== customerId);
      setSelectedCustomerId(remaining[0]?.id || "");
    }
  };

  const handleAddProduct = (payload) => {
    const newProduct = {
      id: uid("p"),
      name: payload.name,
      category: payload.category,
      price: Number(payload.price),
      description: payload.description || "",
      available: payload.available,
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
              price: Number(payload.price),
              description: payload.description || "",
              available: payload.available,
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
      pointsPerReal: Number(payload.pointsPerReal || 10),
      spendGoal: Number(payload.spendGoal || 250),
      checkinPercent: Number(payload.checkinPercent || 10),
    });
  };

  const handleAddBonus = ({ customerId, points }) => {
    const bonus = Number(points || 0);
    if (!customerId || !bonus) return;

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? { ...customer, points: Number(customer.points || 0) + bonus }
          : customer
      )
    );
  };

  const handleAddOrder = (payload) => {
    const customer = customers.find((item) => item.id === payload.customerId);
    const product = products.find((item) => item.id === payload.productId);
    const total = Number(payload.total || 0);

    if (!customer || !product || !total) return;

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
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    setCustomers((prev) =>
      prev.map((item) => {
        if (item.id !== customer.id) return item;

        return {
          ...item,
          totalSpent: Number(item.totalSpent || 0) + total,
          points: Number(item.points || 0) + total * Number(config.pointsPerReal || 10),
          visits: Number(item.visits || 0) + 1,
          history: [
            {
              id: uid("h"),
              product: product.name,
              amount: total,
              date: new Date().toISOString(),
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
      title: `${config.checkinPercent}% no check-in`,
      code: `CHECKIN${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      percent: Number(config.checkinPercent || 10),
      active: true,
    };

    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== customerWithPromos.id) return customer;

        return {
          ...customer,
          points: Number(customer.points || 0) + 10,
          visits: Number(customer.visits || 0) + 1,
          coupons: [coupon, ...(customer.coupons || [])],
        };
      })
    );
  };

  if (screen === "admin") {
    return (
      <div style={styles.appShell}>
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
      </div>
    );
  }

  if (screen === "customer" && customerWithPromos) {
    return (
      <div style={styles.appShell}>
        <CustomerDashboard
          customer={{
            ...customerWithPromos,
            nextRewardAt: config.spendGoal,
            progress: customerProgress,
          }}
          onBack={handleBackToAccess}
          onCheckin={handleCustomerCheckin}
        />
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <AccessHubScreen
        onCustomerEnter={handleEnterCustomer}
        onEmployeeEnter={handleEnterAdmin}
      />
    </div>
  );
}

const styles = {
  appShell: {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 26%), radial-gradient(circle at bottom right, rgba(212, 193, 244, 0.32) 0, rgba(212, 193, 244, 0) 34%), linear-gradient(180deg, #f8f5ff 0, #f1ebfb 52%, #ece3f8 100%)",
  },
};