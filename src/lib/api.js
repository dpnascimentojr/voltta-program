import { supabase } from "./supabase";

function mapProductFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price || 0),
    description: row.description || "",
    available: !!row.available,
  };
}

function mapPromoFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.promo_type || "Promoção",
    description: row.description,
    image: row.image_url || "",
  };
}

function mapOrderFromDb(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customers?.full_name || "Cliente",
    productId: row.product_id,
    productName: row.products?.name || "Produto",
    channel: row.channel,
    status: row.status,
    total: Number(row.total || 0),
    note: row.note || "",
    createdAt: row.created_at,
  };
}

function mapConfigFromDb(row) {
  return {
    pointsPerReal: Number(row?.points_per_real || 10),
    spendGoal: Number(row?.spend_goal || 250),
    checkinPercent: Number(row?.checkin_percent || 10),
    branding: {
      softwareName: row?.software_name || "Clube Base",
      companyName: row?.company_name || "Minha Loja",
      logoUrl: row?.logo_url || "",
      instagramUrl: row?.instagram_url || "",
      whatsappNumber: row?.whatsapp_number || "",
      whatsappMessage: row?.whatsapp_message || "Olá! Vim pelo app.",
      welcomePhrase: row?.welcome_phrase || "Seu clube de pontos da loja.",
    },
  };
}

function buildCustomer(row, orders, coupons, promos) {
  const customerOrders = orders.filter((order) => order.customerId === row.id);
  const customerCoupons = coupons.filter((coupon) => coupon.customer_id === row.id);

  return {
    id: row.id,
    name: row.full_name,
    phone: row.phone,
    birth: row.birth_date || "",
    pin: row.pin,
    email: row.email || "",
    address: row.address || "",
    tier: row.tier || "Bronze",
    points: Number(row.points || 0),
    totalSpent: Number(row.total_spent || 0),
    visits: customerOrders.length,
    cashback: 0,
    coupons: customerCoupons.map((coupon) => ({
      id: coupon.id,
      title:
        coupon.coupon_type === "checkin_instagram"
          ? `${coupon.percent}% no check-in Instagram`
          : `${coupon.percent}% no próximo pedido`,
      code: coupon.code,
      percent: Number(coupon.percent || 0),
      active: !coupon.used,
    })),
    promotions: promos.map((promo) => promo.description),
    history: customerOrders.map((order) => ({
      id: order.id,
      product: order.productName,
      amount: order.total,
      date: order.createdAt,
    })),
  };
}

export async function fetchAllData() {
  const [
    customersRes,
    productsRes,
    promosRes,
    ordersRes,
    couponsRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("promotions").select("*").order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*, customers(full_name), products(name)")
      .order("created_at", { ascending: false }),
    supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    supabase.from("settings").select("*").order("id", { ascending: true }).limit(1).maybeSingle(),
  ]);

  if (customersRes.error) throw customersRes.error;
  if (productsRes.error) throw productsRes.error;
  if (promosRes.error) throw promosRes.error;
  if (ordersRes.error) throw ordersRes.error;
  if (couponsRes.error) throw couponsRes.error;
  if (settingsRes.error) throw settingsRes.error;

  const products = (productsRes.data || []).map(mapProductFromDb);
  const promos = (promosRes.data || []).map(mapPromoFromDb);
  const orders = (ordersRes.data || []).map(mapOrderFromDb);
  const coupons = couponsRes.data || [];
  const config = mapConfigFromDb(settingsRes.data);

  const customers = (customersRes.data || []).map((row) =>
    buildCustomer(row, orders, coupons, promos)
  );

  return { customers, products, promos, orders, config };
}

