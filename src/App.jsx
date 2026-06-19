import { useEffect, useMemo, useState } from "react";
import AccessHubScreen from "./screens/auth/AccessHubScreen";
import CustomerLoginScreen from "./screens/auth/CustomerLoginScreen";
import StaffLoginScreen from "./screens/auth/StaffLoginScreen";
import CustomerDashboard from "./screens/customer/CustomerDashboard";
import AdminPanel from "./screens/admin/AdminPanel";

const STORAGE_KEYS = {
  config: "savana_config",
  customers: "savana_customers",
  products: "savana_products",
  orders: "savana_orders",
  promos: "savana_promos",
  staffUsers: "savana_staff_users",
  staffSession: "savana_staff_session",
  selectedCustomerId: "savana_selected_customer_id",
};

const MASTER_CREDENTIALS = {
  login: "volttaadm",
  password: "@vtt010203",
  name: "Administrador Master",
  role: "master",
  companyId: "default-company",
};

const initialConfig = {
  pointsPerReal: 10,
  spendGoal: 250,
  checkinPercent: 10,
  branding: {
    softwareName: "Clube Base",
    companyName: "Savana Açaí & Sorvetes",
    logoUrl: "",
    instagramUrl: "",
    whatsappNumber: "",
    whatsappMessage: "Olá! Vim pelo app.",
    welcomePhrase: "Seu clube de pontos da loja.",
  },
};

const initialCustomers = [
  {
    id: "c1",
    name: "Cliente Base",
    phone: "(75) 99999-0000",
    birth: "",
    pin: "1234",
    email: "cliente@loja.com",
    address: "Centro",
    tier: "Bronze",
    points: 180,
    totalSpent: 18,
    visits: 6,
    cashback: 12,
    coupons: [
      { id: "cp1", title: "10% no próximo pedido", code: "BEMVINDO10", percent: 10, active: true },
      { id: "cp2", title: "Check-in premiado", code: "CHECKIN5", percent: 5, active: true },
    ],
    promotions: [],
    history: [{ id: "h1", product: "Açaí 500 ml", amount: 18, date: new Date().toISOString() }],
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
    customerName: "Cliente Base",
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
    title: "Happy Hour",
    type: "Happy Hour",
    description: "Desconto especial em horários selecionados.",
    image: "",
  },
];

