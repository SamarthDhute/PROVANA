"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartItem, Product } from "@/types";
import { PROVANA_PRODUCTS } from "@/data/products";

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  activeModal: string | null;
  selectedProductForModal: Product | null;
  toastMessage: string | null;
  appliedCoupon: string | null;
  registerProducts: (products: Product[]) => void;
  addToCart: (productOrId: string | Product, flavor?: string, size?: string, qty?: number) => void;
  updateCartItemQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleCart: (force?: boolean) => void;
  openModal: (modalId: string, product?: Product | null) => void;
  closeModal: () => void;
  showToast: (msg: string) => void;
  applyCoupon: (code: string) => { success: boolean; discountPercent: number; message: string };
  buyNow: (productOrId: string | Product, flavor?: string, size?: string, qty?: number) => void;
  cartCount: number;
  cartSubtotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [productRegistry, setProductRegistry] = useState<Record<string, Product>>({});

  // Register dynamic products fetched from backend
  const registerProducts = useCallback((products: Product[]) => {
    if (!products || products.length === 0) return;
    setProductRegistry((prev) => {
      const updated = { ...prev };
      products.forEach((p) => {
        if (p?.id) updated[p.id] = p;
        if (p?.slug) updated[p.slug] = p;
      });
      return updated;
    });
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("provana_cart");
      const savedWishlist = localStorage.getItem("provana_wishlist");
      queueMicrotask(() => {
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      });
    } catch (e) {
      console.warn("Storage not available:", e);
    }
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem("provana_cart", JSON.stringify(cart));
      localStorage.setItem("provana_wishlist", JSON.stringify(wishlist));
    } catch {
      // pass
    }
  }, [cart, wishlist]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const resolveProduct = useCallback(
    (productOrId: string | Product): Product => {
      if (typeof productOrId === "object" && productOrId !== null) {
        registerProducts([productOrId]);
        return productOrId;
      }

      const idOrSlug = String(productOrId).trim();
      const found =
        productRegistry[idOrSlug] ||
        PROVANA_PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ||
        Object.values(productRegistry).find((p) => p.id === idOrSlug || p.slug === idOrSlug);

      if (found) return found;

      // Safe fallback product representation
      return {
        id: idOrSlug,
        slug: idOrSlug,
        name: "PROVANA Pure Formula",
        category: "Performance",
        goal: "Muscle Growth",
        badge: "Lab Pure",
        highlight: "NABL Certified",
        price: 1999,
        mrp: 2499,
        discount: "20% OFF",
        rating: 4.9,
        reviewCount: 150,
        img: "/assets/products/whey-isolate.png",
        minimalDesc: "High purity lab-grade nutritional supplement.",
        flavors: ["Rich Chocolate", "Vanilla"],
        sizes: ["1 kg", "2 kg"],
        nutritionFacts: {
          servingSize: "30g",
          servingsPerContainer: 33,
          calories: 120,
          protein: "27g",
          carbs: "1g",
          fat: "0.5g",
        },
        claims: ["Lab Verified"],
        nutrition: [{ metric: "Protein", value: "27g" }],
        ingredients: "Pure Isolate",
        allergens: "Milk",
        howToUse: "Mix 1 scoop with 250ml cold water",
      };
    },
    [productRegistry, registerProducts]
  );

  const addToCart = useCallback(
    (productOrId: string | Product, flavor?: string, size?: string, qty = 1) => {
      const prod = resolveProduct(productOrId);
      if (!prod) return;

      const itemFlavor = flavor || (prod.flavors && prod.flavors.length > 0 ? prod.flavors[0] : "Standard") || "Standard";
      const itemSize = size || (prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : "Standard") || "Standard";

      setCart((prevCart) => {
        const existingIdx = prevCart.findIndex(
          (item) => item.id === prod.id && item.flavor === itemFlavor && item.size === itemSize
        );

        if (existingIdx > -1) {
          const updated = [...prevCart];
          updated[existingIdx].qty += qty;
          return updated;
        } else {
          return [
            ...prevCart,
            {
              id: prod.id,
              name: prod.name,
              flavor: itemFlavor,
              size: itemSize,
              price: prod.price,
              mrp: prod.mrp,
              img: prod.img,
              qty,
            },
          ];
        }
      });

      showToast(`Added to cart: ${prod.name}`);
    },
    [resolveProduct, showToast]
  );

  const updateCartItemQty = (index: number, delta: number) => {
    setCart((prevCart) => {
      if (!prevCart[index]) return prevCart;
      const updated = [...prevCart];
      updated[index].qty += delta;
      if (updated[index].qty <= 0) {
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      if (item) showToast(`Removed from cart: ${item.name}`);
      return prevCart.filter((_, i) => i !== index);
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast("Removed from Wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Added to Wishlist ❤️");
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleCart = (force?: boolean) => {
    setIsCartOpen((prev) => (typeof force === "boolean" ? force : !prev));
  };

  const openModal = (modalId: string, product: Product | null = null) => {
    setSelectedProductForModal(product);
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "PRO10") {
      setAppliedCoupon("PRO10");
      showToast("Coupon PRO10 applied (10% OFF)!");
      return { success: true, discountPercent: 10, message: "10% Discount Applied" };
    } else if (clean === "PRO25") {
      setAppliedCoupon("PRO25");
      showToast("Coupon PRO25 applied (25% OFF)!");
      return { success: true, discountPercent: 25, message: "25% Discount Applied" };
    } else if (clean === "PRE20") {
      setAppliedCoupon("PRE20");
      showToast("Coupon PRE20 applied (20% OFF)!");
      return { success: true, discountPercent: 20, message: "20% Discount Applied" };
    } else if (clean === "GYM15") {
      setAppliedCoupon("GYM15");
      showToast("Coupon GYM15 applied (15% OFF)!");
      return { success: true, discountPercent: 15, message: "15% Discount Applied" };
    } else {
      return { success: false, discountPercent: 0, message: "Invalid Coupon Code" };
    }
  };

  const buyNow = useCallback(
    (productOrId: string | Product, flavor?: string, size?: string, qty = 1) => {
      const prod = resolveProduct(productOrId);
      addToCart(prod, flavor, size, qty);
      setIsCartOpen(false);
      openModal("checkout-modal", prod);
      showToast(`⚡ Proceeding to 1-Click Checkout: ${prod.name}`);
    },
    [addToCart, resolveProduct, showToast]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        activeModal,
        selectedProductForModal,
        toastMessage,
        appliedCoupon,
        registerProducts,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        toggleCart,
        openModal,
        closeModal,
        showToast,
        applyCoupon,
        buyNow,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