export async function fetchPendingCheckins() {
  const { data, error } = await supabase
    .from("checkin_requests")
    .select("*, customers(full_name, phone)")
    .eq("status", "pending")
    .order("requested_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function requestInstagramCheckin({ customerId, instagramHandle, storeLabel }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingRes = await supabase
    .from("checkin_requests")
    .select("id")
    .eq("customer_id", customerId)
    .eq("status", "pending")
    .gte("requested_at", todayStart.toISOString())
    .limit(1);

  if (existingRes.error) throw existingRes.error;

  if ((existingRes.data || []).length > 0) {
    throw new Error("Você já tem um check-in pendente hoje. Mostre no balcão para liberar.");
  }

  const { error } = await supabase.from("checkin_requests").insert({
    customer_id: customerId,
    instagram_handle: instagramHandle || "",
    store_label: storeLabel || "",
    status: "pending",
  });

  if (error) throw error;
}

export async function approveCheckin({ requestId, customerId, percent, approvedBy }) {
  const code = `CHECKIN${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const couponRes = await supabase.from("coupons").insert({
    customer_id: customerId,
    code,
    coupon_type: "checkin_instagram",
    percent: Number(percent || 10),
    used: false,
  });

  if (couponRes.error) throw couponRes.error;

  const requestRes = await supabase
    .from("checkin_requests")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: approvedBy || "Equipe",
    })
    .eq("id", requestId);

  if (requestRes.error) throw requestRes.error;
}

export async function rejectCheckin({ requestId, approvedBy, notes }) {
  const { error } = await supabase
    .from("checkin_requests")
    .update({
      status: "rejected",
      approved_at: new Date().toISOString(),
      approved_by: approvedBy || "Equipe",
      notes: notes || "Check-in não validado no balcão.",
    })
    .eq("id", requestId);

  if (error) throw error;
}

export async function createCustomer(payload) {
  const { error } = await supabase.from("customers").insert({
    full_name: payload.name,
    phone: payload.phone,
    birth_date: payload.birth || null,
    pin: payload.pin,
    email: payload.email || null,
    address: payload.address || null,
    tier: payload.tier || "Bronze",
    points: 0,
    total_spent: 0,
  });

  if (error) throw error;
}

export async function updateCustomer(payload) {
  const { error } = await supabase
    .from("customers")
    .update({
      full_name: payload.name,
      phone: payload.phone,
      birth_date: payload.birth || null,
      pin: payload.pin,
      email: payload.email || null,
      address: payload.address || null,
      tier: payload.tier || "Bronze",
    })
    .eq("id", payload.id);

  if (error) throw error;
}

export async function deleteCustomer(customerId) {
  const couponsDelete = await supabase.from("coupons").delete().eq("customer_id", customerId);
  if (couponsDelete.error) throw couponsDelete.error;

  const ordersDelete = await supabase.from("orders").delete().eq("customer_id", customerId);
  if (ordersDelete.error) throw ordersDelete.error;

  const checkinsDelete = await supabase.from("checkin_requests").delete().eq("customer_id", customerId);
  if (checkinsDelete.error) throw checkinsDelete.error;

  const customerDelete = await supabase.from("customers").delete().eq("id", customerId);
  if (customerDelete.error) throw customerDelete.error;
}

export async function createProduct(payload) {
  const { error } = await supabase.from("products").insert({
    name: payload.name,
    category: payload.category,
    price: Number(payload.price || 0),
    description: payload.description || null,
    available: !!payload.available,
  });

  if (error) throw error;
}

export async function updateProduct(payload) {
  const { error } = await supabase
    .from("products")
    .update({
      name: payload.name,
      category: payload.category,
      price: Number(payload.price || 0),
      description: payload.description || null,
      available: !!payload.available,
    })
    .eq("id", payload.id);

  if (error) throw error;
}

export async function deleteProduct(productId) {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

export async function createPromo(payload) {
  const { error } = await supabase.from("promotions").insert({
    title: payload.title,
    promo_type: payload.type,
    description: payload.description,
    image_url: payload.image || null,
  });

  if (error) throw error;
}

export async function updatePromo(payload) {
  const { error } = await supabase
    .from("promotions")
    .update({
      title: payload.title,
      promo_type: payload.type,
      description: payload.description,
      image_url: payload.image || null,
    })
    .eq("id", payload.id);

  if (error) throw error;
}

export async function deletePromo(promoId) {
  const { error } = await supabase.from("promotions").delete().eq("id", promoId);
  if (error) throw error;
}

export async function saveConfig(payload) {
  const { error } = await supabase
    .from("settings")
    .update({
      points_per_real: Number(payload.pointsPerReal || 10),
      spend_goal: Number(payload.spendGoal || 250),
      checkin_percent: Number(payload.checkinPercent || 10),
      software_name: payload.softwareName || "Clube Base",
      company_name: payload.companyName || "Minha Loja",
      logo_url: payload.logoUrl || "",
      instagram_url: payload.instagramUrl || "",
      whatsapp_number: payload.whatsappNumber || "",
      whatsapp_message: payload.whatsappMessage || "Olá! Vim pelo app.",
      welcome_phrase: payload.welcomePhrase || "Seu clube de pontos da loja.",
    })
    .eq("id", 1);

  if (error) throw error;
}

export async function addBonus({ customerId, points }) {
  const current = await supabase.from("customers").select("points").eq("id", customerId).single();
  if (current.error) throw current.error;

  const { error } = await supabase
    .from("customers")
    .update({
      points: Number(current.data.points || 0) + Number(points || 0),
    })
    .eq("id", customerId);

  if (error) throw error;
}

export async function createOrder(payload, config) {
  const customerRes = await supabase.from("customers").select("*").eq("id", payload.customerId).single();
  if (customerRes.error) throw customerRes.error;

  const total = Number(payload.total || 0);

  const orderRes = await supabase.from("orders").insert({
    customer_id: payload.customerId,
    product_id: payload.productId,
    channel: payload.channel,
    status: payload.status,
    total,
    note: payload.note || null,
  });

  if (orderRes.error) throw orderRes.error;

  const updateRes = await supabase
    .from("customers")
    .update({
      total_spent: Number(customerRes.data.total_spent || 0) + total,
      points: Number(customerRes.data.points || 0) + total * Number(config.pointsPerReal || 10),
    })
    .eq("id", payload.customerId);

  if (updateRes.error) throw updateRes.error;
}