import { useMemo, useState } from "react";

const accent = "#6f3cc3";
const accentDark = "#522b93";
const border = "#eadff7";
const ink = "#2f2340";
const muted = "#7b6d8d";
const bg = "#f6f1fb";
const white = "#ffffff";
const success = "#2f8f57";
const danger = "#cf4d6f";
const warning = "#d38b1f";

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
  name: "",
  login: "",
  role: "Funcionário",
  password: "",
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
  onDeleteStaffUser,
  branding = {},
  whatsappLink = "",
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

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

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) || customers[0] || null;

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalPoints = customers.reduce((sum, item) => sum + Number(item.points || 0), 0);
    const totalCoupons = customers.reduce(
      (sum, item) => sum + (Array.isArray(item.coupons) ? item.coupons.filter((coupon) => coupon.active).length : 0),
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
    };
  }, [customers, products, promos, orders, pendingCheckins]);

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
      await runTask("save-customer", async () => {
        await onUpdateCustomer(payload);
        resetCustomerForm();
      }, "Cliente atualizado com sucesso.");
      return;
    }

    await runTask("save-customer", async () => {
      await onAddCustomer(payload);
      resetCustomerForm();
    }, "Cliente cadastrado com sucesso.");
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
      await runTask("save-product", async () => {
        await onUpdateProduct(payload);
        resetProductForm();
      }, "Produto atualizado com sucesso.");
      return;
    }

    await runTask("save-product", async () => {
      await onAddProduct(payload);
      resetProductForm();
    }, "Produto cadastrado com sucesso.");
  }

  async function submitPromo(event) {
    event.preventDefault();

    if (!promoForm.title || !promoForm.description) {
      showError(new Error("Preencha título e descrição da promoção."));
      return;
    }

    const payload = { ...promoForm };

    if (promoForm.id) {
      await runTask("save-promo", async () => {
        await onUpdatePromo(payload);
        resetPromoForm();
      }, "Promoção atualizada com sucesso.");
      return;
    }

    await runTask("save-promo", async () => {
      await onAddPromo(payload);
      resetPromoForm();
    }, "Promoção cadastrada com sucesso.");
  }

  async function submitOrder(event) {
    event.preventDefault();

    if (!orderForm.customerId || !orderForm.productId || !orderForm.total) {
      showError(new Error("Preencha cliente, produto e valor do pedido."));
      return;
    }

    await runTask("save-order", async () => {
      await onAddOrder({
        ...orderForm,
        total: Number(orderForm.total || 0),
      });
      resetOrderForm();
    }, "Pedido registrado com sucesso.");
  }

  async function submitBonus(event) {
    event.preventDefault();

    if (!bonusForm.customerId || !bonusForm.points) {
      showError(new Error("Escolha um cliente e informe os pontos do bônus."));
      return;
    }

    await runTask("save-bonus", async () => {
      await onAddBonus({
        customerId: bonusForm.customerId,
        points: Number(bonusForm.points || 0),
      });
      resetBonusForm();
    }, "Bônus aplicado com sucesso.");
  }

  async function submitSettings(event) {
    event.preventDefault();

    await runTask("save-settings", async () => {
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
    }, "Configurações salvas com sucesso.");
  }

  async function submitStaff(event) {
    event.preventDefault();

    if (!staffForm.name || !staffForm.login || !staffForm.password) {
      showError(new Error("Preencha nome, login e senha da equipe."));
      return;
    }

    await runTask("save-staff", async () => {
      await onAddStaffUser(staffForm);
      resetStaffForm();
    }, "Usuário da equipe adicionado.");
  }

  function sectionTitle(title, subtitle) {
    return (
      <div style={styles.sectionHeading}>
        <div>
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
          "Resumo da operação, atalhos e visão rápida dos principais números."
        )}

        <div style={styles.statsGrid}>
          <StatCard label="Clientes" value={stats.totalCustomers} helper="Base cadastrada" />
          <StatCard label="Produtos" value={stats.totalProducts} helper="Catálogo ativo" />
          <StatCard label="Promoções" value={stats.totalPromos} helper="Campanhas visíveis" />
          <StatCard label="Pedidos" value={stats.totalOrders} helper="Movimento total" />
          <StatCard
            label="Faturamento"
            value={formatCurrency(stats.totalRevenue)}
            helper="Soma dos pedidos"
          />
          <StatCard
            label="Pontos"
            value={stats.totalPoints}
            helper="Saldo distribuído"
          />
          <StatCard
            label="Cupons ativos"
            value={stats.totalCoupons}
            helper="Clientes com benefício"
          />
          <StatCard
            label="Check-ins pendentes"
            value={stats.pendingCheckins}
            helper="Aguardando conferência"
            highlight
          />
        </div>

        <div style={styles.twoCols}>
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
              <QuickActionButton label="Aprovar check-ins" onClick={() => setActiveTab("checkins")} />
              <QuickActionButton label="Editar configurações" onClick={() => setActiveTab("settings")} />
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

        <div style={styles.twoCols}>
          <Card>
            <h3 style={styles.cardTitle}>
              {customerForm.id ? "Editar cliente" : "Novo cliente"}
            </h3>

            <form onSubmit={submitCustomer} style={styles.formGrid}>
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
            <form onSubmit={submitBonus} style={styles.formGrid}>
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
                    const isSelected = customer.id === selectedCustomerId;
                    return (
                      <tr key={customer.id} style={isSelected ? styles.selectedRow : undefined}>
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

        <div style={styles.twoCols}>
          <Card>
            <h3 style={styles.cardTitle}>
              {productForm.id ? "Editar produto" : "Novo produto"}
            </h3>

            <form onSubmit={submitProduct} style={styles.formGrid}>
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
                  onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
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
                    setProductForm((prev) => ({ ...prev, available: e.target.value === "true" }))
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
                  onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
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
              <InfoRow label="Produtos indisponíveis" value={products.filter((item) => !item.available).length} />
              <InfoRow
                label="Preço médio"
                value={
                  products.length
                    ? formatCurrency(
                        products.reduce((sum, item) => sum + Number(item.price || 0), 0) / products.length
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
                            background: product.available ? "#ebf7ef" : "#fff3ea",
                            color: product.available ? success : warning,
                          }}
                        >
                          {product.available ? "Disponível" : "Indisponível"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.inlineActions}>
                          <button type="button" style={styles.ghostButton} onClick={() => handleEditProduct(product)}>
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
          "Gerencie campanhas, textos promocionais e chamadas do cliente."
        )}

        <div style={styles.twoCols}>
          <Card>
            <h3 style={styles.cardTitle}>
              {promoForm.id ? "Editar promoção" : "Nova promoção"}
            </h3>

            <form onSubmit={submitPromo} style={styles.formGrid}>
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
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, description: e.target.value }))}
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
              <InfoRow label="Texto de boas-vindas" value={branding.welcomePhrase || "-"} />
              <InfoRow label="Instagram atual" value={branding.instagramUrl || "-"} />
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
            <div style={styles.promoGrid}>
              {promos.map((promo) => (
                <div key={promo.id} style={styles.promoCard}>
                  <div style={styles.promoContent}>
                    <div style={styles.promoTop}>
                      <span style={styles.promoTag}>{promo.type || "Promoção"}</span>
                    </div>
                    <h4 style={styles.promoTitle}>{promo.title}</h4>
                    <p style={styles.promoText}>{promo.description}</p>
                    <div style={styles.inlineActions}>
                      <button type="button" style={styles.ghostButton} onClick={() => handleEditPromo(promo)}>
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
          "Registre vendas da loja e atualize automaticamente os pontos do cliente."
        )}

        <div style={styles.twoCols}>
          <Card>
            <h3 style={styles.cardTitle}>Novo pedido</h3>
            <form onSubmit={submitOrder} style={styles.formGrid}>
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
                        orders.reduce((sum, item) => sum + Number(item.total || 0), 0) / orders.length
                      )
                    : "R$ 0,00"
                }
              />
              <InfoRow
                label="Faturamento"
                value={formatCurrency(orders.reduce((sum, item) => sum + Number(item.total || 0), 0))}
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
                <div key={item.id} style={styles.checkinCard}>
                  <div>
                    <strong style={styles.checkinName}>
                      {item.customers?.full_name || "Cliente"}
                    </strong>
                    <p style={styles.checkinMeta}>Telefone: {item.customers?.phone || "-"}</p>
                    <p style={styles.checkinMeta}>Solicitado em: {formatDate(item.requested_at, true)}</p>
                    <p style={styles.checkinMeta}>Instagram: {item.instagram_handle || branding.instagramUrl || "-"}</p>
                  </div>

                  <div style={styles.inlineActions}>
                    <button
                      type="button"
                      style={styles.primaryButton}
                      disabled={busy === `approve-checkin-${item.id}`}
                      onClick={() =>
                        runTask(
                          `approve-checkin-${item.id}`,
                          async () => onApproveCheckin(item),
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
                          async () => onRejectCheckin(item),
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
          "Ajuste pontuação, meta, identidade visual e canais da loja."
        )}

        <Card>
          <h3 style={styles.cardTitle}>Parâmetros da loja e marca</h3>

          <form onSubmit={submitSettings} style={styles.formGrid}>
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
              />
            </Field>

            <Field label="Nome da loja">
              <input
                style={styles.input}
                value={settingsForm.companyName}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, companyName: e.target.value }))
                }
              />
            </Field>

            <Field label="Logo (URL)">
              <input
                style={styles.input}
                value={settingsForm.logoUrl}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, logoUrl: e.target.value }))
                }
              />
            </Field>

            <Field label="Instagram">
              <input
                style={styles.input}
                value={settingsForm.instagramUrl}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, instagramUrl: e.target.value }))
                }
                placeholder="@sualoja"
              />
            </Field>

            <Field label="WhatsApp">
              <input
                style={styles.input}
                value={settingsForm.whatsappNumber}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                }
                placeholder="5575999990000"
              />
            </Field>

            <Field label="Mensagem do WhatsApp" full>
              <input
                style={styles.input}
                value={settingsForm.whatsappMessage}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, whatsappMessage: e.target.value }))
                }
              />
            </Field>

            <Field label="Frase de boas-vindas" full>
              <textarea
                style={styles.textarea}
                value={settingsForm.welcomePhrase}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, welcomePhrase: e.target.value }))
                }
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
        </Card>
      </div>
    );
  }

  function renderTeam() {
    return (
      <div style={styles.stack}>
        {sectionTitle(
          "Equipe",
          "Cadastre acessos internos para uso da operação."
        )}

        <div style={styles.twoCols}>
          <Card>
            <h3 style={styles.cardTitle}>Novo usuário da equipe</h3>

            <form onSubmit={submitStaff} style={styles.formGrid}>
              <Field label="Nome">
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
                  placeholder="001"
                />
              </Field>

              <Field label="Função">
                <select
                  style={styles.input}
                  value={staffForm.role}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option>Funcionário</option>
                  <option>Administrador</option>
                </select>
              </Field>

              <Field label="Senha">
                <input
                  style={styles.input}
                  value={staffForm.password}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Senha de acesso"
                />
              </Field>

              <div style={styles.actionsRowFull}>
                <button type="submit" style={styles.primaryButton} disabled={busy === "save-staff"}>
                  {busy === "save-staff" ? "Salvando..." : "Adicionar usuário"}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 style={styles.cardTitle}>Acessos cadastrados</h3>

            {!staffUsers.length ? (
              <EmptyState text="Nenhum usuário da equipe cadastrado ainda." />
            ) : (
              <div style={styles.teamList}>
                {staffUsers.map((user) => (
                  <div key={user.id} style={styles.teamCard}>
                    <div>
                      <strong style={styles.teamName}>{user.name}</strong>
                      <p style={styles.teamMeta}>Login: {user.login}</p>
                      <p style={styles.teamMeta}>Função: {user.role}</p>
                    </div>
                    <button
                      type="button"
                      style={styles.dangerButton}
                      onClick={() => onDeleteStaffUser(user.id)}
                    >
                      Excluir
                    </button>
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
      <aside style={styles.sidebar}>
        <div style={styles.brandBlock}>
          <div style={styles.logoBubble}>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo da loja" style={styles.logoImage} />
            ) : (
              <span style={styles.logoFallback}>V</span>
            )}
          </div>

          <div>
            <p style={styles.eyebrow}>{branding.softwareName || "Voltta"}</p>
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

      <main style={styles.main}>
        {notice.text ? (
          <div
            style={{
              ...styles.notice,
              background: notice.type === "error" ? "#fff0f4" : "#edf8f1",
              borderColor: notice.type === "error" ? "#f2cada" : "#cfe9d8",
              color: notice.type === "error" ? danger : success,
            }}
          >
            {notice.text}
          </div>
        ) : null}

        {renderActiveTab()}
      </main>
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

function StatCard({ label, value, helper, highlight = false }) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(highlight
          ? {
              background: "linear-gradient(135deg, #6f3cc3 0%, #8d67d6 100%)",
              color: white,
              borderColor: "transparent",
            }
          : {}),
      }}
    >
      <p style={{ ...styles.statLabel, ...(highlight ? { color: "rgba(255,255,255,0.82)" } : {}) }}>
        {label}
      </p>
      <strong style={styles.statValue}>{value}</strong>
      <p style={{ ...styles.statHelper, ...(highlight ? { color: "rgba(255,255,255,0.76)" } : {}) }}>
        {helper}
      </p>
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

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "290px 1fr",
    background: bg,
    color: ink,
  },

  sidebar: {
    background: "linear-gradient(180deg, #2f1c46 0%, #3e255d 100%)",
    color: white,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },

  brandBlock: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },

  logoBubble: {
    width: 56,
    height: 56,
    borderRadius: 18,
    background: "rgba(255,255,255,0.14)",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  logoFallback: {
    fontSize: 22,
    fontWeight: 900,
    color: white,
  },

  eyebrow: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.68)",
  },

  brandTitle: {
    margin: "4px 0 6px",
    fontSize: 22,
    lineHeight: 1.1,
  },

  brandSubtitle: {
    margin: 0,
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 1.5,
  },

  nav: {
    display: "grid",
    gap: 8,
  },

  navButton: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "rgba(255,255,255,0.86)",
    borderRadius: 16,
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: 700,
    cursor: "pointer",
    transition: "0.2s ease",
  },

  navButtonActive: {
    background: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.18)",
    color: white,
  },

  sidebarFooter: {
    marginTop: "auto",
    display: "grid",
    gap: 10,
  },

  main: {
    padding: 28,
    display: "grid",
    gap: 18,
    alignContent: "start",
  },

  notice: {
    border: "1px solid",
    borderRadius: 16,
    padding: "14px 16px",
    fontWeight: 700,
  },

  stack: {
    display: "grid",
    gap: 18,
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 28,
    color: ink,
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: muted,
    fontSize: 15,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },

  statCard: {
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 18px 42px rgba(90, 54, 119, 0.08)",
  },

  statLabel: {
    margin: 0,
    color: muted,
    fontSize: 13,
    fontWeight: 700,
  },

  statValue: {
    display: "block",
    marginTop: 10,
    fontSize: 28,
    lineHeight: 1.1,
  },

  statHelper: {
    margin: "8px 0 0",
    color: muted,
    fontSize: 13,
  },

  twoCols: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 18,
  },

  card: {
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 18px 42px rgba(90, 54, 119, 0.08)",
  },

  cardTitle: {
    margin: "0 0 16px",
    fontSize: 20,
    color: ink,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  field: {
    display: "grid",
    gap: 8,
  },

  fieldFull: {
    gridColumn: "1 / -1",
  },

  label: {
    fontSize: 13,
    color: muted,
    fontWeight: 700,
  },

  input: {
    width: "100%",
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: "12px 14px",
    background: "#fcfbfe",
    color: ink,
    outline: "none",
    fontSize: 14,
  },

  textarea: {
    width: "100%",
    minHeight: 96,
    resize: "vertical",
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: "12px 14px",
    background: "#fcfbfe",
    color: ink,
    outline: "none",
    fontSize: 14,
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
    border: 0,
    borderRadius: 14,
    padding: "12px 18px",
    background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
    color: white,
    fontWeight: 800,
    cursor: "pointer",
  },

  primaryButtonWide: {
    border: 0,
    borderRadius: 14,
    padding: "12px 18px",
    background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
    color: white,
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
  },

  secondaryButton: {
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: "12px 18px",
    background: "#faf7fe",
    color: ink,
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButtonWide: {
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 14,
    padding: "12px 18px",
    background: "rgba(255,255,255,0.06)",
    color: white,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },

  ghostButton: {
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: "9px 12px",
    background: white,
    color: ink,
    fontWeight: 700,
    cursor: "pointer",
  },

  dangerButton: {
    border: 0,
    borderRadius: 12,
    padding: "9px 12px",
    background: "#fff1f4",
    color: danger,
    fontWeight: 800,
    cursor: "pointer",
  },

  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: "12px 18px",
    background: "#edf6ff",
    color: "#2461b1",
    fontWeight: 800,
    textDecoration: "none",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },

  miniBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#f3ecfb",
    color: accentDark,
    fontSize: 12,
    fontWeight: 800,
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: muted,
    padding: "14px 12px",
    borderBottom: `1px solid ${border}`,
  },

  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #f1ebf8",
    verticalAlign: "top",
    fontSize: 14,
    color: ink,
  },

  selectedRow: {
    background: "#faf7fe",
  },

  inlineActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  infoList: {
    display: "grid",
    gap: 12,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    borderBottom: "1px solid #f1ebf8",
    paddingBottom: 10,
  },

  infoLabel: {
    color: muted,
    fontSize: 14,
  },

  infoValue: {
    color: ink,
    fontSize: 14,
    textAlign: "right",
  },

  emptyState: {
    border: `1px dashed ${border}`,
    borderRadius: 18,
    padding: 22,
    textAlign: "center",
    color: muted,
    background: "#fcfbfe",
  },

  quickActions: {
    display: "grid",
    gap: 10,
  },

  quickButton: {
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: "14px 16px",
    background: "#faf7fe",
    color: ink,
    fontWeight: 800,
    textAlign: "left",
    cursor: "pointer",
  },

  promoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },

  promoCard: {
    border: `1px solid ${border}`,
    borderRadius: 20,
    background: "#fcfbfe",
    overflow: "hidden",
  },

  promoContent: {
    padding: 18,
    display: "grid",
    gap: 12,
  },

  promoTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  promoTag: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#efe7fb",
    color: accentDark,
    fontSize: 12,
    fontWeight: 800,
  },

  promoTitle: {
    margin: 0,
    fontSize: 18,
    color: ink,
  },

  promoText: {
    margin: 0,
    color: muted,
    fontSize: 14,
    lineHeight: 1.6,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 800,
  },

  checkinList: {
    display: "grid",
    gap: 14,
  },

  checkinCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    border: `1px solid ${border}`,
    borderRadius: 18,
    padding: 18,
    background: "#fcfbfe",
  },

  checkinName: {
    fontSize: 16,
    color: ink,
  },

  checkinMeta: {
    margin: "6px 0 0",
    color: muted,
    fontSize: 14,
  },

  teamList: {
    display: "grid",
    gap: 12,
  },

  teamCard: {
    border: `1px solid ${border}`,
    borderRadius: 18,
    background: "#fcfbfe",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  teamName: {
    fontSize: 16,
    color: ink,
  },

  teamMeta: {
    margin: "5px 0 0",
    color: muted,
    fontSize: 14,
  },
};