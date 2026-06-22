import { useEffect, useMemo, useState } from "react";
import AdminPanel from "./screens/admin/AdminPanel";
import AccessHubScreen from "./screens/auth/AccessHubScreen";
import CustomerDashboard from "./screens/customer/CustomerDashboard";

const STORAGE_KEYS = {
  config: "voltta_config",
  customers: "voltta_customers",
  products: "voltta_products",
  orders: "voltta_orders",
  promos: "voltta_promos",
  staffUsers: "voltta_staff_users",
  selectedCustomerId: "voltta_selected_customer_id",
};

const initialConfig = {
  pointsPerReal: 10,
  spendGoal: 250,
  checkinPercent: 10,
  softwareName: "Voltta",
  companyName: "Voltta",
  logoUrl: "",
  instagramUrl: "",
  whatsappNumber: "",
  whatsappMessage: "Olá! Vim pelo app da Voltta.",
  welcomePhrase: "Programa de fidelidade, operação e relacionamento em uma experiência só.",
};

const initialCustomers = [
  {
    id: "c1",
    name: "Cliente Voltta",
    phone: "(75) 99999-0000",
    birth: "",
    pin: "1234",
    email: "cliente@voltta.com",
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
        code: "VOLTTA10",
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
        product: "Produto Voltta 01",
        amount: 18,
        date: new Date().toISOString(),
      },
    ],
  },
];

const initialProducts = [
  {
    id: "p1",
    name: "Produto Voltta 01",
    category: "Principal",
    price: 18,
    description: "Item inicial do catálogo para demonstração do app.",
    available: true,
  },
  {
    id: "p2",
    name: "Produto Voltta 02",
    category: "Principal",
    price: 14,
    description: "Segundo item de exemplo para a operação da loja.",
    available: true,
  },
];

const initialOrders = [
  {
    id: "o1",
    customerId: "c1",
    customerName: "Cliente Voltta",
    productId: "p1",
    productName: "Produto Voltta 01",
    channel: "Balcão",
    status: "Recebido",
    total: 18,
    note: "Pedido inicial de demonstração",
    createdAt: new Date().toISOString(),
  },
];

const initialPromos = [
  {
    id: "m1",
    title: "Campanha Voltta",
    type: "Destaque",
    description: "Promoção inicial para apresentar campanhas dentro do app.",
    image: "",
  },
];

