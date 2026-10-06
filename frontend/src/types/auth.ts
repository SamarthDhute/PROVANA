import { UserRole } from "@/lib/permissions";

export type { UserRole };

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface RolePreset {
  role: UserRole;
  title: string;
  email: string;
  password: string;
  icon: string;
  badge: string;
  color: string;
  permissions: string[];
  description: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    role: "ADMIN",
    title: "Platform Admin",
    email: "admin@provana.com",
    password: "Password@123",
    icon: "👑",
    badge: "SUPER ADMIN",
    color: "#EF4444",
    permissions: ["USER_MANAGE", "ROLE_MANAGE", "RBAC_MANAGE", "SYSTEM_SETTINGS_UPDATE", "CATALOGUE_WRITE", "INVENTORY_WRITE", "ORDER_MANAGE"],
    description: "Full master privilege: configure RBAC, manage users, modify system settings, and inspect audit logs.",
  },
  {
    role: "PRODUCT_MANAGER",
    title: "Product Manager",
    email: "pm@provana.com",
    password: "Password@123",
    icon: "📦",
    badge: "CATALOGUE",
    color: "#F59E0B",
    permissions: ["CATALOGUE_CREATE", "CATALOGUE_UPDATE", "CATALOGUE_DELETE", "CATALOGUE_PUBLISH", "PRODUCT_MEDIA_MANAGE"],
    description: "Catalogue owner: create and update products, manage categories, brands, variants, SKUs, and nutrition specs.",
  },
  {
    role: "MANAGER",
    title: "Store Manager",
    email: "manager@provana.com",
    password: "Password@123",
    icon: "🏪",
    badge: "STORE OPS",
    color: "#3B82F6",
    permissions: ["INVENTORY_ADJUST", "ORDER_STATUS_UPDATE", "SHIPMENT_FULFILL", "RETURN_PROCESS", "REPORT_OPERATIONAL_READ"],
    description: "Store operations lead: inventory stock adjustments, order fulfillment, shipments, returns, and operational reports.",
  },
  {
    role: "CONTENT_MANAGER",
    title: "Content Manager",
    email: "content@provana.com",
    password: "Password@123",
    icon: "✍️",
    badge: "CMS / CONTENT",
    color: "#8B5CF6",
    permissions: ["CMS_CREATE", "CMS_UPDATE", "CMS_PUBLISH", "MEDIA_UPLOAD", "REPORT_CONTENT_READ"],
    description: "Content & CMS editor: landing pages, hero banners, blogs, media library, and SEO content.",
  },
  {
    role: "ORDER_MANAGER",
    title: "Order Fulfilment",
    email: "order@provana.com",
    password: "Password@123",
    icon: "🚚",
    badge: "FULFILMENT",
    color: "#06B6D4",
    permissions: ["ORDER_READ", "ORDER_STATUS_UPDATE", "SHIPMENT_TRACK", "RETURN_PROCESS", "REFUND_CREATE"],
    description: "Fulfilment specialist: order processing, carrier tracking, package dispatch, and customer returns.",
  },
  {
    role: "CUSTOMER",
    title: "Customer / Athlete",
    email: "customer@provana.com",
    password: "Password@123",
    icon: "🛒",
    badge: "ATHLETE",
    color: "#10B981",
    permissions: ["CATALOGUE_READ", "ORDER_CREATE", "REVIEW_CREATE", "AI_ASSISTANT_USE"],
    description: "E-Commerce athlete: browse supplements, stack builder, checkout, and manage personal orders.",
  },
];
