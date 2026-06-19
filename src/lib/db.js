import { supabase } from "./supabase";

function mapCustomer(row, coupons = []) {
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
    visits: Number(row.visits || 0),
    cashback: Number(row.cashback || 0),
    coupons: coupons.map((coupon) => ({
      id: coupon.id,
      title: coupon.coupon_type,
      code: coupon.code,
      percent: Number(coupon.percent || 0),
      active: !coupon.used,
    })),
    promotions: [],
    history: [],
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price || 0),
    description: row.description || "",
    available: !!row.available,
  };
}

function mapPromo(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.promo_type || "Promoção",
    description: row.description,
    image: row.image_url || "",
  };
}

function mapOrder(row) {
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

export async function fetchSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      pointsPerReal: 10,
      spendGoal: 250,
      checkinPercent: 10,
    };
  }

  return {
    pointsPerReal: Number(data.points_per_real || 10),
    spendGoal: Number(data.spend_goal || 250),
    checkinPercent: Number(data.checkin_percent || 10),
  };
}

export async function saveSettings(payload) {
  const { data: existing, error: findError } = await supabase
    .from("settings")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;

  if (existing?.id) {
    const { error } = await supabase
      .from("settings")
      .update({
        points_per_real: Number(payload.pointsPerReal || 10),
        spend_goal: Number(payload.spendGoal || 250),
        checkin_percent: Number(payload.checkinPercent || 10),
      })
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("settings").insert({
    points_per_real: Number(payload.pointsPerReal || 10),
    spend_goal: Number(payload.spendGoal || 250),
    checkin_percent: Number(payload.checkinPercent || 10),
  });

  if (error) throw error;
}

export async function fetchCustomers() {
  const { data: customerRows, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (customerError) throw customerError;

  const { data: couponRows, error: couponError } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (couponError) throw couponError;

  const couponsByCustomer = {};
  for (const coupon of couponRows || []) {
    if (!couponsByCustomer[coupon.customer_id]) {
      couponsByCustomer[coupon.customer_id] = [];
    }
    couponsByCustomer[coupon.customer_id].push(coupon);
  }

  return (customerRows || []).map((row) =>
    mapCustomer(row, couponsByCustomer[row.id] || [])
  );
}

export async function createCustomer(payload) {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: payload.name,
      phone: payload.phone,
      birth_date: payload.birth || null,
      pin: payload.pin,
      email: payload.email || null,
      address: payload.address || null,
      tier: payload.tier || "Bronze",
      points: 0,
      total_spent: 0,
      visits: 0,
      cashback: 0,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapCustomer(data, []);
}

export async function updateCustomer(payload) {
  const { data, error } = await supabase
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
    .eq("id", payload.id)
    .select("*")
    .single();

  if (error) throw error;

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("customer_id", payload.id);

  return mapCustomer(data, coupons || []);
}

export async function deleteCustomer(customerId) {
  const { error } = await supabase.from("customers").delete().eq("id", customerId);
  if (error) throw error;
}

export async function addBonusPoints({ customerId, points }) {
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (customerError) throw customerError;

  const { error } = await supabase
    .from("customers")
    .update({
      points: Number(customer.points || 0) + Number(points || 0),
    })
    .eq("id", customerId);

  if (error) throw error;
}

export async function registerCheckin({ customerId, checkinPercent }) {
  const code = `CHECKIN${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (customerError) throw customerError;

  const { error: updateError } = await supabase
    .from("customers")
    .update({
      points: Number(customer.points || 0) + 10,
      visits: Number(customer.visits || 0) + 1,
    })
    .eq("id", customerId);

  if (updateError) throw updateError;

  const { error: couponError } = await supabase.from("coupons").insert({
    customer_id: customerId,
    code,
    coupon_type: `${checkinPercent}% no check-in`,
    percent: Number(checkinPercent || 10),
    used: false,
  });

  if (couponError) throw couponError;
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function createProduct(payload) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: payload.name,
      category: payload.category,
      description: payload.description || null,
      price: Number(payload.price || 0),
      available: !!payload.available,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(payload) {
  const { data, error } = await supabase
    .from("products")
    .update({
      name: payload.name,
      category: payload.category,
      description: payload.description || null,
      price: Number(payload.price || 0),
      available: !!payload.available,
    })
    .eq("id", payload.id)
    .select("*")
    .single();

  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(productId) {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

export async function fetchPromos() {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPromo);
}

export async function createPromo(payload) {
  const { data, error } = await supabase
    .from("promotions")
    .insert({
      title: payload.title,
      promo_type: payload.type,
      description: payload.description,
      image_url: payload.image || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPromo(data);
}

export async function updatePromo(payload) {
  const { data, error } = await supabase
    .from("promotions")
    .update({
      title: payload.title,
      promo_type: payload.type,
      description: payload.description,
      image_url: payload.image || null,
    })
    .eq("id", payload.id)
    .select("*")
    .single();

  if (error) throw error;
  return mapPromo(data);
}

export async function deletePromo(promoId) {
  const { error } = await supabase.from("promotions").delete().eq("id", promoId);
  if (error) throw error;
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customers:customer_id(full_name),
      products:product_id(name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function createOrder(payload, config) {
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", payload.customerId)
    .single();

  if (customerError) throw customerError;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", payload.productId)
    .single();

  if (productError) throw productError;

  const total = Number(payload.total || 0);

  const { error: orderError } = await supabase.from("orders").insert({
    customer_id: customer.id,
    product_id: product.id,
    channel: payload.channel,
    status: payload.status,
    total,
    note: payload.note || null,
  });

  if (orderError) throw orderError;

  const { error: updateCustomerError } = await supabase
    .from("customers")
    .update({
      total_spent: Number(customer.total_spent || 0) + total,
      points: Number(customer.points || 0) + total * Number(config.pointsPerReal || 10),
      visits: Number(customer.visits || 0) + 1,
    })
    .eq("id", customer.id);

  if (updateCustomerError) throw updateCustomerError;
}