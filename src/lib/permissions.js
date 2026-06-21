// src/lib/permissions.js
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  ATTENDANT: "attendant",
  DELIVERY: "delivery",
  CUSTOMER: "customer",
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard_view",
  CUSTOMER_CREATE: "customer_create",
  CUSTOMER_UPDATE: "customer_update",
  TICKET_OPEN: "ticket_open",
  TICKET_CLOSE: "ticket_close",
  TICKET_REOPEN: "ticket_reopen",
  DELIVERY_MANAGE: "delivery_manage",
  COUPON_CREATE: "coupon_create",
  COUPON_ASSIGN: "coupon_assign",
  COUPON_REACTIVATE: "coupon_reactivate",
  DISCOUNT_APPLY: "discount_apply",
  PROMOTION_MANAGE: "promotion_manage",
  REPORTS_VIEW: "reports_view",
  FINANCIAL_REPORTS_VIEW: "financial_reports_view",
  EMPLOYEE_MANAGE: "employee_manage",
  SETTINGS_MANAGE: "settings_manage",
  AUDIT_VIEW: "audit_view",
  OVERRIDE_AUTHORIZE: "override_authorize",
};

export const ROLE_DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.TICKET_OPEN,
    PERMISSIONS.TICKET_CLOSE,
    PERMISSIONS.TICKET_REOPEN,
    PERMISSIONS.DELIVERY_MANAGE,
    PERMISSIONS.COUPON_CREATE,
    PERMISSIONS.COUPON_ASSIGN,
    PERMISSIONS.DISCOUNT_APPLY,
    PERMISSIONS.PROMOTION_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.FINANCIAL_REPORTS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.OVERRIDE_AUTHORIZE,
  ],
  [ROLES.ATTENDANT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.TICKET_OPEN,
    PERMISSIONS.TICKET_CLOSE,
    PERMISSIONS.DELIVERY_MANAGE,
  ],
  [ROLES.DELIVERY]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.DELIVERY_MANAGE,
  ],
  [ROLES.CUSTOMER]: [],
};

export function hasPermission(profile, permissionCode) {
  if (!profile) return false;

  const directPermissions = profile.permissions || [];
  if (directPermissions.includes(permissionCode)) return true;

  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[profile.role] || [];
  return rolePermissions.includes(permissionCode);
}