const initialStaffUsers = [
  {
    id: "s1",
    email: "admin@voltta.local",
    login: "001",
    username: "@admin",
    employeeId: "001",
    phone: "(75) 99999-1111",
    password: "1234",
    pin: "1234",
    name: "Administrador",
    role: "owner",
    companyId: "default-company",
    active: true,
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

function buildWhatsappLink(number, message = "") {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";
  const encodedMessage = encodeURIComponent(message || "");
  return encodedMessage
    ? `https://wa.me/${digits}?text=${encodedMessage}`
    : `https://wa.me/${digits}`;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function App() {
  const [screen, setScreen] = useState("access");
  const [config, setConfig] = useState(() => readStorage(STORAGE_KEYS.config, initialConfig));
  const [customers, setCustomers] = useState(() => readStorage(STORAGE_KEYS.customers, initialCustomers));
  const [products, setProducts] = useState(() => readStorage(STORAGE_KEYS.products, initialProducts));
  const [orders, setOrders] = useState(() => readStorage(STORAGE_KEYS.orders, initialOrders));
  const [promos, setPromos] = useState(() => readStorage(STORAGE_KEYS.promos, initialPromos));
  const [staffUsers, setStaffUsers] = useState(() => readStorage(STORAGE_KEYS.staffUsers, initialStaffUsers));
  const [selectedCustomerId, setSelectedCustomerId] = useState(() =>
    readStorage(STORAGE_KEYS.selectedCustomerId, "c1")
  );
  const [staffSession, setStaffSession] = useState(() =>
    readStorage(STORAGE_KEYS.staffSession, null)
  );
  const [customerSession, setCustomerSession] = useState(null);

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
    localStorage.setItem(STORAGE_KEYS.staffUsers, JSON.stringify(staffUsers));
  }, [staffUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.staffSession, JSON.stringify(staffSession));
  }, [staffSession]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.selectedCustomerId, JSON.stringify(selectedCustomerId));
  }, [selectedCustomerId]);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) || customers[0] || null;

  const branding = config?.branding || initialConfig.branding;
  const whatsappLink = buildWhatsappLink(branding.whatsappNumber, branding.whatsappMessage);

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

  const handleBackToAccess = () => {
    setScreen("access");
    setCustomerSession(null);
    setStaffSession(null);
  };

  const handleEnterCustomerArea = () => setScreen("customer-login");
  const handleEnterStaffArea = () => setScreen("staff-login");

  const handleCustomerLogin = ({ phone, pin }) => {
    const normalizedPhone = onlyDigits(phone);
    const found = customers.find((customer) => {
      const customerPhone = onlyDigits(customer.phone);
      return customerPhone === normalizedPhone && String(customer.pin || "") === String(pin || "").trim();
    });

    if (!found) return { ok: false, message: "Telefone ou PIN incorretos." };

    setSelectedCustomerId(found.id);
    setCustomerSession({ customerId: found.id });
    setScreen("customer");
    return { ok: true };
  };

  const handleStaffLogin = ({ login, password }) => {
    const normalizedLogin = normalize(login);
    const normalizedPassword = String(password || "").trim();

    if (
      normalizedLogin === MASTER_CREDENTIALS.login.toLowerCase() &&
      normalizedPassword === MASTER_CREDENTIALS.password
    ) {
      const session = {
        staffId: "master-account",
        role: MASTER_CREDENTIALS.role,
        companyId: MASTER_CREDENTIALS.companyId,
        name: MASTER_CREDENTIALS.name,
        email: "",
        isMaster: true,
      };

      setStaffSession(session);
      setScreen("admin");
      return { ok: true };
    }

    const found = staffUsers.find((user) => {
      const byEmail = normalize(user.email) === normalizedLogin;
      const byLogin = normalize(user.login) === normalizedLogin;
      const byUsername = normalize(user.username) === normalizedLogin;
      const byEmployeeId = normalize(user.employeeId) === normalizedLogin;
      const validPassword =
        String(user.password || "").trim() === normalizedPassword ||
        String(user.pin || "").trim() === normalizedPassword;

      return (byEmail || byLogin || byUsername || byEmployeeId) && validPassword;
    });

    if (!found) return { ok: false, message: "Usuário, matrícula ou senha inválidos." };
    if (found.active === false) return { ok: false, message: "Usuário inativo." };

    const session = {
      staffId: found.id,
      role: found.role,
      companyId: found.companyId || "default-company",
      name: found.name,
      email: found.email || "",
      isMaster: false,
    };

    setStaffSession(session);
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
    const remaining = customers.filter((customer) => customer.id !== customerId);
    setCustomers(remaining);
    setOrders((prev) => prev.filter((order) => order.customerId !== customerId));

    if (selectedCustomerId === customerId) {
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
      image: payload.image || "",
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
              image: payload.image || "",
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
      branding: {
        softwareName: payload.softwareName || "Clube Base",
        companyName: payload.companyName || "Minha Loja",
        logoUrl: payload.logoUrl || "",
        instagramUrl: payload.instagramUrl || "",
        whatsappNumber: payload.whatsappNumber || "",
        whatsappMessage: payload.whatsappMessage || "Olá! Vim pelo app.",
        welcomePhrase: payload.welcomePhrase || "Seu clube de pontos da loja.",
      },
    });
  };

  const handleAddStaffUser = (payload) => {
    const newUser = {
      id: uid("s"),
      email: payload.email || "",
      login: payload.login || "",
      username: payload.username || "",
      employeeId: payload.employeeId || "",
      phone: payload.phone || "",
      role: payload.role || "staff",
      password: payload.password,
      pin: payload.pin || "",
      name: payload.name,
      companyId: payload.companyId || "default-company",
      active: payload.active ?? true,
    };
    setStaffUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateStaffUser = (payload) => {
    setStaffUsers((prev) =>
      prev.map((user) =>
        user.id === payload.id
          ? {
              ...user,
              email: payload.email || "",
              login: payload.login || "",
              username: payload.username || "",
              employeeId: payload.employeeId || "",
              phone: payload.phone || "",
              role: payload.role || "staff",
              password: payload.password,
              pin: payload.pin || "",
              name: payload.name,
              companyId: payload.companyId || "default-company",
              active: payload.active ?? true,
            }
          : user
      )
    );
  };

  const handleDeleteStaffUser = (staffId) => {
    setStaffUsers((prev) => prev.filter((user) => user.id !== staffId));
  };

  const handleAddBonus = ({ customerId, points }) => {
    const bonus = Number(points || 0);
    if (!customerId || !bonus) return;

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId ? { ...customer, points: Number(customer.points || 0) + bonus } : customer
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
        recoveryWhatsappLink={whatsappLink}
      />
    );
  }

  if (screen === "customer" && customerWithPromos) {
    return (
      <CustomerDashboard
        customer={customerWithPromos}
        progress={customerProgress}
        onBack={handleBackToAccess}
        onCheckin={handleCustomerCheckin}
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
        config={config}
        staffUsers={staffUsers}
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
        onUpdateStaffUser={handleUpdateStaffUser}
        onDeleteStaffUser={handleDeleteStaffUser}
        branding={branding}
        whatsappLink={whatsappLink}
        staffSession={staffSession}
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