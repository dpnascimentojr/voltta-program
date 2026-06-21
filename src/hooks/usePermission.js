// src/hooks/usePermission.js
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../lib/permissions";

export function usePermission(permissionCode) {
  const { profile } = useAuth();
  return hasPermission(profile, permissionCode);
}