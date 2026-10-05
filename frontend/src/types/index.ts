export interface NutritionFacts {
  servingSize: string;
  servingsPerContainer: number;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface NutritionMetric {
  metric: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  goal: string;
  badge: string;
  highlight: string;
  price: number;
  mrp: number;
  discount: string;
  rating: number;
  reviewCount: number;
  img: string;
  minimalDesc: string;
  flavors: string[];
  sizes: string[];
  nutritionFacts: NutritionFacts;
  claims: string[];
  nutrition: NutritionMetric[];
  ingredients: string;
  allergens: string;
  howToUse: string;
  inStock?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  flavor: string;
  size: string;
  price: number;
  mrp: number;
  img: string;
  qty: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
}

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "COD";
  orderStatus: "PLACED" | "CONFIRMED" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED";
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  headline: string;
  comment: string;
  verifiedBuyer: boolean;
}
