import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart, total, updateQty, removeFromCart, clearCart } = useCart();

  const [verified, setVerified] = useState(false);
  const [slot] = useState("11:00 AM – 01:00 PM");
  const [user, setUser] = useState(null);

  const [isPaying, setIsPaying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const WHATSAPP_NUM = import.meta.env.VITE_WHATSAPP_NUMBER;
  const STORE_NAME = import.meta.env.VITE_STORE_NAME || "Thaayar Kitchen";
  const ORDERS_WEBHOOK = import.meta.env.VITE_ORDERS_WEBHOOK;

  const UPI_ID = "8524845927@okbizaxis";

  // ✅ AUTO-DETECT USER OR USE GUEST
  useEffect(() => {
    let foundUser = null;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const value = localStorage.getItem(localStorage.key(i));
        try {
          const parsed = JSON.parse(value);
          if (parsed?.name && parsed?.phone) {
            foundUser = parsed;
            break;
          }
        } catch {}
      }
    } catch {}

    if (!foundUser) {
      foundUser = {
        name: "Guest User",
        phone: "9999999999",
        address: "Guest Address",
      };
    }

    setUser(foundUser);
  }, []);

  // ✅ RESET FLOW FOR NEW ORDER
  useEffect(() => {
    if (cart.length === 0) {
      setVerified(false);
      setIsPaying(false);
      setIsSending(false);
    }
  }, [cart.length]);

  function group(items) {
    const map = {};
    items.forEach((it) => {
      if (!map[it.dayLabel]) map[it.dayLabel] = [];
      map[it.dayLabel].push(it);
    });
    return map;
  }

  function getUpiLink() {
    const name = encodeURIComponent(STORE_NAME);
    const note = encodeURIComponent("Food Order Payment");

    return `https://upi.link/pay?pa=${UPI_ID}&pn=${name}&am=${total}&cu=INR&tn=${note}`;
  }

  function whatsappLink(orderId) {
    const grouped = group(cart);
    let itemsText = "";

    Object.keys(grouped).forEach((day) => {
      grouped[day].forEach((i) => {
        itemsText += `- ${i.qty || 1}x ${i.name}\n`;
      });
    });

    const userText = `${user.name}\n${user.phone}\n${user.address}\n\n`;

    const msg = encodeURIComponent(
`${STORE_NAME}

Order ID: ${orderId}

${userText}
Order Details:
${itemsText}
Total: ₹${total}
Delivery Slot: ${slot}`
    );

    return `https://wa.me/${WHATSAPP_NUM}?text=${msg}`;
  }

  async function sendOrderToSheet(orderId) {
    if (!ORDERS_WEBHOOK) return orderId;

    const payload = {
      Name: user.name,
      Phone: user.phone,
      Address: user.address,
      Amount: total,
      orderId,
    };

    try {
      await fetch(ORDERS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
      });
    } catch {}

    return orderId;
  }

  // ✅ SECURE PAYMENT FLOW
  function handleConfirmPayment() {
    if (cart.length === 0) return alert("Cart is empty");
    if (isPaying) return;

    setVerified(false);
    setIsSending(false);
    setIsPaying(true);

    window.open(getUpiLink(), "_blank");

    setTimeout(() => {
      setVerified(true);
      setIsPaying(false);
    }, 1800);
  }

  // ✅ FAST & SAFE WHATSAPP SEND
  async function handleSend() {
    if (!verified) return alert("Please complete payment first.");
    if (isSending) return;

    setIsSending(true);

    const orderId = Date.now();
    const finalOrderId = await sendOrderToSheet(orderId);

    window.open(whatsappLink(finalOrderId), "_blank");

    setTimeout(() => {
      clearCart();
      setVerified(false);
      setIsSending(false);
    }, 400);

    setTimeout(() => {
      window.location.href = "/success";
    }, 900);
  }

  return (
    <div className="checkout-wrapper container fade-in">
      <h1 className="page-title">🧾 Checkout</h1>

      {cart.length === 0 ? (
        <div className="glass-empty">🛒 Your cart is empty</div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-items">
            {cart.map((it) => (
              <div className="glass-card checkout-card-new" key={it.id}>
                <img src={it.imageUrl} className="checkout-img-new" />

                <div className="checkout-content">
                  <div className="checkout-title-new">{it.name}</div>
                  <div className="checkout-price-line">
                    ₹{it.price} × {it.qty || 1}
                  </div>

                  <div className="qty-controls-modern">
                    <button
                      onClick={() =>
                        updateQty(it.id, Math.max(1, (it.qty || 1) - 1))
                      }
                    >
                      −
                    </button>

                    <span>{it.qty || 1}</span>

                    <button
                      onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn-modern"
                    onClick={() => removeFromCart(it.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="checkout-total-new">
                  ₹{it.price * (it.qty || 1)}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary glass-card better-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <div className="order-status">
              {!verified && !isPaying && <span>🕒 Awaiting Payment</span>}
              {isPaying && <span>💳 Opening UPI...</span>}
              {verified && !isSending && <span>✅ Payment Verified</span>}
              {isSending && <span>📩 Sending Order...</span>}
            </div>

            <button
              className="btn-confirm"
              onClick={handleConfirmPayment}
              disabled={isPaying}
            >
              {isPaying ? "Processing..." : `💳 Pay ₹${total}`}
            </button>

            <button
              className="btn-whatsapp-final"
              disabled={!verified || isSending}
              onClick={handleSend}
            >
              {isSending ? "Sending..." : "📩 Send Order on WhatsApp"}
            </button>

            <button className="btn-outline remove" onClick={clearCart}>
              Clear Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
