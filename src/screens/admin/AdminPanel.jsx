import { useEffect, useMemo, useState } from "react";

const accent = "#6f3cc3";
const accentDark = "#4f2a93";
const accentSoft = "#f2ebff";
const border = "#e9ddf6";
const ink = "#261f35";
const muted = "#746786";
const bg = "#f6f3fb";
const white = "#ffffff";
const success = "#238a57";
const danger = "#cf4d6f";
const warning = "#d48a1f";

const tabs = [
  { id: "overview", label: "Visão geral" },
  { id: "customers", label: "Clientes" },
  { id: "products", label: "Produtos" },
  { id: "promos", label: "Promoções" },
  { id: "orders", label: "Pedidos" },
  { id: "checkins", label: "Check-ins" },
  { id: "settings", label: "Configurações" },
  { id: "team", label: "Equipe" },
];

const emptyCustomerForm = {
  id: "",
  name: "",
  phone: "",
  birth: "",
  pin: "",
  email: "",
  address: "",
  tier: "Bronze",
};

const emptyProductForm = {
  id: "",
  name: "",
  category: "",
  price: "",
  description: "",
  available: true,
};

const emptyPromoForm = {
  id: "",
  title: "",
  type: "",
  description: "",
  image: "",
};

const emptyOrderForm = {
  customerId: "",
  productId: "",
  channel: "Balcão",
  status: "Recebido",
  total: "",
  note: "",
};

const emptyBonusForm = {
  customerId: "",
  points: "",
};

const emptyStaffForm = {
  id: "",
  name: "",
  login: "",
  role: "Funcionário",
  password: "",
  email: "",
  phone: "",
  cpf: "",
  status: "Ativo",
  notes: "",
};

