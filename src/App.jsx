import { useAuth } from "./context/AuthContext";
import AdminPanel from "./screens/admin/AdminPanel";
import AccessHubScreen from "./screens/auth/AccessHubScreen";
import CustomerDashboard from "./screens/customer/CustomerDashboard";

export default function App() {
  const { loading, authenticated, isEmployee, isCustomer, profile, logout } = useAuth();

  if (loading) {
    return <div style={{ padding: 24 }}>Carregando...</div>;
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

const STORAGE_KEYS = {
  config: "savana_config",
  customers: "savana_customers",
  products: "savana_products",
  orders: "savana_orders",
  promos: "savana_promos",
  selectedCustomerId: "savana_selected_customer_id",
  branding: "savana_branding",
  staffUsers: "savana_staff_users",
  authSession: "savana_auth_session",
};

const initialConfig = {
  pointsPerReal: 10,
  spendGoal: 250,
  checkinPercent: 10,
};

const initialBranding = {
  softwareName: "Voltta",
  companyName: "Savana Açaí & Sorvetes",
  logoUrl: "",
  instagramUrl: "@savanaacai",
  whatsappNumber: "5575999990000",
  whatsappMessage: "Olá! Preciso de ajuda com meu acesso no app.",
  welcomePhrase: "Seu clube de vantagens com sabor de retorno.",
};

const initialCustomers = [
  {
    id: "c1",
    name: "Cliente Savana",
    phone: "75999990000",
    birth: "",
    pin: "1234",
    email: "cliente@savana.com",
    address: "Centro",
    tier: "Bronze",
    points: 180,
    totalSpent: 18,
    visits: 6,
    cashback: 12,
    isStaffLinked: false,
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
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "m2",
    title: "Monte seu açaí",
    type: "Destaque",
    description: "Escolha seus complementos favoritos e ganhe mais pontos.",
    image:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
  },
];

const initialStaffUsers = [
  {
    id: "s1",
    customerId: "c1",
    name: "Operador Savana",
    login: "001",
    phone: "75999990000",
    email: "equipe@savana.com",
    role: "Administrador",
    password: "1234",
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

function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}

function formatPhone(value = "") {
  const digits = digitsOnly(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return value;
}

function buildWhatsappLink(number, message) {
  const digits = digitsOnly(number);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || "")}`;
}

export default function App() {
  const [screen, setScreen] = useState("access");

  const [config, setConfig] = useState(() => readStorage(STORAGE_KEYS.config, initialConfig));
  const [customers, setCustomers] = useState(() => {
    const data = readStorage(STORAGE_KEYS.customers, initialCustomers);
    return data.map((customer) => ({
      ...customer,
      phone: digitsOnly(customer.phone),
    }));
  });
  const [products, setProducts] = useState(() => readStorage(STORAGE_KEYS.products, initialProducts));
  const [orders, setOrders] = useState(() => readStorage(STORAGE_KEYS.orders, initialOrders));
  const [promos, setPromos] = useState(() => readStorage(STORAGE_KEYS.promos, initialPromos));
  const [branding, setBranding] = useState(() => readStorage(STORAGE_KEYS.branding, initialBranding));
  const [staffUsers, setStaffUsers] = useState(() => {
    const data = readStorage(STORAGE_KEYS.staffUsers, initialStaffUsers);
    return data.map((user) => ({
      ...user,
      phone: digitsOnly(user.phone),
    }));
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState(() =>
    readStorage(STORAGE_KEYS.selectedCustomerId, "c1")
  );
  const [authSession, setAuthSession] = useState(() =>
    readStorage(STORAGE_KEYS.authSession, {
      customerId: "c1",
      employeeId: "",
      mode: "customer",
    })
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
    localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(branding));
  }, [branding]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.staffUsers, JSON.stringify(staffUsers));
  }, [staffUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.selectedCustomerId, JSON.stringify(selectedCustomerId));
  }, [selectedCustomerId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(authSession));
  }, [authSession]);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) || customers[0] || null;

  const loggedCustomer =
    customers.find((customer) => customer.id === authSession.customerId) || selectedCustomer || null;

  const customerProgress = useMemo(() => {
    if (!loggedCustomer) return 0;
    const goal = Number(config.spendGoal || 250);
    const spent = Number(loggedCustomer.totalSpent || 0);
    return Math.min((spent / goal) * 100, 100);
  }, [loggedCustomer, config]);

  const whatsappLink = buildWhatsappLink(
    branding.whatsappNumber,
    branding.whatsappMessage || "Olá! Preciso de ajuda com meu acesso."
  );

  const handleBackToAccess = () => setScreen("access");

  const handleCustomerLogin = ({ phone, pin }) => {
    const normalizedPhone = digitsOnly(phone);
    const normalizedPin = String(pin || "").trim();

    const customer = customers.find(
      (item) => digitsOnly(item.phone) === normalizedPhone && String(item.pin) === normalizedPin
    );

    if (!customer) {
      throw new Error("Telefone ou PIN inválido.");
    }

    setSelectedCustomerId(customer.id);
    setAuthSession({
      customerId: customer.id,
      employeeId: "",
      mode: "customer",
    });
    setScreen("customer");
  };

  const handleEnterAdmin = () => setScreen("admin");

  const handleCustomerLogout = () => {
    setAuthSession((prev) => ({ ...prev, customerId: "", mode: "customer" }));
    setScreen("access");
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
  };

  const handleAddCustomer = async (payload) => {
    const phone = digitsOnly(payload.phone);
    if (!phone) throw new Error("Informe um telefone válido.");
    const alreadyExists = customers.some((customer) => digitsOnly(customer.phone) === phone);
    if (alreadyExists) throw new Error("Já existe um cliente com esse telefone.");

    const newCustomer = {
      id: uid("c"),
      name: payload.name,
      phone,
      birth: payload.birth || "",
      pin: payload.pin,
      email: payload.email || "",
      address: payload.address || "",
      tier: payload.tier || "Bronze",
      points: 0,
      totalSpent: 0,
      visits: 0,
      cashback: 0,
      isStaffLinked: !!payload.isStaffLinked,
      coupons: [],
      promotions: [],
      history: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setSelectedCustomerId(newCustomer.id);
    return newCustomer;
  };

  const handleUpdateCustomer = async (payload) => {
    const phone = digitsOnly(payload.phone);
    if (!phone) throw new Error("Informe um telefone válido.");

    const alreadyExists = customers.some(
      (customer) => customer.id !== payload.id && digitsOnly(customer.phone) === phone
    );
    if (alreadyExists) throw new Error("Esse telefone já está em uso por outro cliente.");

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === payload.id
          ? {
              ...customer,
              name: payload.name,
              phone,
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
    setStaffUsers((prev) => prev.filter((user) => user.customerId !== customerId));

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
    setConfig({
      pointsPerReal: Number(payload.pointsPerReal || 10),
      spendGoal: Number(payload.spendGoal || 250),
      checkinPercent: Number(payload.checkinPercent || 10),
    });

    setBranding((prev) => ({
      ...prev,
      softwareName: payload.softwareName || prev.softwareName,
      companyName: payload.companyName || prev.companyName,
      logoUrl: payload.logoUrl ?? prev.logoUrl,
      instagramUrl: payload.instagramUrl ?? prev.instagramUrl,
      whatsappNumber: digitsOnly(payload.whatsappNumber || prev.whatsappNumber),
      whatsappMessage: payload.whatsappMessage ?? prev.whatsappMessage,
      welcomePhrase: payload.welcomePhrase ?? prev.welcomePhrase,
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
    if (!loggedCustomer) return;

    const coupon = {
      id: uid("cp"),
      title: `${config.checkinPercent}% no check-in`,
      code: `CHECKIN${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      percent: Number(config.checkinPercent || 10),
      active: true,
    };

    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== loggedCustomer.id) return customer;

        return {
          ...customer,
          points: Number(customer.points || 0) + 10,
          visits: Number(customer.visits || 0) + 1,
          coupons: [coupon, ...(customer.coupons || [])],
        };
      })
    );
  };

  const handleAddStaffUser = async (payload) => {
    const phone = digitsOnly(payload.phone);
    if (!phone) throw new Error("Informe um telefone válido para o funcionário.");

    const existingStaff = staffUsers.some((user) => digitsOnly(user.phone) === phone);
    if (existingStaff) throw new Error("Já existe um funcionário com esse telefone.");

    let linkedCustomer =
      customers.find((customer) => digitsOnly(customer.phone) === phone) || null;

    if (!linkedCustomer && payload.createCustomerAccount) {
      linkedCustomer = {
        id: uid("c"),
        name: payload.name,
        phone,
        birth: payload.birth || "",
        pin: payload.customerPin || payload.password || "1234",
        email: payload.email || "",
        address: payload.address || "",
        tier: "Bronze",
        points: 0,
        totalSpent: 0,
        visits: 0,
        cashback: 0,
        isStaffLinked: true,
        coupons: [],
        promotions: [],
        history: [],
      };

      setCustomers((prev) => [linkedCustomer, ...prev]);
    }

    const newStaffUser = {
      id: uid("s"),
      customerId: linkedCustomer?.id || "",
      name: payload.name,
      login: payload.login,
      phone,
      email: payload.email || "",
      role: payload.role || "Funcionário",
      password: payload.password,
    };

    setStaffUsers((prev) => [newStaffUser, ...prev]);
    return newStaffUser;
  };

  const handleDeleteStaffUser = async (staffId) => {
    setStaffUsers((prev) => prev.filter((user) => user.id !== staffId));
  };

  if (screen === "admin") {
    return (
      <AdminPanel
        onBack={handleBackToAccess}
        onLogout={handleBackToAccess}
        customers={customers.map((customer) => ({
          ...customer,
          phone: formatPhone(customer.phone),
        }))}
        products={products}
        orders={orders}
        promos={promos}
        config={config}
        branding={branding}
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
        staffUsers={staffUsers.map((user) => ({
          ...user,
          phone: formatPhone(user.phone),
        }))}
        onAddStaffUser={handleAddStaffUser}
        onDeleteStaffUser={handleDeleteStaffUser}
        pendingCheckins={[]}
        onApproveCheckin={async () => {}}
        onRejectCheckin={async () => {}}
        whatsappLink={whatsappLink}
      />
    );
  }

  if (screen === "customer" && loggedCustomer) {
    return (
      <div style={styles.appShell}>
        <CustomerDashboard
          customer={{
            ...loggedCustomer,
            phone: formatPhone(loggedCustomer.phone),
            nextRewardAt: config.spendGoal,
            progress: customerProgress,
          }}
          promos={promos}
          branding={branding}
          settings={config}
          onBack={handleBackToAccess}
          onLogout={handleCustomerLogout}
          onCheckin={handleCustomerCheckin}
          recoveryWhatsappLink={whatsappLink}
        />
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <AccessHubScreen
        branding={branding}
        onCustomerLogin={handleCustomerLogin}
        onEmployeeEnter={handleEnterAdmin}
        customers={customers}
        whatsappLink={whatsappLink}
      />
    </div>
  );
}

const styles = {
  appShell: {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.92) 0, rgba(255,255,255,0) 26%), radial-gradient(circle at bottom right, rgba(212,193,244,0.34) 0, rgba(212,193,244,0) 34%), linear-gradient(180deg, #f8f5ff 0, #f2ebfb 52%, #ece3f8 100%)",
  },
};

export { digitsOnly, formatPhone };