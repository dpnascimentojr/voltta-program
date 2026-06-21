// src/lib/auth.js
import { supabase } from "./supabase";

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchEmployeeProfile(userId) {
  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, email, phone, role_code, active")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    phone: data.phone,
    role: data.role_code,
    active: data.active,
    type: "employee",
  };
}

export async function fetchCustomerProfile(customerId) {
  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, email, phone, active")
    .eq("id", customerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    phone: data.phone,
    active: data.active,
    role: "customer",
    type: "customer",
  };
}