export default function AdminPanel({
  onBack,
  onLogout,
  customers = [],
  products = [],
  orders = [],
  promos = [],
  config = {},
  staffUsers = [],
  pendingCheckins = [],
  onApproveCheckin,
  onRejectCheckin,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddOrder,
  onAddPromo,
  onUpdatePromo,
  onDeletePromo,
  onAddBonus,
  onSaveConfig,
  onAddStaffUser,
  onUpdateStaffUser,
  onDeleteStaffUser,
  branding = {},
  whatsappLink = "",
  currentAdminUser = null,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [isTablet, setIsTablet] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 1180 : false
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 820 : false
  );

  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [promoForm, setPromoForm] = useState(emptyPromoForm);
  const [orderForm, setOrderForm] = useState({
    ...emptyOrderForm,
    customerId: selectedCustomerId || customers[0]?.id || "",
  });
  const [bonusForm, setBonusForm] = useState({
    ...emptyBonusForm,
    customerId: selectedCustomerId || customers[0]?.id || "",
  });
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [settingsForm, setSettingsForm] = useState({
    pointsPerReal: String(config.pointsPerReal || 10),
    spendGoal: String(config.spendGoal || 250),
    checkinPercent: String(config.checkinPercent || 10),
    softwareName: branding.softwareName || "Clube Base",
    companyName: branding.companyName || "Minha Loja",
    logoUrl: branding.logoUrl || "",
    instagramUrl: branding.instagramUrl || "",
    whatsappNumber: branding.whatsappNumber || "",
    whatsappMessage: branding.whatsappMessage || "Olá! Vim pelo app.",
    welcomePhrase: branding.welcomePhrase || "Seu clube de pontos da loja.",
  });

  useEffect(() => {
    const onResize = () => {
      setIsTablet(window.innerWidth <= 1180);
      setIsMobile(window.innerWidth <= 820);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      customerId: prev.customerId || selectedCustomerId || customers[0]?.id || "",
    }));

    setBonusForm((prev) => ({
      ...prev,
      customerId: prev.customerId || selectedCustomerId || customers[0]?.id || "",
    }));
  }, [selectedCustomerId, customers]);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ||
    customers[0] ||
    null;

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalPoints = customers.reduce((sum, item) => sum + Number(item.points || 0), 0);
    const totalCoupons = customers.reduce(
      (sum, item) =>
        sum +
        (Array.isArray(item.coupons)
          ? item.coupons.filter((coupon) => coupon.active).length
          : 0),
      0
    );

    return {
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalPromos: promos.length,
      totalOrders: orders.length,
      totalRevenue,
      totalPoints,
      totalCoupons,
      pendingCheckins: pendingCheckins.length,
      totalTeam: staffUsers.length,
    };
  }, [customers, products, promos, orders, pendingCheckins, staffUsers]);

  function showSuccess(text) {
    setNotice({ type: "success", text });
  }

  function showError(error) {
    setNotice({
      type: "error",
      text: error?.message || "Não foi possível concluir a ação.",
    });
  }

  async function runTask(key, action, successText) {
    try {
      setBusy(key);
      setNotice({ type: "", text: "" });
      await action();
      if (successText) showSuccess(successText);
    } catch (error) {
      showError(error);
    } finally {
      setBusy("");
    }
  }

  function resetCustomerForm() {
    setCustomerForm(emptyCustomerForm);
  }

  function resetProductForm() {
    setProductForm(emptyProductForm);
  }

  function resetPromoForm() {
    setPromoForm(emptyPromoForm);
  }

  function resetOrderForm() {
    setOrderForm({
      ...emptyOrderForm,
      customerId: selectedCustomerId || customers[0]?.id || "",
    });
  }

  function resetBonusForm() {
    setBonusForm({
      ...emptyBonusForm,
      customerId: selectedCustomerId || customers[0]?.id || "",
    });
  }

  function resetStaffForm() {
    setStaffForm(emptyStaffForm);
  }

  function handleEditCustomer(customer) {
    setCustomerForm({
      id: customer.id,
      name: customer.name || "",
      phone: customer.phone || "",
      birth: customer.birth || "",
      pin: customer.pin || "",
      email: customer.email || "",
      address: customer.address || "",
      tier: customer.tier || "Bronze",
    });
    setActiveTab("customers");
  }

  function handleEditProduct(product) {
    setProductForm({
      id: product.id,
      name: product.name || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      description: product.description || "",
      available: !!product.available,
    });
    setActiveTab("products");
  }

  function handleEditPromo(promo) {
    setPromoForm({
      id: promo.id,
      title: promo.title || "",
      type: promo.type || "",
      description: promo.description || "",
      image: promo.image || "",
    });
    setActiveTab("promos");
  }

  function handleEditStaff(user) {
    setStaffForm({
      id: user.id,
      name: user.name || "",
      login: user.login || "",
      role: user.role || "Funcionário",
      password: user.password || "",
      email: user.email || "",
      phone: user.phone || "",
      cpf: user.cpf || "",
      status: user.status || "Ativo",
      notes: user.notes || "",
    });
    setActiveTab("team");
  }

  async function submitCustomer(event) {
    event.preventDefault();

    if (!customerForm.name || !customerForm.phone || !customerForm.pin) {
      showError(new Error("Preencha nome, telefone e PIN do cliente."));
      return;
    }

    const payload = {
      ...customerForm,
      phone: customerForm.phone.trim(),
      pin: customerForm.pin.trim(),
    };

    if (customerForm.id) {
      await runTask(
        "save-customer",
        async () => {
          await onUpdateCustomer(payload);
          resetCustomerForm();
        },
        "Cliente atualizado com sucesso."
      );
      return;
    }

    await runTask(
      "save-customer",
      async () => {
        await onAddCustomer(payload);
        resetCustomerForm();
      },
      "Cliente cadastrado com sucesso."
    );
  }

  async function submitProduct(event) {
    event.preventDefault();

    if (!productForm.name || !productForm.category || !productForm.price) {
      showError(new Error("Preencha nome, categoria e preço do produto."));
      return;
    }

    const payload = {
      ...productForm,
      price: Number(productForm.price || 0),
    };

    if (productForm.id) {
      await runTask(
        "save-product",
        async () => {
          await onUpdateProduct(payload);
          resetProductForm();
        },
        "Produto atualizado com sucesso."
      );
      return;
    }

    await runTask(
      "save-product",
      async () => {
        await onAddProduct(payload);
        resetProductForm();
      },
      "Produto cadastrado com sucesso."
    );
  }

  async function submitPromo(event) {
    event.preventDefault();

    if (!promoForm.title || !promoForm.description) {
      showError(new Error("Preencha título e descrição da promoção."));
      return;
    }

    const payload = { ...promoForm };

    if (promoForm.id) {
      await runTask(
        "save-promo",
        async () => {
          await onUpdatePromo(payload);
          resetPromoForm();
        },
        "Promoção atualizada com sucesso."
      );
      return;
    }

    await runTask(
      "save-promo",
      async () => {
        await onAddPromo(payload);
        resetPromoForm();
      },
      "Promoção cadastrada com sucesso."
    );
  }

  async function submitOrder(event) {
    event.preventDefault();

    if (!orderForm.customerId || !orderForm.productId || !orderForm.total) {
      showError(new Error("Preencha cliente, produto e valor do pedido."));
      return;
    }

    await runTask(
      "save-order",
      async () => {
        await onAddOrder({
          ...orderForm,
          total: Number(orderForm.total || 0),
        });
        resetOrderForm();
      },
      "Pedido registrado com sucesso."
    );
  }

  async function submitBonus(event) {
    event.preventDefault();

    if (!bonusForm.customerId || !bonusForm.points) {
      showError(new Error("Escolha um cliente e informe os pontos do bônus."));
      return;
    }

    await runTask(
      "save-bonus",
      async () => {
        await onAddBonus({
          customerId: bonusForm.customerId,
          points: Number(bonusForm.points || 0),
        });
        resetBonusForm();
      },
      "Bônus aplicado com sucesso."
    );
  }

  async function submitSettings(event) {
    event.preventDefault();

    await runTask(
      "save-settings",
      async () => {
        await onSaveConfig({
          pointsPerReal: Number(settingsForm.pointsPerReal || 10),
          spendGoal: Number(settingsForm.spendGoal || 250),
          checkinPercent: Number(settingsForm.checkinPercent || 10),
          softwareName: settingsForm.softwareName,
          companyName: settingsForm.companyName,
          logoUrl: settingsForm.logoUrl,
          instagramUrl: settingsForm.instagramUrl,
          whatsappNumber: settingsForm.whatsappNumber,
          whatsappMessage: settingsForm.whatsappMessage,
          welcomePhrase: settingsForm.welcomePhrase,
        });
      },
      "Configurações salvas com sucesso."
    );
  }

  async function submitStaff(event) {
    event.preventDefault();

    if (!staffForm.name || !staffForm.login || !staffForm.password) {
      showError(new Error("Preencha nome, login e senha da equipe."));
      return;
    }

    const payload = {
      id: staffForm.id,
      name: staffForm.name.trim(),
      login: staffForm.login.trim(),
      role: staffForm.role,
      password: staffForm.password.trim(),
      email: staffForm.email.trim(),
      phone: staffForm.phone.trim(),
      cpf: staffForm.cpf.trim(),
      status: staffForm.status,
      notes: staffForm.notes.trim(),
    };

    if (staffForm.id) {
      await runTask(
        "save-staff",
        async () => {
          await onUpdateStaffUser(payload);
          resetStaffForm();
        },
        "Usuário da equipe atualizado."
      );
      return;
    }

    await runTask(
      "save-staff",
      async () => {
        await onAddStaffUser(payload);
        resetStaffForm();
      },
      "Usuário da equipe adicionado."
    );
  }

  function sectionTitle(title, subtitle) {
    return (
      <div style={styles.sectionHeading}>
        <div style={{ minWidth: 0 }}>
          <h2 style={styles.sectionTitle}>{title}</h2>
          <p style={styles.sectionSubtitle}>{subtitle}</p>
        </div>
      </div>
    );
  }

  function renderOverview() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Painel da loja",
          "Resumo da operação, marca da loja e visão rápida dos principais indicadores."
        )}

        <div
          style={{
            ...styles.brandHero,
            gridTemplateColumns: isTablet ? "1fr" : "1.2fr 0.8fr",
          }}
        >
          <div style={styles.brandHeroCard}>
            <div style={styles.brandHeroTop}>
              <div style={styles.heroLogo}>
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo da loja" style={styles.heroLogoImage} />
                ) : (
                  <span style={styles.heroLogoFallback}>
                    {(branding.companyName || "L").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <p style={styles.heroSoftwareName}>{branding.softwareName || "Clube Base"}</p>
                <h3 style={styles.heroStoreName}>{branding.companyName || "Minha Loja"}</h3>
                <p style={styles.heroStoreSlogan}>
                  {branding.welcomePhrase || "Seu clube de pontos da loja."}
                </p>
              </div>
            </div>

            <div style={styles.heroBadges}>
              <span style={styles.heroBadge}>Marca personalizável</span>
              <span style={styles.heroBadge}>Logo da loja</span>
              <span style={styles.heroBadge}>Experiência cliente + painel</span>
            </div>
          </div>

          <div style={styles.brandSideCard}>
            <p style={styles.sideMetaLabel}>Administrador atual</p>
            <strong style={styles.sideMetaValue}>
              {currentAdminUser?.name || "Sem usuário"}
            </strong>

            <div style={styles.sideMetaList}>
              <InfoMini label="Login" value={currentAdminUser?.login || "-"} />
              <InfoMini label="Perfil" value={currentAdminUser?.role || "-"} />
              <InfoMini label="Status" value={currentAdminUser?.status || "Ativo"} />
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(190px, 1fr))",
          }}
        >
          <StatCard label="Clientes" value={stats.totalCustomers} helper="Base cadastrada" />
          <StatCard label="Produtos" value={stats.totalProducts} helper="Catálogo ativo" />
          <StatCard label="Promoções" value={stats.totalPromos} helper="Campanhas visíveis" />
          <StatCard label="Pedidos" value={stats.totalOrders} helper="Movimento total" />
          <StatCard label="Faturamento" value={formatCurrency(stats.totalRevenue)} helper="Soma dos pedidos" />
          <StatCard label="Pontos" value={stats.totalPoints} helper="Saldo distribuído" />
          <StatCard label="Cupons ativos" value={stats.totalCoupons} helper="Clientes com benefício" />
          <StatCard label="Equipe" value={stats.totalTeam} helper="Acessos cadastrados" />
        </div>

        <div style={getDualLayout(isTablet)}>
          <Card>
            <h3 style={styles.cardTitle}>Cliente em destaque</h3>
            {selectedCustomer ? (
              <div style={styles.infoList}>
                <InfoRow label="Nome" value={selectedCustomer.name} />
                <InfoRow label="Telefone" value={selectedCustomer.phone || "-"} />
                <InfoRow label="Pontos" value={selectedCustomer.points || 0} />
                <InfoRow label="Gasto total" value={formatCurrency(selectedCustomer.totalSpent || 0)} />
                <InfoRow label="Visitas" value={selectedCustomer.visits || 0} />
                <InfoRow label="Nível" value={selectedCustomer.tier || "Bronze"} />
              </div>
            ) : (
              <EmptyState text="Nenhum cliente selecionado no momento." />
            )}
          </Card>

          <Card>
            <h3 style={styles.cardTitle}>Atalhos rápidos</h3>
            <div style={styles.quickActions}>
              <QuickActionButton label="Cadastrar cliente" onClick={() => setActiveTab("customers")} />
              <QuickActionButton label="Registrar pedido" onClick={() => setActiveTab("orders")} />
              <QuickActionButton label="Gerenciar equipe" onClick={() => setActiveTab("team")} />
              <QuickActionButton label="Editar branding" onClick={() => setActiveTab("settings")} />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function renderCustomers() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Clientes",
          "Cadastre, edite, selecione e acompanhe a base de clientes da loja."
        )}

        <div style={getDualLayout(isTablet)}>
          <Card>
            <h3 style={styles.cardTitle}>
              {customerForm.id ? "Editar cliente" : "Novo cliente"}
            </h3>

            <form onSubmit={submitCustomer} style={getFormGridStyle(isMobile)}>
              <Field label="Nome completo">
                <input
                  style={styles.input}
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </Field>

              <Field label="Telefone">
                <input
                  style={styles.input}
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(75) 99999-0000"
                />
              </Field>

              <Field label="PIN">
                <input
                  style={styles.input}
                  value={customerForm.pin}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, pin: e.target.value }))}
                  placeholder="1234"
                />
              </Field>

              <Field label="Nascimento">
                <input
                  type="date"
                  style={styles.input}
                  value={customerForm.birth}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, birth: e.target.value }))}
                />
              </Field>

              <Field label="E-mail">
                <input
                  style={styles.input}
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="cliente@email.com"
                />
              </Field>

              <Field label="Nível">
                <select
                  style={styles.input}
                  value={customerForm.tier}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, tier: e.target.value }))}
                >
                  <option>Bronze</option>
                  <option>Prata</option>
                  <option>Ouro</option>
                </select>
              </Field>

              <Field label="Endereço" full>
                <input
                  style={styles.input}
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Bairro, rua ou referência"
                />
              </Field>

              <div style={styles.actionsRowFull}>
                <button type="submit" style={styles.primaryButton} disabled={busy === "save-customer"}>
                  {busy === "save-customer"
                    ? "Salvando..."
                    : customerForm.id
                    ? "Atualizar cliente"
                    : "Salvar cliente"}
                </button>

                <button type="button" style={styles.secondaryButton} onClick={resetCustomerForm}>
                  Limpar formulário
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 style={styles.cardTitle}>Aplicar bônus</h3>

            <form onSubmit={submitBonus} style={getFormGridStyle(true)}>
              <Field label="Cliente" full>
                <select
                  style={styles.input}
                  value={bonusForm.customerId}
                  onChange={(e) => setBonusForm((prev) => ({ ...prev, customerId: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Pontos" full>
                <input
                  style={styles.input}
                  value={bonusForm.points}
                  onChange={(e) => setBonusForm((prev) => ({ ...prev, points: e.target.value }))}
                  placeholder="Ex.: 50"
                />
              </Field>

              <div style={styles.actionsRowFull}>
                <button type="submit" style={styles.primaryButton} disabled={busy === "save-bonus"}>
                  {busy === "save-bonus" ? "Aplicando..." : "Aplicar bônus"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        <Card>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Lista de clientes</h3>
            <span style={styles.miniBadge}>{customers.length} cadastrados</span>
          </div>

          {!customers.length ? (
            <EmptyState text="Nenhum cliente cadastrado ainda." />
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Telefone</th>
                    <th style={styles.th}>Pontos</th>
                    <th style={styles.th}>Visitas</th>
                    <th style={styles.th}>Nível</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const isSelectedRow = customer.id === selectedCustomerId;
                    return (
                      <tr key={customer.id} style={isSelectedRow ? styles.selectedRow : undefined}>
                        <td style={styles.td}>{customer.name}</td>
                        <td style={styles.td}>{customer.phone || "-"}</td>
                        <td style={styles.td}>{customer.points || 0}</td>
                        <td style={styles.td}>{customer.visits || 0}</td>
                        <td style={styles.td}>{customer.tier || "Bronze"}</td>
                        <td style={styles.td}>
                          <div style={styles.inlineActions}>
                            <button
                              type="button"
                              style={styles.ghostButton}
                              onClick={() => onSelectCustomer(customer.id)}
                            >
                              Selecionar
                            </button>
                            <button
                              type="button"
                              style={styles.ghostButton}
                              onClick={() => handleEditCustomer(customer)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              style={styles.dangerButton}
                              onClick={() =>
                                runTask(
                                  `delete-customer-${customer.id}`,
                                  async () => onDeleteCustomer(customer.id),
                                  "Cliente removido com sucesso."
                                )
                              }
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Produtos",
          "Organize o catálogo da loja com preço, categoria e disponibilidade."
        )}

        <div style={getDualLayout(isTablet)}>
          <Card>
            <h3 style={styles.cardTitle}>
              {productForm.id ? "Editar produto" : "Novo produto"}
            </h3>

            <form onSubmit={submitProduct} style={getFormGridStyle(isMobile)}>
              <Field label="Nome">
                <input
                  style={styles.input}
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Açaí 500 ml"
                />
              </Field>

              <Field label="Categoria">
                <input
                  style={styles.input}
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="Açaí"
                />
              </Field>

              <Field label="Preço">
                <input
                  style={styles.input}
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="18"
                />
              </Field>

              <Field label="Disponível">
                <select
                  style={styles.input}
                  value={String(productForm.available)}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      available: e.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </Field>

              <Field label="Descrição" full>
                <textarea
                  style={styles.textarea}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descreva rapidamente o produto"
                />
              </Field>

              <div style={styles.actionsRowFull}>
                <button type="submit" style={styles.primaryButton} disabled={busy === "save-product"}>
                  {busy === "save-product"
                    ? "Salvando..."
                    : productForm.id
                    ? "Atualizar produto"
                    : "Salvar produto"}
                </button>

                <button type="button" style={styles.secondaryButton} onClick={resetProductForm}>
                  Limpar formulário
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 style={styles.cardTitle}>Resumo do catálogo</h3>
            <div style={styles.infoList}>
              <InfoRow label="Produtos ativos" value={products.filter((item) => item.available).length} />
              <InfoRow
                label="Produtos indisponíveis"
                value={products.filter((item) => !item.available).length}
              />
              <InfoRow
                label="Preço médio"
                value={
                  products.length
                    ? formatCurrency(
                        products.reduce((sum, item) => sum + Number(item.price || 0), 0) /
                          products.length
                      )
                    : "R$ 0,00"
                }
              />
            </div>
          </Card>
        </div>

        <Card>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Lista de produtos</h3>
            <span style={styles.miniBadge}>{products.length} itens</span>
          </div>

          {!products.length ? (
            <EmptyState text="Nenhum produto cadastrado ainda." />
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Produto</th>
                    <th style={styles.th}>Categoria</th>
                    <th style={styles.th}>Preço</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td style={styles.td}>{product.name}</td>
                      <td style={styles.td}>{product.category}</td>
                      <td style={styles.td}>{formatCurrency(product.price || 0)}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: product.available ? "#ebf7ef" : "#fff4ea",
                            color: product.available ? success : warning,
                          }}
                        >
                          {product.available ? "Disponível" : "Indisponível"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.inlineActions}>
                          <button
                            type="button"
                            style={styles.ghostButton}
                            onClick={() => handleEditProduct(product)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            style={styles.dangerButton}
                            onClick={() =>
                              runTask(
                                `delete-product-${product.id}`,
                                async () => onDeleteProduct(product.id),
                                "Produto excluído com sucesso."
                              )
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderPromos() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Promoções",
          "Gerencie campanhas, banners internos e textos promocionais da loja."
        )}

        <div style={getDualLayout(isTablet)}>
          <Card>
            <h3 style={styles.cardTitle}>
              {promoForm.id ? "Editar promoção" : "Nova promoção"}
            </h3>

            <form onSubmit={submitPromo} style={getFormGridStyle(isMobile)}>
              <Field label="Título">
                <input
                  style={styles.input}
                  value={promoForm.title}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Happy Hour Savana"
                />
              </Field>

              <Field label="Tipo">
                <input
                  style={styles.input}
                  value={promoForm.type}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, type: e.target.value }))}
                  placeholder="Campanha"
                />
              </Field>

              <Field label="Imagem (URL)" full>
                <input
                  style={styles.input}
                  value={promoForm.image}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </Field>

              <Field label="Descrição" full>
                <textarea
                  style={styles.textarea}
                  value={promoForm.description}
                  onChange={(e) =>
                    setPromoForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Explique a promoção de forma clara"
                />
              </Field>

              <div style={styles.actionsRowFull}>
                <button type="submit" style={styles.primaryButton} disabled={busy === "save-promo"}>
                  {busy === "save-promo"
                    ? "Salvando..."
                    : promoForm.id
                    ? "Atualizar promoção"
                    : "Salvar promoção"}
                </button>

                <button type="button" style={styles.secondaryButton} onClick={resetPromoForm}>
                  Limpar formulário
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 style={styles.cardTitle}>Resumo promocional</h3>
            <div style={styles.infoList}>
              <InfoRow label="Promoções ativas" value={promos.length} />
              <InfoRow label="Nome da loja" value={branding.companyName || "-"} />
              <InfoRow label="Slogan" value={branding.welcomePhrase || "-"} />
            </div>
          </Card>
        </div>

        <Card>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Lista de promoções</h3>
            <span style={styles.miniBadge}>{promos.length} campanhas</span>
          </div>

          {!promos.length ? (
            <EmptyState text="Nenhuma promoção cadastrada ainda." />
          ) : (
            <div
              style={{
                ...styles.promoGrid,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {promos.map((promo) => (
                <div key={promo.id} style={styles.promoCard}>
                  <div style={styles.promoContent}>
                    <div style={styles.promoTop}>
                      <span style={styles.promoTag}>{promo.type || "Promoção"}</span>
                    </div>
                    <h4 style={styles.promoTitle}>{promo.title}</h4>
                    <p style={styles.promoText}>{promo.description}</p>
                    <div style={styles.inlineActions}>
                      <button
                        type="button"
                        style={styles.ghostButton}
                        onClick={() => handleEditPromo(promo)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        style={styles.dangerButton}
                        onClick={() =>
                          runTask(
                            `delete-promo-${promo.id}`,
                            async () => onDeletePromo(promo.id),
                            "Promoção excluída com sucesso."
                          )
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Pedidos",
          "Registre vendas e atualize automaticamente os pontos do cliente."
        )}

        <div style={getDualLayout(isTablet)}>
          <Card>
            <h3 style={styles.cardTitle}>Novo pedido</h3>

            <form onSubmit={submitOrder} style={getFormGridStyle(isMobile)}>
              <Field label="Cliente" full>
                <select
                  style={styles.input}
                  value={orderForm.customerId}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, customerId: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Produto" full>
                <select
                  style={styles.input}
                  value={orderForm.productId}
                  onChange={(e) => {
                    const productId = e.target.value;
                    const product = products.find((item) => item.id === productId);
                    setOrderForm((prev) => ({
                      ...prev,
                      productId,
                      total: product ? String(product.price || "") : prev.total,
                    }));
                  }}
                >
                  <option value="">Selecione</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Canal">
                <select
                  style={styles.input}
                  value={orderForm.channel}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, channel: e.target.value }))}
                >
                  <option>Balcão</option>
                  <option>WhatsApp</option>
                  <option>Entrega</option>
                </select>
              </Field>

              <Field label="Status">
                <select
                  style={styles.input}
                  value={orderForm.status}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option>Recebido</option>
                  <option>Em preparo</option>
                  <option>Finalizado</option>
                </select>
              </Field>

              <Field label="Valor">
                <input
                  style={styles.input}
                  value={orderForm.total}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, total: e.target.value }))}
                  placeholder="18"
                />
              </Field>

              <Field label="Observação" full>
                <textarea
                  style={styles.textarea}
                  value={orderForm.note}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Ex.: sem banana"
                />
              </Field>

              <div style={styles.actionsRowFull}>
                <button type="submit" style={styles.primaryButton} disabled={busy === "save-order"}>
                  {busy === "save-order" ? "Registrando..." : "Salvar pedido"}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 style={styles.cardTitle}>Indicadores do caixa</h3>
            <div style={styles.infoList}>
              <InfoRow label="Pedidos totais" value={orders.length} />
              <InfoRow
                label="Ticket médio"
                value={
                  orders.length
                    ? formatCurrency(
                        orders.reduce((sum, item) => sum + Number(item.total || 0), 0) /
                          orders.length
                      )
                    : "R$ 0,00"
                }
              />
              <InfoRow
                label="Faturamento"
                value={formatCurrency(
                  orders.reduce((sum, item) => sum + Number(item.total || 0), 0)
                )}
              />
            </div>
          </Card>
        </div>

        <Card>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Lista de pedidos</h3>
            <span style={styles.miniBadge}>{orders.length} registros</span>
          </div>

          {!orders.length ? (
            <EmptyState text="Nenhum pedido registrado ainda." />
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Produto</th>
                    <th style={styles.th}>Canal</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={styles.td}>{order.customerName || "-"}</td>
                      <td style={styles.td}>{order.productName || "-"}</td>
                      <td style={styles.td}>{order.channel || "-"}</td>
                      <td style={styles.td}>{order.status || "-"}</td>
                      <td style={styles.td}>{formatCurrency(order.total || 0)}</td>
                      <td style={styles.td}>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderCheckins() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Check-ins pendentes",
          "Confira o Story no balcão e aprove ou recuse o benefício do cliente."
        )}

        <Card>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Solicitações aguardando equipe</h3>
            <span style={styles.miniBadge}>{pendingCheckins.length} pendentes</span>
          </div>

          {!pendingCheckins.length ? (
            <EmptyState text="Nenhum check-in aguardando aprovação agora." />
          ) : (
            <div style={styles.checkinList}>
              {pendingCheckins.map((item) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.checkinCard,
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong style={styles.checkinName}>
                      {item.customers?.full_name || "Cliente"}
                    </strong>
                    <p style={styles.checkinMeta}>Telefone: {item.customers?.phone || "-"}</p>
                    <p style={styles.checkinMeta}>
                      Solicitado em: {formatDate(item.requested_at, true)}
                    </p>
                    <p style={styles.checkinMeta}>
                      Instagram: {item.instagram_handle || branding.instagramUrl || "-"}
                    </p>
                  </div>

                  <div style={styles.inlineActions}>
                    <button
                      type="button"
                      style={styles.primaryButton}
                      disabled={busy === `approve-checkin-${item.id}`}
                      onClick={() =>
                        runTask(
                          `approve-checkin-${item.id}`,
                          async () => onApproveCheckin?.(item),
                          "Check-in aprovado com sucesso."
                        )
                      }
                    >
                      Aprovar
                    </button>

                    <button
                      type="button"
                      style={styles.dangerButton}
                      disabled={busy === `reject-checkin-${item.id}`}
                      onClick={() =>
                        runTask(
                          `reject-checkin-${item.id}`,
                          async () => onRejectCheckin?.(item),
                          "Check-in recusado."
                        )
                      }
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Configurações",
          "Ajuste pontuação, meta, nome da loja, logo, slogan e canais da marca."
        )}

        <Card>
          <h3 style={styles.cardTitle}>Marca, experiência e regras da loja</h3>

          <form onSubmit={submitSettings} style={getFormGridStyle(isMobile)}>
            <Field label="Pontos por real">
              <input
                style={styles.input}
                value={settingsForm.pointsPerReal}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, pointsPerReal: e.target.value }))
                }
              />
            </Field>

            <Field label="Meta de recompensa">
              <input
                style={styles.input}
                value={settingsForm.spendGoal}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, spendGoal: e.target.value }))
                }
              />
            </Field>

            <Field label="Desconto do check-in (%)">
              <input
                style={styles.input}
                value={settingsForm.checkinPercent}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, checkinPercent: e.target.value }))
                }
              />
            </Field>

            <Field label="Nome do software">
              <input
                style={styles.input}
                value={settingsForm.softwareName}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, softwareName: e.target.value }))
                }
                placeholder="Ex.: Clube Base"
              />
            </Field>

            <Field label="Nome da loja">
              <input
                style={styles.input}
                value={settingsForm.companyName}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, companyName: e.target.value }))
                }
                placeholder="Ex.: Savana Açaí"
              />
            </Field>

            <Field label="Logo da loja (URL)">
              <input
                style={styles.input}
                value={settingsForm.logoUrl}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, logoUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </Field>

            <Field label="Instagram">
              <input
                style={styles.input}
                value={settingsForm.instagramUrl}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, instagramUrl: e.target.value }))
                }
                placeholder="@minhaloja"
              />
            </Field>

            <Field label="WhatsApp">
              <input
                style={styles.input}
                value={settingsForm.whatsappNumber}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                }
                placeholder="5575999999999"
              />
            </Field>

            <Field label="Mensagem do WhatsApp" full>
              <textarea
                style={styles.textarea}
                value={settingsForm.whatsappMessage}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, whatsappMessage: e.target.value }))
                }
              />
            </Field>

            <Field label="Slogan / frase principal da loja" full>
              <textarea
                style={styles.textarea}
                value={settingsForm.welcomePhrase}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, welcomePhrase: e.target.value }))
                }
                placeholder="Ex.: Seu clube de pontos da loja."
              />
            </Field>

            <div style={styles.actionsRowFull}>
              <button type="submit" style={styles.primaryButton} disabled={busy === "save-settings"}>
                {busy === "save-settings" ? "Salvando..." : "Salvar configurações"}
              </button>

              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.linkButton}
                >
                  Abrir WhatsApp
                </a>
              ) : null}
            </div>
          </form>

          <div style={styles.previewCard}>
            <div style={styles.previewLogo}>
              {settingsForm.logoUrl ? (
                <img src={settingsForm.logoUrl} alt="Prévia do logo" style={styles.previewLogoImage} />
              ) : (
                <span style={styles.previewLogoFallback}>
                  {(settingsForm.companyName || "L").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <p style={styles.previewEyebrow}>{settingsForm.softwareName || "Clube Base"}</p>
              <strong style={styles.previewStoreName}>
                {settingsForm.companyName || "Minha Loja"}
              </strong>
              <p style={styles.previewSlogan}>
                {settingsForm.welcomePhrase || "Seu clube de pontos da loja."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function renderTeam() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Equipe",
          "Cadastre, edite e controle os acessos internos da operação."
        )}

        <div style={getDualLayout(isTablet)}>
          <Card>
            <h3 style={styles.cardTitle}>
              {staffForm.id ? "Editar usuário da equipe" : "Novo usuário da equipe"}
            </h3>

            <form onSubmit={submitStaff} style={getFormGridStyle(isMobile)}>
              <Field label="Nome completo">
                <input
                  style={styles.input}
                  value={staffForm.name}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do colaborador"
                />
              </Field>

              <Field label="Login">
                <input
                  style={styles.input}
                  value={staffForm.login}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, login: e.target.value }))}
                  placeholder="login"
                />
              </Field>

              <Field label="Função">
                <select
                  style={styles.input}
                  value={staffForm.role}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option>Funcionário</option>
                  <option>Caixa</option>
                  <option>Gerente</option>
                  <option>Administrador</option>
                </select>
              </Field>

              <Field label="Senha">
                <input
                  style={styles.input}
                  value={staffForm.password}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Senha de acesso"
                  type="password"
                />
              </Field>

              <Field label="E-mail">
                <input
                  style={styles.input}
                  value={staffForm.email}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="colaborador@email.com"
                />
              </Field>

              <Field label="Telefone">
                <input
                  style={styles.input}
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(75) 99999-0000"
                />
              </Field>

              <Field label="CPF">
                <input
                  style={styles.input}
                  value={staffForm.cpf}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </Field>

              <Field label="Status">
                <select
                  style={styles.input}
                  value={staffForm.status}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </Field>

              <Field label="Observações" full>
                <textarea
                  style={styles.textarea}
                  value={staffForm.notes}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Setor, turno ou observações internas"
                />
              </Field>

              <div style={styles.actionsRowFull}>
                <button type="submit" style={styles.primaryButton} disabled={busy === "save-staff"}>
                  {busy === "save-staff"
                    ? "Salvando..."
                    : staffForm.id
                    ? "Atualizar usuário"
                    : "Adicionar usuário"}
                </button>

                <button type="button" style={styles.secondaryButton} onClick={resetStaffForm}>
                  Limpar formulário
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <div style={styles.listHeader}>
              <h3 style={styles.cardTitle}>Acessos cadastrados</h3>
              <span style={styles.miniBadge}>{staffUsers.length} usuários</span>
            </div>

            {!staffUsers.length ? (
              <EmptyState text="Nenhum usuário da equipe cadastrado ainda." />
            ) : (
              <div style={styles.teamList}>
                {staffUsers.map((user) => (
                  <div key={user.id} style={styles.teamCard}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={styles.teamName}>{user.name}</strong>
                      <p style={styles.teamMeta}>Login: {user.login}</p>
                      <p style={styles.teamMeta}>Função: {user.role}</p>
                      <p style={styles.teamMeta}>E-mail: {user.email || "-"}</p>
                      <p style={styles.teamMeta}>Telefone: {user.phone || "-"}</p>
                      <p style={styles.teamMeta}>Status: {user.status || "Ativo"}</p>
                    </div>

                    <div style={styles.inlineActions}>
                      <button
                        type="button"
                        style={styles.ghostButton}
                        onClick={() => handleEditStaff(user)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        style={styles.dangerButton}
                        onClick={() =>
                          runTask(
                            `delete-staff-${user.id}`,
                            async () => onDeleteStaffUser(user.id),
                            "Usuário da equipe removido."
                          )
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "customers":
        return renderCustomers();
      case "products":
        return renderProducts();
      case "promos":
        return renderPromos();
      case "orders":
        return renderOrders();
      case "checkins":
        return renderCheckins();
      case "settings":
        return renderSettings();
      case "team":
        return renderTeam();
      default:
        return renderOverview();
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');

        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'General Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: ${ink};
          background: ${bg};
        }

        input, select, textarea, button {
          font-family: inherit;
        }

        input::placeholder,
        textarea::placeholder {
          color: #9b8fb0;
        }

        @media (max-width: 1180px) {
          .admin-page-layout {
            grid-template-columns: 1fr !important;
          }

          .admin-sidebar {
            position: relative !important;
            top: auto !important;
            height: auto !important;
          }
        }

        @media (max-width: 820px) {
          .admin-main {
            padding: 18px !important;
          }
        }
      `}</style>

      <div className="admin-page-layout" style={styles.pageGrid}>
        <aside className="admin-sidebar" style={styles.sidebar}>
          <div style={styles.brandBlock}>
            <div style={styles.logoBubble}>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo da loja" style={styles.logoImage} />
              ) : (
                <span style={styles.logoFallback}>
                  {(branding.companyName || "L").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <p style={styles.eyebrow}>{branding.softwareName || "Clube Base"}</p>
              <h1 style={styles.brandTitle}>{branding.companyName || "Minha Loja"}</h1>
              <p style={styles.brandSubtitle}>
                {branding.welcomePhrase || "Painel da operação da loja"}
              </p>
            </div>
          </div>

          <nav style={styles.nav}>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.navButton,
                    ...(active ? styles.navButtonActive : {}),
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div style={styles.sidebarFooter}>
            <button type="button" style={styles.secondaryButtonWide} onClick={onBack}>
              Voltar
            </button>
            <button type="button" style={styles.primaryButtonWide} onClick={onLogout}>
              Sair do painel
            </button>
          </div>
        </aside>

        <main className="admin-main" style={styles.main}>
          {notice.text ? (
            <div
              style={{
                ...styles.notice,
                background: notice.type === "error" ? "#fff1f4" : "#eef8f2",
                borderColor: notice.type === "error" ? "#f3c8d5" : "#cae7d6",
                color: notice.type === "error" ? danger : success,
              }}
            >
              {notice.text}
            </div>
          ) : null}

          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

function Card({ children }) {
  return <section style={styles.card}>{children}</section>;
}

function Field({ label, children, full = false }) {
  return (
    <label style={{ ...styles.field, ...(full ? styles.fieldFull : {}) }}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <strong style={styles.statValue}>{value}</strong>
      <p style={styles.statHelper}>{helper}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{String(value ?? "-")}</strong>
    </div>
  );
}

function InfoMini({ label, value }) {
  return (
    <div style={styles.infoMini}>
      <span style={styles.infoMiniLabel}>{label}</span>
      <strong style={styles.infoMiniValue}>{String(value ?? "-")}</strong>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={styles.emptyState}>{text}</div>;
}

function QuickActionButton({ label, onClick }) {
  return (
    <button type="button" style={styles.quickButton} onClick={onClick}>
      {label}
    </button>
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value, withTime = false) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("pt-BR", {
      dateStyle: "short",
      ...(withTime ? { timeStyle: "short" } : {}),
    });
  } catch {
    return "-";
  }
}

function getDualLayout(isTablet) {
  return {
    display: "grid",
    gridTemplateColumns: isTablet ? "1fr" : "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
    gap: 20,
    alignItems: "start",
  };
}

function getFormGridStyle(singleColumn = false) {
  return {
    display: "grid",
    gridTemplateColumns: singleColumn ? "1fr" : "repeat(2, minmax(0, 1fr))",
    gap: 16,
    alignItems: "start",
  };
}

const styles = {
  page: {
    minHeight: "100vh",
    background: bg,
    color: ink,
  },

  pageGrid: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "300px minmax(0, 1fr)",
    background: bg,
  },

  sidebar: {
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "auto",
    background:
      "linear-gradient(180deg, #251833 0%, #34204d 52%, #432661 100%)",
    color: white,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 22,
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },

  brandBlock: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    minWidth: 0,
  },

  logoBubble: {
    width: 60,
    height: 60,
    borderRadius: 18,
    background: "rgba(255,255,255,0.12)",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
  },

  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  logoFallback: {
    fontSize: 22,
    fontWeight: 700,
    color: white,
  },

  eyebrow: {
    margin: 0,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.64)",
  },

  brandTitle: {
    margin: "6px 0 6px",
    fontSize: 22,
    lineHeight: 1.1,
    color: white,
    wordBreak: "break-word",
  },

  brandSubtitle: {
    margin: 0,
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 1.55,
    wordBreak: "break-word",
  },

  nav: {
    display: "grid",
    gap: 8,
  },

  navButton: {
    minHeight: 48,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "rgba(255,255,255,0.84)",
    borderRadius: 16,
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    transition: "0.2s ease",
  },

  navButtonActive: {
    background: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.16)",
    color: white,
  },

  sidebarFooter: {
    marginTop: "auto",
    display: "grid",
    gap: 10,
    paddingTop: 12,
  },

  main: {
    padding: 28,
    display: "grid",
    gap: 18,
    alignContent: "start",
    minWidth: 0,
  },

  notice: {
    border: "1px solid",
    borderRadius: 16,
    padding: "14px 16px",
    fontWeight: 600,
    fontSize: 14,
  },

  stack: {
    display: "grid",
    gap: 20,
    minWidth: 0,
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.05,
    color: ink,
    letterSpacing: "-0.02em",
  },

  sectionSubtitle: {
    margin: "8px 0 0",
    color: muted,
    fontSize: 15,
    lineHeight: 1.6,
    maxWidth: 760,
  },

  brandHero: {
    display: "grid",
    gap: 20,
  },

  brandHeroCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #fbf8ff 100%)",
    border: `1px solid ${border}`,
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 18px 40px rgba(79, 42, 147, 0.08)",
    display: "grid",
    gap: 18,
    minWidth: 0,
  },

  brandHeroTop: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    minWidth: 0,
    flexWrap: "wrap",
  },

  heroLogo: {
    width: 86,
    height: 86,
    borderRadius: 24,
    background: accentSoft,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    flexShrink: 0,
    border: `1px solid ${border}`,
  },

  heroLogoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  heroLogoFallback: {
    fontSize: 28,
    fontWeight: 700,
    color: accentDark,
  },

  heroSoftwareName: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: accent,
    fontWeight: 700,
  },

  heroStoreName: {
    margin: "8px 0 8px",
    fontSize: 30,
    lineHeight: 1.04,
    color: ink,
    letterSpacing: "-0.03em",
    wordBreak: "break-word",
  },

  heroStoreSlogan: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.7,
    color: muted,
    maxWidth: 620,
    wordBreak: "break-word",
  },

  heroBadges: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  heroBadge: {
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 999,
    background: accentSoft,
    color: accentDark,
    display: "inline-flex",
    alignItems: "center",
    fontSize: 13,
    fontWeight: 600,
  },

  brandSideCard: {
    background: "linear-gradient(180deg, #4e2e89 0%, #6740ad 100%)",
    borderRadius: 28,
    padding: 24,
    color: white,
    display: "grid",
    gap: 18,
    boxShadow: "0 18px 40px rgba(79, 42, 147, 0.18)",
  },

  sideMetaLabel: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.72)",
  },

  sideMetaValue: {
    fontSize: 24,
    lineHeight: 1.1,
  },

  sideMetaList: {
    display: "grid",
    gap: 10,
  },

  infoMini: {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 16,
    background: "rgba(255,255,255,0.10)",
  },

  infoMiniLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.7)",
  },

  infoMiniValue: {
    fontSize: 14,
    color: white,
    wordBreak: "break-word",
  },

  statsGrid: {
    display: "grid",
    gap: 14,
  },

  statCard: {
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 12px 30px rgba(79, 42, 147, 0.05)",
    minWidth: 0,
  },

  statLabel: {
    margin: 0,
    color: muted,
    fontSize: 13,
    fontWeight: 600,
  },

  statValue: {
    display: "block",
    marginTop: 10,
    fontSize: 30,
    lineHeight: 1.05,
    color: ink,
    letterSpacing: "-0.03em",
    wordBreak: "break-word",
  },

  statHelper: {
    margin: "8px 0 0",
    color: muted,
    fontSize: 13,
    lineHeight: 1.5,
  },

  card: {
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 12px 34px rgba(79, 42, 147, 0.05)",
    display: "grid",
    gap: 16,
    minWidth: 0,
  },

  cardTitle: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.15,
    color: ink,
    letterSpacing: "-0.02em",
    wordBreak: "break-word",
  },

  field: {
    display: "grid",
    gap: 8,
    minWidth: 0,
  },

  fieldFull: {
    gridColumn: "1 / -1",
  },

  label: {
    fontSize: 13,
    color: muted,
    fontWeight: 600,
    lineHeight: 1.4,
  },

  input: {
    width: "100%",
    minWidth: 0,
    minHeight: 52,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: "0 15px",
    background: "#fcfbff",
    color: ink,
    outline: "none",
    fontSize: 15,
    lineHeight: 1.4,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
  },

  textarea: {
    width: "100%",
    minWidth: 0,
    minHeight: 108,
    resize: "vertical",
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: "14px 15px",
    background: "#fcfbff",
    color: ink,
    outline: "none",
    fontSize: 15,
    lineHeight: 1.6,
    fontFamily: "inherit",
  },

  actionsRowFull: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
  },

  primaryButton: {
    minHeight: 50,
    border: 0,
    borderRadius: 16,
    padding: "12px 18px",
    background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
    color: white,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(79, 42, 147, 0.18)",
  },

  primaryButtonWide: {
    minHeight: 50,
    border: 0,
    borderRadius: 16,
    padding: "12px 18px",
    background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
    color: white,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
  },

  secondaryButton: {
    minHeight: 50,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: "12px 18px",
    background: "#faf7ff",
    color: ink,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  },

  secondaryButtonWide: {
    minHeight: 50,
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 16,
    padding: "12px 18px",
    background: "rgba(255,255,255,0.06)",
    color: white,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
  },

  ghostButton: {
    minHeight: 40,
    border: `1px solid ${border}`,
    borderRadius: 13,
    padding: "8px 12px",
    background: white,
    color: ink,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },

  dangerButton: {
    minHeight: 40,
    border: "1px solid #f2ccd7",
    borderRadius: 13,
    padding: "8px 12px",
    background: "#fff4f7",
    color: danger,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },

  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    borderRadius: 16,
    padding: "12px 18px",
    background: "#eef4ff",
    color: "#2d60b5",
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  miniBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    borderRadius: 999,
    padding: "0 12px",
    background: accentSoft,
    color: accentDark,
    fontSize: 12,
    fontWeight: 700,
  },

  tableWrap: {
    overflowX: "auto",
    width: "100%",
  },

  table: {
    width: "100%",
    minWidth: 720,
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: muted,
    padding: "14px 12px",
    borderBottom: `1px solid ${border}`,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #f2edf9",
    verticalAlign: "top",
    fontSize: 14,
    color: ink,
    lineHeight: 1.5,
  },

  selectedRow: {
    background: "#fbf8ff",
  },

  inlineActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  infoList: {
    display: "grid",
    gap: 10,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    borderBottom: "1px solid #f2edf9",
    paddingBottom: 12,
  },

  infoLabel: {
    color: muted,
    fontSize: 14,
    lineHeight: 1.5,
    minWidth: 0,
  },

  infoValue: {
    color: ink,
    fontSize: 14,
    textAlign: "right",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },

  emptyState: {
    border: `1px dashed ${border}`,
    borderRadius: 18,
    padding: 28,
    textAlign: "center",
    color: muted,
    background: "#fcfbff",
    fontSize: 14,
    lineHeight: 1.6,
  },

  quickActions: {
    display: "grid",
    gap: 10,
  },

  quickButton: {
    minHeight: 52,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: "14px 16px",
    background: "#faf7ff",
    color: ink,
    fontWeight: 700,
    fontSize: 15,
    textAlign: "left",
    cursor: "pointer",
  },

  promoGrid: {
    display: "grid",
    gap: 14,
  },

  promoCard: {
    border: `1px solid ${border}`,
    borderRadius: 20,
    background: "#fcfbff",
    overflow: "hidden",
    minWidth: 0,
  },

  promoContent: {
    padding: 18,
    display: "grid",
    gap: 12,
    minWidth: 0,
  },

  promoTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  promoTag: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 30,
    borderRadius: 999,
    padding: "0 10px",
    background: "#efe7fb",
    color: accentDark,
    fontSize: 12,
    fontWeight: 700,
  },

  promoTitle: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.2,
    color: ink,
    wordBreak: "break-word",
  },

  promoText: {
    margin: 0,
    color: muted,
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 30,
    borderRadius: 999,
    padding: "0 10px",
    fontSize: 12,
    fontWeight: 700,
  },

  checkinList: {
    display: "grid",
    gap: 14,
  },

  checkinCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    border: `1px solid ${border}`,
    borderRadius: 18,
    padding: 18,
    background: "#fcfbff",
  },

  checkinName: {
    fontSize: 16,
    color: ink,
  },

  checkinMeta: {
    margin: "6px 0 0",
    color: muted,
    fontSize: 14,
    lineHeight: 1.55,
    wordBreak: "break-word",
  },

  teamList: {
    display: "grid",
    gap: 12,
  },

  teamCard: {
    border: `1px solid ${border}`,
    borderRadius: 18,
    background: "#fcfbff",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  teamName: {
    fontSize: 16,
    color: ink,
    wordBreak: "break-word",
  },

  teamMeta: {
    margin: "5px 0 0",
    color: muted,
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },

  previewCard: {
    marginTop: 4,
    border: `1px solid ${border}`,
    borderRadius: 22,
    background: "linear-gradient(135deg, #faf7ff 0%, #ffffff 100%)",
    padding: 18,
    display: "flex",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },

  previewLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: accentSoft,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    border: `1px solid ${border}`,
    flexShrink: 0,
  },

  previewLogoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  previewLogoFallback: {
    fontSize: 24,
    fontWeight: 700,
    color: accentDark,
  },

  previewEyebrow: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: accent,
    fontWeight: 700,
  },

  previewStoreName: {
    display: "block",
    marginTop: 6,
    fontSize: 22,
    color: ink,
    lineHeight: 1.1,
    wordBreak: "break-word",
  },

  previewSlogan: {
    margin: "8px 0 0",
    color: muted,
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
};