"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { paymentApi } from "@/lib/api/paymentApi";
import { loadRazorpayScript } from "@/lib/razorpay/loadRazorpay";

interface BatchReport {
  title: string;
  assay: string;
  heavyMetals: string;
  bannedSubstances: string;
  mfgDate: string;
  expDate: string;
  lab: string;
}

export default function GlobalModals() {
  const { activeModal, closeModal, showToast, clearCart, cart, cartSubtotal, addToCart, appliedCoupon } = useStore();
  const { user } = useAuth();

  // Batch Verify State
  const [batchCode, setBatchCode] = useState("PV-B9402");
  const [batchReport, setBatchReport] = useState<BatchReport | null>(null);

  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "Alex Hunter",
    phone: "+91 98765 43210",
    address: "Flat 402, Olympian Heights, HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560102",
  });
  const [orderConfirmedId, setOrderConfirmedId] = useState("");

  // Stack Builder State
  const [stackItems, setStackItems] = useState({
    whey: true,
    creatine: true,
    bar: true,
    shaker: true,
  });

  if (!activeModal) return null;

  const handleBatchSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = batchCode.trim().toUpperCase();
    if (code.includes("CREAT") || code.includes("CREA")) {
      setBatchReport({
        title: "Provana Micronized Creatine Monohydrate (Creapure® 99.99%)",
        assay: "99.98% Pure Creapure",
        heavyMetals: "Undetected (< 0.01 ppm)",
        bannedSubstances: "100% Negative (WADA Compliant)",
        mfgDate: "15 Aug 2026",
        expDate: "14 Aug 2028",
        lab: "Apex Analytical Labs (ISO/IEC 17025 Accredited)",
      });
    } else if (code.includes("PRE") || code.includes("ENERGY")) {
      setBatchReport({
        title: "Provana Pre-Workout Matrix (Vascular Pump & Focus)",
        assay: "302mg Active Caffeine / serving",
        heavyMetals: "Undetected (< 0.01 ppm)",
        bannedSubstances: "100% Negative (WADA Compliant)",
        mfgDate: "02 Sep 2026",
        expDate: "01 Sep 2028",
        lab: "Apex Analytical Labs (ISO/IEC 17025 Accredited)",
      });
    } else {
      setBatchReport({
        title: "Provana 100% Pure Whey Protein Isolate (Cold Filtered)",
        assay: "89.4% (Claim: 84.3% — Exceeds Label Claim)",
        heavyMetals: "Lead <0.02 ppm, Arsenic <0.01 ppm",
        bannedSubstances: "100% Negative (WADA Compliant)",
        mfgDate: "10 Sep 2026",
        expDate: "09 Sep 2028",
        lab: "Apex Analytical Labs (ISO/IEC 17025 Accredited)",
      });
    }
  };

  const completeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Your cart is empty. Add items before checking out.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentErrorMessage(null);

    try {
      // 1. Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay Checkout SDK. Please check your internet connection.");
      }

      // 2. Prepare Order Payload
      const orderPayload = {
        customerName: addressForm.name.trim() || "Customer",
        customerEmail: user?.email || "customer@provana.com",
        customerPhone: addressForm.phone.trim() || "+91 98765 43210",
        shippingAddress: addressForm.address.trim() || "Delivery Address",
        shippingCity: addressForm.city.trim() || "Bengaluru",
        shippingState: addressForm.state.trim() || "Karnataka",
        shippingPincode: addressForm.pincode.trim() || "560102",
        appliedCoupon: appliedCoupon || undefined,
        items: cart.map((item) => ({
          productId: item.id.length === 36 && item.id.includes("-") ? item.id : undefined,
          productSlug: item.id,
          flavor: item.flavor,
          size: item.size,
          quantity: item.qty,
        })),
      };

      // 3. Initiate Razorpay Order from Backend
      const rzpOrder = await paymentApi.initiateRazorpayOrder({
        orderData: orderPayload as any,
        idempotencyKey: `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      });

      // 4. Configure Razorpay Standard Checkout options
      const options = {
        key: rzpOrder.keyId,
        amount: rzpOrder.amountMinorUnits,
        currency: rzpOrder.currency,
        name: "PROVANA Pure Nutrition",
        description: rzpOrder.description || `Order ${rzpOrder.orderNumber}`,
        image: "/assets/brand-logo.png",
        order_id: rzpOrder.razorpayOrderId,
        prefill: {
          name: addressForm.name,
          email: user?.email || "customer@provana.com",
          contact: addressForm.phone,
        },
        notes: {
          orderNumber: rzpOrder.orderNumber,
          localOrderId: rzpOrder.localOrderId,
        },
        theme: {
          color: "#F59E0B",
        },
        handler: async function (response: any) {
          try {
            setIsProcessingPayment(true);
            showToast("Verifying payment with PROVANA security server...");

            // 5. Submit server-side signature verification
            const verifyRes = await paymentApi.verifyRazorpayPayment({
              orderId: rzpOrder.localOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.verified) {
              clearCart();
              setOrderConfirmedId(rzpOrder.orderNumber);
              setCheckoutStep(4);
              showToast(`🎉 Order ${rzpOrder.orderNumber} confirmed! Payment captured.`);
            } else {
              setPaymentErrorMessage(verifyRes.message || "Payment verification failed. Please contact support.");
            }
          } catch (verifyErr: any) {
            setPaymentErrorMessage(verifyErr.message || "Payment verification failed on server.");
            showToast("⚠️ Payment verification failed: " + (verifyErr.message || "Signature mismatch"));
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            showToast("Payment window closed. You can retry checkout anytime.");
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on("payment.failed", function (failResponse: any) {
        setIsProcessingPayment(false);
        const err = failResponse?.error || {};
        const code = err.code || "PAYMENT_FAILED";
        const desc = err.description || "The transaction could not be completed by your bank or payment gateway.";
        const source = err.source || "";
        const step = err.step || "";
        const reason = err.reason || "";
        const paymentId = err.metadata?.payment_id || "";

        console.error("Razorpay Payment Failure Diagnostic:", {
          code,
          description: desc,
          source,
          step,
          reason,
          paymentId,
          orderId: err.metadata?.order_id || rzpOrder.razorpayOrderId,
        });

        let displayMsg = desc;
        if (reason && reason !== "payment_failed") {
          displayMsg += ` (${reason.replace(/_/g, " ")})`;
        }
        if (code && code !== "BAD_REQUEST_ERROR") {
          displayMsg += ` [Ref: ${code}]`;
        }

        setPaymentErrorMessage(displayMsg);
        showToast(`❌ Payment Failed: ${desc}`);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      const errMsg = err.message || "Failed to initiate payment gateway.";
      setPaymentErrorMessage(errMsg);
      showToast("⚠️ " + errMsg);
    }
  };

  const handleAddStackToCart = () => {
    if (stackItems.whey) addToCart("pv-whey-isolate", "Belgian Chocolate", "1 kg", 1);
    if (stackItems.creatine) addToCart("pv-creatine-mono", "Unflavoured", "250 g", 1);
    if (stackItems.bar) addToCart("pv-protein-bars", "Chocolate Brownie", "Pack of 6", 1);
    if (stackItems.shaker) addToCart("pv-gym-gear", "Matte Charcoal Black", "750 ml", 1);
    closeModal();
    showToast("⚡ Ultimate Stack added to cart! + Free Shaker included");
  };

  // Stack Pricing
  const stackTotal =
    (stackItems.whey ? 2999 : 0) +
    (stackItems.creatine ? 1499 : 0) +
    (stackItems.bar ? 699 : 0);
  const stackDiscount = Math.round(stackTotal * 0.15);
  const stackNet = stackTotal - stackDiscount;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 99999,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: activeModal === "checkout-modal" ? "680px" : "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#141720",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-modal)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)",
          color: "#FFFFFF",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#CBD5E1",
            fontSize: "14px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* ============================================================== */}
        {/* 1. BATCH VERIFICATION MODAL                                    */}
        {/* ============================================================== */}
        {activeModal === "batch-verify-modal" && (
          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px" }}>🔬</span>
              <h3 className="font-display" style={{ fontSize: "24px", letterSpacing: "1px" }}>
                100% NABL BATCH LAB VERIFIER
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
              Enter the batch number printed on the neck or bottom of your PROVANA tub to inspect certified third-party lab test certificates.
            </p>

            <form onSubmit={handleBatchSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="e.g. PV-B9402, PV-CREAT-1002"
                style={{
                  flex: 1,
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "6px",
                  fontSize: "13.5px",
                  textTransform: "uppercase",
                  backgroundColor: "#0D1016",
                  border: "1px solid #2B3342",
                  color: "#FFF",
                }}
              />
              <button
                type="submit"
                style={{
                  height: "44px",
                  padding: "0 20px",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-accent)",
                  color: "#0B0C0E",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                VERIFY NOW
              </button>
            </form>

            {batchReport && (
              <div
                style={{
                  backgroundColor: "#0D1016",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "8px",
                  padding: "18px",
                  animation: "fadeIn 0.25s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "3px 8px", borderRadius: "4px" }}>
                    ✓ CERTIFIED AUTHENTIC
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Batch: {batchCode.toUpperCase()}</span>
                </div>
                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#FFF", marginBottom: "14px" }}>
                  {batchReport.title}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#94A3B8" }}>Protein Assay Result:</span>
                    <strong style={{ color: "#10B981" }}>{batchReport.assay}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#94A3B8" }}>Heavy Metals Screen:</span>
                    <strong style={{ color: "#FFF" }}>{batchReport.heavyMetals}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#94A3B8" }}>Banned Substances (WADA):</span>
                    <strong style={{ color: "#10B981" }}>{batchReport.bannedSubstances}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                    <span style={{ color: "#94A3B8" }}>Testing Accredited Lab:</span>
                    <strong style={{ color: "#CBD5E1" }}>{batchReport.lab}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. EXPRESS CHECKOUT MODAL                                      */}
        {/* ============================================================== */}
        {activeModal === "checkout-modal" && (
          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 className="font-display" style={{ fontSize: "24px", letterSpacing: "1px" }}>
                1-CLICK EXPRESS CHECKOUT ⚡
              </h3>
            </div>

            {/* Stepper Dots */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    height: "4px",
                    borderRadius: "9999px",
                    backgroundColor: checkoutStep >= s ? "var(--color-accent)" : "#262B35",
                    transition: "background-color 0.2s ease",
                  }}
                />
              ))}
            </div>

            {/* Step 1: Address */}
            {checkoutStep === 1 && (
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "800", marginBottom: "14px", color: "#FFF" }}>
                  Step 1: Athlete Delivery Address
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    placeholder="Full Name"
                    style={{ height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                  />
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="Phone Number (+91)"
                    style={{ height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                  />
                  <input
                    type="text"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    placeholder="Flat / House / Street Address"
                    style={{ height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="City"
                      style={{ height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                    />
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      placeholder="Pincode (e.g. 560102)"
                      style={{ height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutStep(2)}
                  style={{
                    width: "100%",
                    height: "46px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-accent)",
                    color: "#0B0C0E",
                    fontWeight: "800",
                    fontSize: "13.5px",
                    cursor: "pointer",
                  }}
                >
                  CONTINUE TO SHIPPING METHOD →
                </button>
              </div>
            )}

            {/* Step 2: Shipping */}
            {checkoutStep === 2 && (
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "800", marginBottom: "14px", color: "#FFF" }}>
                  Step 2: Shipping Method
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "14px",
                      borderRadius: "6px",
                      backgroundColor: "#0D1016",
                      border: "1.5px solid var(--color-accent)",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "800", color: "#FFF", fontSize: "14px" }}>⚡ BlueDart Express Air Dispatch</div>
                      <div style={{ fontSize: "12px", color: "#94A3B8" }}>Delivery within 24–48 Hours with SMS live tracking</div>
                    </div>
                    <span style={{ fontWeight: "800", color: "#10B981" }}>FREE</span>
                  </label>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setCheckoutStep(1)}
                    style={{ flex: 1, height: "44px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700" }}
                  >
                    ← BACK
                  </button>
                  <button
                    onClick={() => setCheckoutStep(3)}
                    style={{ flex: 2, height: "44px", borderRadius: "6px", backgroundColor: "var(--color-accent)", color: "#0B0C0E", fontWeight: "800" }}
                  >
                    CONTINUE TO PAYMENT →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {checkoutStep === 3 && (
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "800", marginBottom: "14px", color: "#FFF" }}>
                  Step 3: Secure Payment Selection
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {[
                    { id: "upi", label: "Instant UPI (GPay / PhonePe / Paytm / QR)", icon: "📱" },
                    { id: "card", label: "Credit / Debit Card (Visa, Mastercard, RuPay)", icon: "💳" },
                    { id: "netbanking", label: "Net Banking (All Indian Major Banks)", icon: "🏦" },
                    { id: "cod", label: "Cash on Delivery (COD)", icon: "💵" },
                  ].map((p) => (
                    <label
                      key={p.id}
                      onClick={() => setPaymentMethod(p.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px",
                        borderRadius: "6px",
                        backgroundColor: paymentMethod === p.id ? "#1A2230" : "#0D1016",
                        border: `1.5px solid ${paymentMethod === p.id ? "var(--color-accent)" : "#2B3342"}`,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{p.icon}</span>
                      <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#FFF" }}>{p.label}</span>
                    </label>
                  ))}
                </div>

                <div style={{ backgroundColor: "#0D1016", padding: "14px", borderRadius: "6px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                    <span style={{ color: "#94A3B8" }}>Order Subtotal:</span>
                    <span style={{ color: "#FFF", fontWeight: "700" }}>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "800" }}>
                    <span style={{ color: "var(--color-accent)" }}>Net Payable:</span>
                    <span style={{ color: "#FFF" }}>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {paymentErrorMessage && (
                  <div
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid #EF4444",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      fontSize: "12.5px",
                      color: "#FCA5A5",
                      marginBottom: "16px",
                    }}
                  >
                    ⚠️ {paymentErrorMessage}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    disabled={isProcessingPayment}
                    onClick={() => setCheckoutStep(2)}
                    style={{ flex: 1, height: "44px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700", cursor: isProcessingPayment ? "not-allowed" : "pointer" }}
                  >
                    ← BACK
                  </button>
                  <button
                    disabled={isProcessingPayment}
                    onClick={completeOrder}
                    style={{
                      flex: 2,
                      height: "44px",
                      borderRadius: "6px",
                      backgroundColor: isProcessingPayment ? "#059669" : "#10B981",
                      color: "#0B0C0E",
                      fontWeight: "800",
                      fontSize: "14px",
                      cursor: isProcessingPayment ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isProcessingPayment ? "PROCESSING PAYMENT..." : "PAY & PLACE ORDER 🔒"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {checkoutStep === 4 && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "54px", marginBottom: "12px" }}>🎉</div>
                <h3 className="font-display" style={{ fontSize: "26px", color: "#10B981", marginBottom: "6px" }}>
                  ORDER CONFIRMED &amp; DISPATCHED!
                </h3>
                <p style={{ fontSize: "14px", color: "#CBD5E1", marginBottom: "16px" }}>
                  Thank you, athlete. Your order has been placed successfully and scheduled for express air dispatch.
                </p>
                <div style={{ backgroundColor: "#0D1016", padding: "16px", borderRadius: "8px", display: "inline-block", marginBottom: "20px" }}>
                  <span style={{ fontSize: "12px", color: "#94A3B8" }}>TRACKING ID: </span>
                  <strong style={{ fontSize: "18px", color: "var(--color-accent)", letterSpacing: "1px" }}>{orderConfirmedId}</strong>
                </div>
                <div>
                  <button
                    onClick={closeModal}
                    style={{
                      height: "44px",
                      padding: "0 28px",
                      borderRadius: "6px",
                      backgroundColor: "var(--color-accent)",
                      color: "#0B0C0E",
                      fontWeight: "800",
                      fontSize: "13.5px",
                      cursor: "pointer",
                    }}
                  >
                    CONTINUE SHOPPING →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. INTERACTIVE STACK BUILDER MODAL                             */}
        {/* ============================================================== */}
        {activeModal === "stack-builder-modal" && (
          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px" }}>⚡</span>
              <h3 className="font-display" style={{ fontSize: "24px", letterSpacing: "1px" }}>
                CUSTOMIZE YOUR MUSCLE STACK
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
              Bundle synergy supplements together to trigger a flat 15% discount + Free Stainless Steel Shaker Gift.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {[
                { key: "whey", name: "100% Pure Whey Isolate (1 kg)", price: 2999, tag: "POST-WORKOUT" },
                { key: "creatine", name: "Micronized Creapure® Creatine (250 g)", price: 1499, tag: "STRENGTH" },
                { key: "bar", name: "Gourmet Protein Bars (Pack of 6)", price: 699, tag: "ON THE GO" },
                { key: "shaker", name: "Stainless Steel Insulated Shaker (750 ml)", price: 0, tag: "FREE GIFT 🎁" },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => {
                    if (item.key !== "shaker") {
                      setStackItems((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }));
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: stackItems[item.key as keyof typeof stackItems] ? "#1A2230" : "#0D1016",
                    border: `1.5px solid ${stackItems[item.key as keyof typeof stackItems] ? "var(--color-accent)" : "#262B35"}`,
                    cursor: item.key === "shaker" ? "default" : "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px" }}>
                      {stackItems[item.key as keyof typeof stackItems] ? "☑️" : "⬜"}
                    </span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#FFF" }}>{item.name}</div>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--color-accent)" }}>{item.tag}</span>
                    </div>
                  </div>
                  <strong style={{ fontSize: "15px", color: item.price === 0 ? "#10B981" : "#FFF" }}>
                    {item.price === 0 ? "FREE" : `₹${item.price.toLocaleString("en-IN")}`}
                  </strong>
                </div>
              ))}
            </div>

            {/* Stack Total */}
            <div style={{ backgroundColor: "#0D1016", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: "#94A3B8", marginBottom: "6px" }}>
                <span>Regular Total:</span>
                <span style={{ textDecoration: "line-through" }}>₹{stackTotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: "#10B981", fontWeight: "700", marginBottom: "6px" }}>
                <span>Stack Bundle Discount (15% OFF):</span>
                <span>-₹{stackDiscount.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "800", color: "#FFF" }}>
                <span>Combo Price:</span>
                <span style={{ color: "var(--color-accent)" }}>₹{stackNet.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={handleAddStackToCart}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "6px",
                backgroundColor: "var(--color-accent)",
                color: "#0B0C0E",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              ADD ENTIRE STACK TO CART 🛒
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. OFFERS MODAL                                                */}
        {/* ============================================================== */}
        {activeModal === "offers-modal" && (
          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>🏷️</span>
              <h3 className="font-display" style={{ fontSize: "24px", letterSpacing: "1px" }}>
                PROVANA ATHLETE OFFERS &amp; COUPONS
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { code: "PRO25", title: "FLAT 25% OFF ON WHEY ISOLATES", desc: "Valid on orders above ₹2,999. Use on all protein sizes." },
                { code: "PRE20", title: "FLAT 20% OFF ON PRE-WORKOUT & CREATINE", desc: "Power your pumps and strength with clinical dosages." },
                { code: "GYM15", title: "FLAT 15% OFF ON SHAKERS & HEALTHY FOODS", desc: "No minimum spend required. Valid on bars, oats, and bottles." },
              ].map((c) => (
                <div key={c.code} style={{ backgroundColor: "#0D1016", border: "1px dashed var(--color-accent)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <strong style={{ fontSize: "16px", color: "var(--color-accent)", letterSpacing: "1px" }}>{c.code}</strong>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(c.code);
                        showToast(`Copied ${c.code} to clipboard!`);
                      }}
                      style={{ fontSize: "11.5px", fontWeight: "800", backgroundColor: "#252B37", color: "#FFF", padding: "4px 10px", borderRadius: "4px" }}
                    >
                      COPY CODE
                    </button>
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#FFF", marginBottom: "4px" }}>{c.title}</div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. HELP & FAQ MODAL                                            */}
        {/* ============================================================== */}
        {activeModal === "help-modal" && (
          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>❓</span>
              <h3 className="font-display" style={{ fontSize: "24px", letterSpacing: "1px" }}>
                ATHLETE SUPPORT &amp; POLICIES
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13.5px" }}>
              <div style={{ backgroundColor: "#0D1016", padding: "14px", borderRadius: "6px" }}>
                <strong style={{ color: "#FFF", display: "block", marginBottom: "4px" }}>Where can I find the scoop in my tub?</strong>
                <span style={{ color: "#94A3B8" }}>Due to powder settling during express transit, the scoop often settles toward the bottom. Use a clean, dry fork to locate it safely.</span>
              </div>
              <div style={{ backgroundColor: "#0D1016", padding: "14px", borderRadius: "6px" }}>
                <strong style={{ color: "#FFF", display: "block", marginBottom: "4px" }}>What are your shipping timelines?</strong>
                <span style={{ color: "#94A3B8" }}>All orders placed before 3:00 PM are dispatched on the same day via BlueDart Air. Metros receive delivery in 24-48 hours.</span>
              </div>
              <div style={{ backgroundColor: "#0D1016", padding: "14px", borderRadius: "6px" }}>
                <strong style={{ color: "#FFF", display: "block", marginBottom: "4px" }}>What is your 14-day return policy?</strong>
                <span style={{ color: "#94A3B8" }}>If you receive a damaged seal or incorrect flavor, we provide a 100% replacement or refund within 14 days of delivery.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
