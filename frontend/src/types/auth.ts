export type UserRole = "ADMIN" | "PRODUCT_MANAGER" | "MANAGER" | "CUSTOMER";

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
    title: "Super Admin",
    email: "admin@provana.com",
    password: "Admin@123",
    icon: "👑",
    badge: "SUPER ADMIN",
    color: "#EF4444",
    permissions: ["USER_MANAGE", "ORDER_MANAGE", "CATALOGUE_WRITE", "CATALOGUE_DELETE"],
    description: "Full master privilege: configure RBAC, price override, and view enterprise audit logs.",
  },
  {
    role: "PRODUCT_MANAGER",
    title: "Product Manager",
    email: "pm@provana.com",
    password: "Pm@123",
    icon: "📦",
    badge: "PROD MGR",
    color: "#F59E0B",
    permissions: ["CATALOGUE_READ", "CATALOGUE_WRITE", "CATALOGUE_DELETE"],
    description: "Catalogue owner: create and update products, set pricing, upload Supabase assets.",
  },
  {
    role: "MANAGER",
    title: "Store Manager",
    email: "manager@provana.com",
    password: "Manager@123",
    icon: "🏪",
    badge: "MANAGER",
    color: "#3B82F6",
    permissions: ["ORDER_MANAGE", "CATALOGUE_READ"],
    description: "Operations lead: manage customer order status, dispatch fulfillment, and stock.",
  },
  {
    role: "CUSTOMER",
    title: "Athlete (Customer)",
    email: "customer@provana.com",
    password: "Customer@123",
    icon: "🛒",
    badge: "ATHLETE",
    color: "#10B981",
    permissions: ["CATALOGUE_READ", "ORDER_CREATE", "PROFILE_EDIT"],
    description: "E-Commerce athlete: browse supplements, stack builder, checkout, and order history.",
  },
];
