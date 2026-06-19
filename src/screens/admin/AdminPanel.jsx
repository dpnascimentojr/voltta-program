import { useEffect, useMemo, useState } from "react";
import "./AdminPanel.css";
import logoFallback from "../../assets/logo.png";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "clientes", label: "Clientes" },
  { key: "cardapio", label: "Cardápio" },
  { key: "pedidos", label: "Pedidos" },
  { key: "fidelidade", label: "Fidelidade" },
  { key: "promocoes", label: "Promoções" },
  { key: "configuracoes", label: "Configurações" },
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
  category: "Açaí",
  price: "",
  description: "",
  available: true,
};

const emptyPromoForm = {
  id: "",
  title: "",
  type: "Happy Hour",
  description: "",
  image: "",
};

const emptyStaffForm = {
  id: "",
  name: "",
  email: "",
  login: "",
  username: "",
  employeeId: "",
  phone: "",
  role: "Funcionário",
  password: "",
  pin: "",
  active: true,
};

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function statusClass(status) {
  if (status === "Entregue" || status === "Pronto") return "is-success";
  if (status === "Cancelado") return "is-danger";
  return "is-warning";
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function AdminPanel({
  onBack,
  onLogout,
  customers,
  products,
  orders,
  promos,
  config,
  staffUsers,
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
  branding,
  whatsappLink,
  staffSession,
}) {
  const [activePage, setActivePage] = useState("dashboard");
  const [customerSearch, setCustomerSearch] = useState("");

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) || null;

  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [promoForm, setPromoForm] = useState(emptyPromoForm);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerForm({
        id: selectedCustomer.id,
        name: selectedCustomer.name || "",
        phone: selectedCustomer.phone || "",
        birth: selectedCustomer.birth || "",
        pin: selectedCustomer.pin || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || "",
        tier: selectedCustomer.tier || "Bronze",
      });
      return;
    }
    setCustomerForm(emptyCustomerForm);
  }, [selectedCustomerId, selectedCustomer]);

  const selectedStaff =
    staffUsers.find((user) => user.id === selectedStaffId) || null;

  useEffect(() => {
    if (selectedStaff) {
      setStaffForm({
        id: selectedStaff.id,
        name: selectedStaff.name || "",
        email: selectedStaff.email || "",
        login: selectedStaff.login || "",
        username: selectedStaff.username || "",
        employeeId: selectedStaff.employeeId || "",
        phone: selectedStaff.phone || "",
        role: selectedStaff.role || "Funcionário",
        password: selectedStaff.password || "",
        pin: selectedStaff.pin || "",
        active: selectedStaff.active ?? true,
      });
      return;
    }

    setStaffForm(emptyStaffForm);
  }, [selectedStaff]);

  const [orderForm, setOrderForm] = useState({
    customerId: "",
    productId: "",
    channel: "Balcão",
    status: "Recebido",
    total: "",
    note: "",
  });

  const [bonusForm, setBonusForm] = useState({
    customerId: "",
    points: "",
  });

  const [configForm, setConfigForm] = useState({
    pointsPerReal: config.pointsPerReal,
    spendGoal: config.spendGoal,
    checkinPercent: config.checkinPercent,
    softwareName: branding.softwareName,
    companyName: branding.companyName,
    logoUrl: branding.logoUrl,
    instagramUrl: branding.instagramUrl,
    whatsappNumber: branding.whatsappNumber,
    whatsappMessage: branding.whatsappMessage,
    welcomePhrase: branding.welcomePhrase,
  });

  useEffect(() => {
    setConfigForm({
      pointsPerReal: config.pointsPerReal,
      spendGoal: config.spendGoal,
      checkinPercent: config.checkinPercent,
      softwareName: branding.softwareName,
      companyName: branding.companyName,
      logoUrl: branding.logoUrl,
      instagramUrl: branding.instagramUrl,
      whatsappNumber: branding.whatsappNumber,
      whatsappMessage: branding.whatsappMessage,
      welcomePhrase: branding.welcomePhrase,
    });
  }, [config, branding]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => {
      const haystack = [customer.name, customer.phone, customer.email, customer.address, customer.tier]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [customers, customerSearch]);

  const kpis = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status !== "Cancelado")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      customers: customers.length,
      orders: orders.length,
      promos: promos.length,
      revenue: money(revenue),
    };
  }, [customers, orders, promos]);

  const logoSrc = branding?.logoUrl || logoFallback;

  const handleCustomerSubmit = (event) => {
    event.preventDefault();
    if (!customerForm.name.trim() || digits(customerForm.phone).length < 10 || !customerForm.pin.trim()) {
      alert("Preencha nome, telefone e PIN.");
      return;
    }

    const payload = {
      id: customerForm.id,
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      birth: customerForm.birth,
      pin: customerForm.pin.trim(),
      email: customerForm.email.trim(),
      address: customerForm.address.trim(),
      tier: customerForm.tier,
    };

    if (customerForm.id) {
      onUpdateCustomer(payload);
      alert("Cliente atualizado com sucesso.");
      return;
    }

    onAddCustomer(payload);
    setCustomerForm(emptyCustomerForm);
  };

  const handleNewCustomer = () => {
    onSelectCustomer("");
    setActivePage("clientes");
    setCustomerForm(emptyCustomerForm);
  };

  const handleSelectCustomerRow = (customerId) => {
    onSelectCustomer(customerId);
    setActivePage("clientes");
  };

  const handleDeleteCustomerClick = () => {
    if (!customerForm.id) return;
    if (!window.confirm("Deseja excluir este cliente?")) return;
    onDeleteCustomer(customerForm.id);
    setCustomerForm(emptyCustomerForm);
    alert("Cliente excluído.");
  };

  const handleProductSubmit = (event) => {
    event.preventDefault();
    if (!productForm.name.trim() || !Number(String(productForm.price).replace(",", "."))) {
      alert("Preencha nome e preço.");
      return;
    }

    const payload = {
      id: productForm.id,
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(String(productForm.price).replace(",", ".")),
      description: productForm.description.trim(),
      available: productForm.available,
    };

    if (productForm.id) {
      onUpdateProduct(payload);
      alert("Produto atualizado com sucesso.");
      return;
    }

    onAddProduct(payload);
    setProductForm(emptyProductForm);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      id: product.id,
      name: product.name || "",
      category: product.category || "Açaí",
      price: product.price || "",
      description: product.description || "",
      available: !!product.available,
    });
    setActivePage("cardapio");
  };

  const handleNewProduct = () => {
    setProductForm(emptyProductForm);
    setActivePage("cardapio");
  };

  const handleDeleteProductClick = () => {
    if (!productForm.id) return;
    if (!window.confirm("Deseja excluir este produto?")) return;
    onDeleteProduct(productForm.id);
    setProductForm(emptyProductForm);
    alert("Produto excluído.");
  };

  const handleOrderSubmit = (event) => {
    event.preventDefault();
    if (!orderForm.customerId || !orderForm.productId || !Number(String(orderForm.total).replace(",", "."))) {
      alert("Selecione cliente, produto e valor.");
      return;
    }

    onAddOrder({
      ...orderForm,
      total: Number(String(orderForm.total).replace(",", ".")),
      note: orderForm.note.trim(),
    });

    setOrderForm({
      customerId: "",
      productId: "",
      channel: "Balcão",
      status: "Recebido",
      total: "",
      note: "",
    });
  };

  const handlePromoSubmit = (event) => {
    event.preventDefault();
    if (!promoForm.title.trim() || !promoForm.description.trim()) {
      alert("Preencha título e descrição.");
      return;
    }

    const payload = {
      id: promoForm.id,
      title: promoForm.title.trim(),
      type: promoForm.type,
      description: promoForm.description.trim(),
      image: promoForm.image.trim(),
    };

    if (promoForm.id) {
      onUpdatePromo(payload);
      alert("Promoção atualizada com sucesso.");
      return;
    }

    onAddPromo(payload);
    setPromoForm(emptyPromoForm);
  };

  const handleEditPromo = (promo) => {
    setPromoForm({
      id: promo.id,
      title: promo.title || "",
      type: promo.type || "Happy Hour",
      description: promo.description || "",
      image: promo.image || "",
    });
    setActivePage("promocoes");
  };

  const handleNewPromo = () => {
    setPromoForm(emptyPromoForm);
    setActivePage("promocoes");
  };

  const handleDeletePromoClick = () => {
    if (!promoForm.id) return;
    if (!window.confirm("Deseja excluir esta promoção?")) return;
    onDeletePromo(promoForm.id);
    setPromoForm(emptyPromoForm);
    alert("Promoção excluída.");
  };

  const handleBonusSubmit = (event) => {
    event.preventDefault();
    if (!bonusForm.customerId || !Number(bonusForm.points)) {
      alert("Selecione cliente e informe os pontos.");
      return;
    }

    onAddBonus({
      customerId: bonusForm.customerId,
      points: Number(bonusForm.points),
    });

    setBonusForm({
      customerId: "",
      points: "",
    });
  };

  const handleConfigSubmit = (event) => {
    event.preventDefault();
    onSaveConfig({
      pointsPerReal: Number(configForm.pointsPerReal),
      spendGoal: Number(configForm.spendGoal),
      checkinPercent: Number(configForm.checkinPercent),
      softwareName: configForm.softwareName.trim(),
      companyName: configForm.companyName.trim(),
      logoUrl: configForm.logoUrl.trim(),
      instagramUrl: configForm.instagramUrl.trim(),
      whatsappNumber: configForm.whatsappNumber.trim(),
      whatsappMessage: configForm.whatsappMessage.trim(),
      welcomePhrase: configForm.welcomePhrase.trim(),
    });
    alert("Configurações salvas.");
  };

  const handleStaffSubmit = (event) => {
    event.preventDefault();
    if (
      !staffForm.name.trim() ||
      (!staffForm.login.trim() && !staffForm.username.trim() && !staffForm.employeeId.trim() && !staffForm.email.trim()) ||
      !staffForm.password.trim()
    ) {
      alert("Preencha nome, um identificador de login e a senha.");
      return;
    }

    const payload = {
      id: staffForm.id,
      name: staffForm.name.trim(),
      email: staffForm.email.trim(),
      login: staffForm.login.trim(),
      username: staffForm.username.trim(),
      employeeId: staffForm.employeeId.trim(),
      phone: staffForm.phone.trim(),
      role: staffForm.role,
      password: staffForm.password.trim(),
      pin: staffForm.pin.trim(),
      active: !!staffForm.active,
    };

    if (staffForm.id) {
      onUpdateStaffUser(payload);
      alert("Funcionário atualizado.");
      return;
    }

    onAddStaffUser(payload);
    setStaffForm(emptyStaffForm);
    alert("Funcionário cadastrado.");
  };

  const handleEditStaff = (user) => {
    setSelectedStaffId(user.id);
    setActivePage("configuracoes");
  };

  const handleNewStaff = () => {
    setSelectedStaffId("");
    setStaffForm(emptyStaffForm);
    setActivePage("configuracoes");
  };

  const handleDeleteStaffClick = () => {
    if (!staffForm.id) return;
    if (!window.confirm("Deseja excluir este funcionário?")) return;
    onDeleteStaffUser(staffForm.id);
    setSelectedStaffId("");
    setStaffForm(emptyStaffForm);
    alert("Funcionário excluído.");
  };

  return (
    <div className="admin-panel">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          <button type="button" className="admin-back-button" onClick={onBack}>
            ← Voltar
          </button>

          <button type="button" className="admin-back-button admin-back-button--alt" onClick={onLogout}>
            Sair
          </button>

          <div className="admin-brand">
            <div className="admin-brand-mark">
              <img src={logoSrc} alt={`Logo ${branding.companyName}`} />
            </div>

            <div className="admin-brand-copy">
              <span>{branding.softwareName}</span>
              <h1>{branding.companyName}</h1>
            </div>
          </div>

          <div className="admin-contact-shortcuts">
            {branding.instagramUrl && (
              <a href={branding.instagramUrl} target="_blank" rel="noreferrer" className="admin-shortcut">
                Instagram
              </a>
            )}

            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="admin-shortcut">
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <nav className="admin-nav" aria-label="Navegação do painel">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-nav__button ${activePage === item.key ? "is-active" : ""}`}
              onClick={() => setActivePage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-content">
        {activePage === "dashboard" && (
          <section className="admin-page">
            <div className="admin-hero">
              <div>
                <span className="admin-eyebrow">{branding.softwareName}</span>
                <h2>Resumo da operação</h2>
                <p>{branding.companyName}</p>
              </div>

              <div className="admin-hero__badge">
                <strong>{staffSession?.isMaster ? "Modo master" : "Painel ativo"}</strong>
                <span>
                  {staffSession?.isMaster
                    ? "Acesso de emergência habilitado."
                    : "Gerencie clientes, equipe e fidelidade."}
                </span>
              </div>
            </div>

            <div className="admin-kpis">
              <article className="admin-kpi">
                <span>Clientes</span>
                <strong>{kpis.customers}</strong>
                <small>Base atual</small>
              </article>

              <article className="admin-kpi">
                <span>Pedidos</span>
                <strong>{kpis.orders}</strong>
                <small>Pedidos lançados</small>
              </article>

              <article className="admin-kpi">
                <span>Promoções</span>
                <strong>{kpis.promos}</strong>
                <small>Campanhas</small>
              </article>

              <article className="admin-kpi">
                <span>Faturamento</span>
                <strong>{kpis.revenue}</strong>
                <small>Total demonstrativo</small>
              </article>
            </div>
          </section>
        )}

        {activePage === "clientes" && (
          <section className="admin-page">
            <div className="admin-section-hero">
              <div>
                <h2>Clientes</h2>
                <p>Cadastro e consulta.</p>
              </div>

              <div className="admin-actions">
                <button type="button" className="btn-secondary" onClick={handleNewCustomer}>
                  Novo cliente
                </button>
              </div>
            </div>

            <section className="admin-card admin-card--spaced">
              <div className="admin-card__header">
                <h3>Busca</h3>
                <span>{filteredCustomers.length} resultado(s)</span>
              </div>

              <input
                type="text"
                className="admin-search"
                placeholder="Buscar cliente"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </section>

            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>{customerForm.id ? "Editar cliente" : "Novo cliente"}</h3>
                  <span>{customerForm.id ? "Registro selecionado" : "Preencha os dados"}</span>
                </div>

                <form className="admin-form-grid" onSubmit={handleCustomerSubmit}>
                  <label>
                    Nome
                    <input type="text" value={customerForm.name} onChange={(e) => setCustomerForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </label>

                  <label>
                    Telefone
                    <input type="text" value={customerForm.phone} onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))} />
                  </label>

                  <label>
                    Nascimento
                    <input type="date" value={customerForm.birth} onChange={(e) => setCustomerForm((prev) => ({ ...prev, birth: e.target.value }))} />
                  </label>

                  <label>
                    PIN
                    <input type="text" value={customerForm.pin} onChange={(e) => setCustomerForm((prev) => ({ ...prev, pin: e.target.value }))} />
                  </label>

                  <label>
                    E-mail
                    <input type="email" value={customerForm.email} onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))} />
                  </label>

                  <label>
                    Nível
                    <select value={customerForm.tier} onChange={(e) => setCustomerForm((prev) => ({ ...prev, tier: e.target.value }))}>
                      <option>Bronze</option>
                      <option>Prata</option>
                      <option>Ouro</option>
                      <option>Diamante</option>
                    </select>
                  </label>

                  <label className="admin-form-grid__full">
                    Endereço
                    <input type="text" value={customerForm.address} onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))} />
                  </label>

                  <div className="admin-actions admin-form-grid__full">
                    <button type="submit" className="btn-primary">
                      {customerForm.id ? "Salvar" : "Cadastrar"}
                    </button>

                    {customerForm.id && (
                      <>
                        <button type="button" className="btn-ghost" onClick={handleNewCustomer}>
                          Limpar
                        </button>
                        <button type="button" className="btn-danger" onClick={handleDeleteCustomerClick}>
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </form>

                {selectedCustomer && (
                  <div className="admin-detail-box">
                    <strong>Resumo</strong>
                    <span>Pontos: {selectedCustomer.points}</span>
                    <span>Gasto: {money(selectedCustomer.totalSpent)}</span>
                    <span>Visitas: {selectedCustomer.visits}</span>
                  </div>
                )}
              </section>

              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Base</h3>
                  <span>{filteredCustomers.length} item(ns)</span>
                </div>

                <div className="admin-list">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className={`admin-list-item admin-list-item--button ${
                        selectedCustomerId === customer.id ? "is-selected" : ""
                      }`}
                      onClick={() => handleSelectCustomerRow(customer.id)}
                    >
                      <div className="admin-list-item__top">
                        <strong>{customer.name}</strong>
                        <span className="admin-tag is-success">{customer.tier}</span>
                      </div>

                      <div className="admin-list-item__meta">
                        {customer.phone} • {customer.email || "sem e-mail"}
                      </div>

                      <div className="admin-list-item__note">
                        Pontos: {customer.points} • Gasto: {money(customer.totalSpent)}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
        )}

        {activePage === "cardapio" && (
          <section className="admin-page">
            <div className="admin-section-hero">
              <div>
                <h2>Cardápio</h2>
                <p>Itens e disponibilidade.</p>
              </div>

              <div className="admin-actions">
                <button type="button" className="btn-secondary" onClick={handleNewProduct}>
                  Novo produto
                </button>
              </div>
            </div>

            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>{productForm.id ? "Editar produto" : "Novo produto"}</h3>
                  <span>{productForm.id ? "Produto selecionado" : "Preencha os dados"}</span>
                </div>

                <form className="admin-form-grid admin-form-grid--triple" onSubmit={handleProductSubmit}>
                  <label>
                    Nome
                    <input type="text" value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </label>

                  <label>
                    Categoria
                    <select value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}>
                      <option>Açaí</option>
                      <option>Sorvete</option>
                      <option>Combo</option>
                      <option>Bebida</option>
                      <option>Extra</option>
                    </select>
                  </label>

                  <label>
                    Preço
                    <input type="text" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} />
                  </label>

                  <label className="admin-form-grid__full">
                    Descrição
                    <textarea value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} />
                  </label>

                  <label>
                    Disponível
                    <select
                      value={productForm.available ? "true" : "false"}
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
                  </label>

                  <div className="admin-actions admin-form-grid__full">
                    <button type="submit" className="btn-primary">
                      {productForm.id ? "Salvar" : "Cadastrar"}
                    </button>

                    {productForm.id && (
                      <>
                        <button type="button" className="btn-ghost" onClick={handleNewProduct}>
                          Limpar
                        </button>
                        <button type="button" className="btn-danger" onClick={handleDeleteProductClick}>
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </section>

              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Itens</h3>
                  <span>{products.length} item(ns)</span>
                </div>

                <div className="admin-list">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className={`admin-list-item admin-list-item--button ${
                        productForm.id === product.id ? "is-selected" : ""
                      }`}
                      onClick={() => handleEditProduct(product)}
                    >
                      <div className="admin-list-item__top">
                        <strong>{product.name}</strong>
                        <span className={`admin-tag ${product.available ? "is-success" : "is-danger"}`}>
                          {product.available ? "Disponível" : "Indisponível"}
                        </span>
                      </div>

                      <div className="admin-list-item__meta">
                        {product.category} • {money(product.price)}
                      </div>

                      <div className="admin-list-item__note">{product.description}</div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
        )}

        {activePage === "pedidos" && (
          <section className="admin-page">
            <div className="admin-section-hero">
              <h2>Pedidos</h2>
              <p>Lançamento e acompanhamento.</p>
            </div>

            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Novo pedido</h3>
                  <span>Atualiza pontos do cliente</span>
                </div>

                <form className="admin-form-grid" onSubmit={handleOrderSubmit}>
                  <label>
                    Cliente
                    <select value={orderForm.customerId} onChange={(e) => setOrderForm((prev) => ({ ...prev, customerId: e.target.value }))}>
                      <option value="">Selecione</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Produto
                    <select value={orderForm.productId} onChange={(e) => setOrderForm((prev) => ({ ...prev, productId: e.target.value }))}>
                      <option value="">Selecione</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Canal
                    <select value={orderForm.channel} onChange={(e) => setOrderForm((prev) => ({ ...prev, channel: e.target.value }))}>
                      <option>Balcão</option>
                      <option>Retirada</option>
                      <option>Delivery</option>
                    </select>
                  </label>

                  <label>
                    Status
                    <select value={orderForm.status} onChange={(e) => setOrderForm((prev) => ({ ...prev, status: e.target.value }))}>
                      <option>Recebido</option>
                      <option>Em preparo</option>
                      <option>Pronto</option>
                      <option>Saiu para entrega</option>
                      <option>Entregue</option>
                      <option>Cancelado</option>
                    </select>
                  </label>

                  <label>
                    Valor total
                    <input type="text" value={orderForm.total} onChange={(e) => setOrderForm((prev) => ({ ...prev, total: e.target.value }))} />
                  </label>

                  <label>
                    Observação
                    <input type="text" value={orderForm.note} onChange={(e) => setOrderForm((prev) => ({ ...prev, note: e.target.value }))} />
                  </label>

                  <div className="admin-actions admin-form-grid__full">
                    <button type="submit" className="btn-primary">
                      Salvar pedido
                    </button>
                  </div>
                </form>
              </section>

              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Pedidos</h3>
                  <span>{orders.length} registro(s)</span>
                </div>

                <div className="admin-list">
                  {orders.map((order) => (
                    <article key={order.id} className="admin-list-item">
                      <div className="admin-list-item__top">
                        <strong>{order.customerName}</strong>
                        <span className={`admin-tag ${statusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="admin-list-item__meta">
                        {order.productName} • {order.channel} • {money(order.total)}
                      </div>

                      <div className="admin-list-item__note">{order.note}</div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        )}

        {activePage === "fidelidade" && (
          <section className="admin-page">
            <div className="admin-section-hero">
              <h2>Fidelidade</h2>
              <p>Regras do programa.</p>
            </div>

            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Regras</h3>
                  <span>Configuração atual</span>
                </div>

                <div className="admin-summary">
                  <div className="admin-summary-item">
                    Cada R$ 1,00 gera <strong>{config.pointsPerReal}</strong> pontos.
                  </div>
                  <div className="admin-summary-item">
                    Meta atual: <strong>{money(config.spendGoal)}</strong>.
                  </div>
                  <div className="admin-summary-item">
                    Check-in: <strong>{config.checkinPercent}%</strong>.
                  </div>
                </div>
              </section>

              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Bônus manual</h3>
                  <span>Pontos extras</span>
                </div>

                <form className="admin-form-grid" onSubmit={handleBonusSubmit}>
                  <label>
                    Cliente
                    <select value={bonusForm.customerId} onChange={(e) => setBonusForm((prev) => ({ ...prev, customerId: e.target.value }))}>
                      <option value="">Selecione</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Pontos
                    <input type="text" value={bonusForm.points} onChange={(e) => setBonusForm((prev) => ({ ...prev, points: e.target.value }))} />
                  </label>

                  <div className="admin-actions admin-form-grid__full">
                    <button type="submit" className="btn-secondary">
                      Adicionar pontos
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </section>
        )}

        {activePage === "promocoes" && (
          <section className="admin-page">
            <div className="admin-section-hero">
              <div>
                <h2>Promoções</h2>
                <p>Campanhas e destaque da loja.</p>
              </div>

              <div className="admin-actions">
                <button type="button" className="btn-secondary" onClick={handleNewPromo}>
                  Nova promoção
                </button>
              </div>
            </div>

            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>{promoForm.id ? "Editar promoção" : "Nova promoção"}</h3>
                  <span>{promoForm.id ? "Promoção selecionada" : "Preencha os dados"}</span>
                </div>

                <form className="admin-form-grid" onSubmit={handlePromoSubmit}>
                  <label>
                    Título
                    <input type="text" value={promoForm.title} onChange={(e) => setPromoForm((prev) => ({ ...prev, title: e.target.value }))} />
                  </label>

                  <label>
                    Tipo
                    <select value={promoForm.type} onChange={(e) => setPromoForm((prev) => ({ ...prev, type: e.target.value }))}>
                      <option>Happy Hour</option>
                      <option>Produto da semana</option>
                      <option>Combo</option>
                      <option>Aniversário</option>
                    </select>
                  </label>

                  <label className="admin-form-grid__full">
                    Descrição
                    <textarea value={promoForm.description} onChange={(e) => setPromoForm((prev) => ({ ...prev, description: e.target.value }))} />
                  </label>

                  <label className="admin-form-grid__full">
                    Imagem (opcional)
                    <input type="text" value={promoForm.image} onChange={(e) => setPromoForm((prev) => ({ ...prev, image: e.target.value }))} placeholder="URL" />
                  </label>

                  <div className="admin-actions admin-form-grid__full">
                    <button type="submit" className="btn-primary">
                      {promoForm.id ? "Salvar" : "Cadastrar"}
                    </button>

                    {promoForm.id && (
                      <>
                        <button type="button" className="btn-ghost" onClick={handleNewPromo}>
                          Limpar
                        </button>
                        <button type="button" className="btn-danger" onClick={handleDeletePromoClick}>
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </section>

              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Campanhas</h3>
                  <span>{promos.length} item(ns)</span>
                </div>

                <div className="admin-list">
                  {promos.map((promo) => (
                    <button
                      key={promo.id}
                      type="button"
                      className={`admin-list-item admin-list-item--button ${
                        promoForm.id === promo.id ? "is-selected" : ""
                      }`}
                      onClick={() => handleEditPromo(promo)}
                    >
                      <div className="admin-list-item__top">
                        <strong>{promo.title}</strong>
                        <span className="admin-tag is-warning">{promo.type}</span>
                      </div>

                      <div className="admin-list-item__note">{promo.description}</div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
        )}

        {activePage === "configuracoes" && (
          <section className="admin-page">
            <div className="admin-section-hero">
              <h2>Configurações</h2>
              <p>White-label, regras e equipe.</p>
            </div>

            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>Marca e regras</h3>
                  <span>Personalização da empresa</span>
                </div>

                <form className="admin-form-grid" onSubmit={handleConfigSubmit}>
                  <label>
                    Nome do software
                    <input
                      type="text"
                      value={configForm.softwareName}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, softwareName: e.target.value }))}
                    />
                  </label>

                  <label>
                    Nome da empresa
                    <input
                      type="text"
                      value={configForm.companyName}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    />
                  </label>

                  <label className="admin-form-grid__full">
                    URL da logo
                    <input
                      type="text"
                      value={configForm.logoUrl}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </label>

                  <label className="admin-form-grid__full">
                    Frase curta da tela inicial
                    <input
                      type="text"
                      value={configForm.welcomePhrase}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, welcomePhrase: e.target.value }))}
                    />
                  </label>

                  <label>
                    Instagram
                    <input
                      type="text"
                      value={configForm.instagramUrl}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                      placeholder="https://instagram.com/..."
                    />
                  </label>

                  <label>
                    WhatsApp
                    <input
                      type="text"
                      value={configForm.whatsappNumber}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                      placeholder="5511999999999"
                    />
                  </label>

                  <label className="admin-form-grid__full">
                    Mensagem do WhatsApp
                    <input
                      type="text"
                      value={configForm.whatsappMessage}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, whatsappMessage: e.target.value }))}
                    />
                  </label>

                  <label>
                    Pontos por real
                    <input
                      type="text"
                      value={configForm.pointsPerReal}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, pointsPerReal: e.target.value }))}
                    />
                  </label>

                  <label>
                    Meta de gasto
                    <input
                      type="text"
                      value={configForm.spendGoal}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, spendGoal: e.target.value }))}
                    />
                  </label>

                  <label>
                    % check-in
                    <input
                      type="text"
                      value={configForm.checkinPercent}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, checkinPercent: e.target.value }))}
                    />
                  </label>

                  <div className="admin-actions admin-form-grid__full">
                    <button type="submit" className="btn-primary">
                      Salvar configurações
                    </button>
                  </div>
                </form>
              </section>

              <section className="admin-card">
                <div className="admin-card__header">
                  <h3>{staffForm.id ? "Editar funcionário" : "Novo funcionário"}</h3>
                  <span>{staffForm.id ? "Registro selecionado" : "Acesso da equipe"}</span>
                </div>

                <form className="admin-form-grid" onSubmit={handleStaffSubmit}>
                  <label>
                    Nome
                    <input
                      type="text"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </label>

                  <label>
                    E-mail
                    <input
                      type="text"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </label>

                  <label>
                    Login
                    <input
                      type="text"
                      value={staffForm.login}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, login: e.target.value }))}
                      placeholder="ex: caixa1"
                    />
                  </label>

                  <label>
                    @id
                    <input
                      type="text"
                      value={staffForm.username}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="@ana"
                    />
                  </label>

                  <label>
                    Matrícula
                    <input
                      type="text"
                      value={staffForm.employeeId}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, employeeId: e.target.value }))}
                      placeholder="001"
                    />
                  </label>

                  <label>
                    Telefone
                    <input
                      type="text"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </label>

                  <label>
                    Cargo
                    <select
                      value={staffForm.role}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value }))}
                    >
                      <option>Administrador</option>
                      <option>Gerente</option>
                      <option>Atendente</option>
                      <option>Caixa</option>
                      <option>Funcionário</option>
                    </select>
                  </label>

                  <label>
                    Senha
                    <input
                      type="password"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                    />
                  </label>

                  <label>
                    PIN
                    <input
                      type="text"
                      value={staffForm.pin}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, pin: e.target.value }))}
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={staffForm.active ? "true" : "false"}
                      onChange={(e) =>
                        setStaffForm((prev) => ({
                          ...prev,
                          active: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </label>

                  <div className="admin-actions admin-form-grid__full">
                    <button type="submit" className="btn-primary">
                      {staffForm.id ? "Salvar funcionário" : "Cadastrar funcionário"}
                    </button>

                    <button type="button" className="btn-ghost" onClick={handleNewStaff}>
                      Novo cadastro
                    </button>

                    {staffForm.id && (
                      <button type="button" className="btn-danger" onClick={handleDeleteStaffClick}>
                        Excluir
                      </button>
                    )}
                  </div>
                </form>

                <div className="admin-list" style={{ marginTop: "18px" }}>
                  {staffUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className={`admin-list-item admin-list-item--button ${
                        selectedStaffId === user.id ? "is-selected" : ""
                      }`}
                      onClick={() => handleEditStaff(user)}
                    >
                      <div className="admin-list-item__top">
                        <strong>{user.name}</strong>
                        <span className={`admin-tag ${user.active ? "is-success" : "is-danger"}`}>
                          {user.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="admin-list-item__meta">
                        {user.username || user.login || user.employeeId || "sem identificador"}
                      </div>

                      <div className="admin-list-item__note">
                        {user.role} • {user.phone || user.email || "sem contato"}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}