const initialStaffUsers = [
  {
    id: "staff_1",
    name: "Administrador",
    login: "admin",
    role: "Administrador",
    password: "123456",
    email: "admin@voltta.com",
    phone: "(75) 99999-1111",
    cpf: "",
    status: "Ativo",
    notes: "Usuário principal da operação.",
    createdAt: new Date().toISOString(),
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
  const [adminAuth, setAdminAuth] = useState({
    isAuthenticated: false,
    user: null,
  });

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
  const [staffUsers, setStaffUsers] = useState(() =>
    readStorage(STORAGE_KEYS.staffUsers, initialStaffUsers)
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
    localStorage.setItem(STORAGE_KEYS.staffUsers, JSON.stringify(staffUsers));
  }, [staffUsers]);

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
        nextRewardAt: config.spendGoal || 250,
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

  const handleBackToAccess = () => {
    setScreen("access");
  };

  const handleLogout = () => {
    setAdminAuth({
      isAuthenticated: false,
      user: null,
    });
    setScreen("access");
  };

  const handleAdminLogin = async ({ login, password }) => {
    const normalizedLogin = String(login || "").trim().toLowerCase();
    const normalizedPassword = String(password || "").trim();

    if (!normalizedLogin || !normalizedPassword) {
      throw new Error("Informe login e senha para acessar o painel.");
    }

    const foundUser = staffUsers.find((user) => {
      const userLogin = String(user.login || "").trim().toLowerCase();
      const userPassword = String(user.password || "").trim();
      const userStatus = String(user.status || "Ativo").trim().toLowerCase();

      return (
        userLogin === normalizedLogin &&
        userPassword === normalizedPassword &&
        userStatus === "ativo"
      );
    });

    if (!foundUser) {
      throw new Error("Login, senha ou status do usuário inválido.");
    }

    setAdminAuth({
      isAuthenticated: true,
      user: foundUser,
    });
    setScreen("admin");
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
  };

  const handleAddCustomer = async (payload) => {
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

  const handleUpdateCustomer = async (payload) => {
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

  const handleDeleteCustomer = async (customerId) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    setOrders((prev) => prev.filter((order) => order.customerId !== customerId));

    if (selectedCustomerId === customerId) {
      const remaining = customers.filter((customer) => customer.id !== customerId);
      setSelectedCustomerId(remaining[0]?.id || "");
    }
  };

  const handleAddProduct = async (payload) => {
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

  const handleUpdateProduct = async (payload) => {
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

  const handleDeleteProduct = async (productId) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const handleAddPromo = async (payload) => {
    const newPromo = {
      id: uid("m"),
      title: payload.title,
      type: payload.type,
      description: payload.description,
      image: payload.image || "",
    };

    setPromos((prev) => [newPromo, ...prev]);
  };

  const handleUpdatePromo = async (payload) => {
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

  const handleDeletePromo = async (promoId) => {
    setPromos((prev) => prev.filter((promo) => promo.id !== promoId));
  };

  const handleSaveConfig = async (payload) => {
    setConfig((prev) => ({
      ...prev,
      pointsPerReal: Number(payload.pointsPerReal || 10),
      spendGoal: Number(payload.spendGoal || 250),
      checkinPercent: Number(payload.checkinPercent || 10),
      softwareName: payload.softwareName || prev.softwareName || "Voltta",
      companyName: payload.companyName || prev.companyName || "Voltta",
      logoUrl: payload.logoUrl || "",
      instagramUrl: payload.instagramUrl || "",
      whatsappNumber: payload.whatsappNumber || "",
      whatsappMessage: payload.whatsappMessage || "Olá! Vim pelo app da Voltta.",
      welcomePhrase:
        payload.welcomePhrase ||
        "Programa de fidelidade, operação e relacionamento em uma experiência só.",
    }));
  };

  const handleAddBonus = async ({ customerId, points }) => {
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

  const handleAddOrder = async (payload) => {
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
          points:
            Number(item.points || 0) + total * Number(config.pointsPerReal || 10),
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

  const handleAddStaffUser = async (payload) => {
    const name = String(payload.name || "").trim();
    const login = String(payload.login || "").trim();
    const role = String(payload.role || "Funcionário").trim();
    const password = String(payload.password || "").trim();
    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || "").trim();
    const cpf = String(payload.cpf || "").trim();
    const status = String(payload.status || "Ativo").trim();
    const notes = String(payload.notes || "").trim();

    if (!name || !login || !password) {
      throw new Error("Preencha nome, login e senha da equipe.");
    }

    const duplicatedLogin = staffUsers.some(
      (user) => String(user.login || "").trim().toLowerCase() === login.toLowerCase()
    );

    if (duplicatedLogin) {
      throw new Error("Já existe um usuário cadastrado com esse login.");
    }

    const newUser = {
      id: uid("staff"),
      name,
      login,
      role,
      password,
      email,
      phone,
      cpf,
      status,
      notes,
      createdAt: new Date().toISOString(),
    };

    setStaffUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateStaffUser = async (payload) => {
    const name = String(payload.name || "").trim();
    const login = String(payload.login || "").trim();
    const role = String(payload.role || "Funcionário").trim();
    const password = String(payload.password || "").trim();
    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || "").trim();
    const cpf = String(payload.cpf || "").trim();
    const status = String(payload.status || "Ativo").trim();
    const notes = String(payload.notes || "").trim();

    if (!payload.id) {
      throw new Error("Funcionário inválido para edição.");
    }

    if (!name || !login || !password) {
      throw new Error("Preencha nome, login e senha da equipe.");
    }

    const duplicatedLogin = staffUsers.some((user) => {
      const sameLogin =
        String(user.login || "").trim().toLowerCase() === login.toLowerCase();
      return sameLogin && user.id !== payload.id;
    });

    if (duplicatedLogin) {
      throw new Error("Já existe outro usuário com esse login.");
    }

    setStaffUsers((prev) =>
      prev.map((user) =>
        user.id === payload.id
          ? {
              ...user,
              name,
              login,
              role,
              password,
              email,
              phone,
              cpf,
              status,
              notes,
            }
          : user
      )
    );

    setAdminAuth((prev) => {
      if (!prev.user || prev.user.id !== payload.id) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          name,
          login,
          role,
          password,
          email,
          phone,
          cpf,
          status,
          notes,
        },
      };
    });
  };

  const handleDeleteStaffUser = async (userId) => {
    const deletingCurrentUser = adminAuth.user?.id === userId;

    setStaffUsers((prev) => prev.filter((user) => user.id !== userId));

    if (deletingCurrentUser) {
      setAdminAuth({
        isAuthenticated: false,
        user: null,
      });
      setScreen("access");
    }
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

  const branding = {
    softwareName: config.softwareName || "Voltta",
    companyName: config.companyName || "Voltta",
    logoUrl: config.logoUrl || "",
    instagramUrl: config.instagramUrl || "",
    whatsappNumber: config.whatsappNumber || "",
    whatsappMessage: config.whatsappMessage || "Olá! Vim pelo app da Voltta.",
    welcomePhrase:
      config.welcomePhrase ||
      "Programa de fidelidade, operação e relacionamento em uma experiência só.",
  };

  const whatsappLink = branding.whatsappNumber
    ? `https://wa.me/${branding.whatsappNumber}?text=${encodeURIComponent(
        branding.whatsappMessage || "Olá! Vim pelo app da Voltta."
      )}`
    : "";

  const pendingCheckins = [];

  if (screen === "admin") {
    if (!adminAuth.isAuthenticated) {
      setScreen("access");
      return null;
    }

    return (
      <AdminPanel
        onBack={handleBackToAccess}
        onLogout={handleLogout}
        customers={customers}
        products={products}
        orders={orders}
        promos={promos}
        config={config}
        staffUsers={staffUsers}
        pendingCheckins={pendingCheckins}
        onApproveCheckin={async () => {}}
        onRejectCheckin={async () => {}}
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
        currentAdminUser={adminAuth.user}
      />
    );
  }

  if (screen === "customer" && customerWithPromos) {
    return (
      <div style={styles.appShell}>
        <CustomerDashboard
          customer={{
            ...customerWithPromos,
            nextRewardAt: config.spendGoal,
          }}
          progress={customerProgress}
          onBack={handleBackToAccess}
          onCheckin={handleCustomerCheckin}
          branding={branding}
          whatsappLink={whatsappLink}
        />
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <AccessHubScreen
        onCustomerEnter={handleEnterCustomer}
        onAdminLogin={handleAdminLogin}
        branding={branding}
      />
    </div>
  );
}

const styles = {
  appShell: {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.95) 0, rgba(255,255,255,0) 26%), radial-gradient(circle at bottom right, rgba(212,193,244,0.35) 0, rgba(212,193,244,0) 34%), linear-gradient(180deg, #f8f5ff 0%, #f1ebfb 52%, #ece3f8 100%)",
  },
};