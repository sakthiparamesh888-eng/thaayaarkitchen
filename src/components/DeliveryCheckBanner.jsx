import React, { useState } from "react";

export default function DeliveryCheckBanner() {
  const WHATSAPP = "+918524845927";

  // --- STEP 1 → Try High Accuracy GPS --------
  const tryHighAccuracy = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("NO_GEO");

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            type: "gps-high",
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });

  // --- STEP 2 → Try Battery-Saving GPS (Low Accuracy) ---
  const tryLowAccuracy = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("NO_GEO");

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            type: "gps-low",
          }),
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 6000 }
      );
    });

  // --- STEP 3 → IP fallback (WORKS ON ALL DEVICES) ----
  async function tryIPLocation() {
    try {
      const r = await fetch("https://ipapi.co/json/");
      const j = await r.json();
      return { lat: j.latitude, lng: j.longitude, type: "ip" };
    } catch {
      return null;
    }
  }

  // --- FINAL ACTION: Open WhatsApp with Map Link ----
  function openWhatsApp(lat, lng, method) {
    const link = `https://maps.google.com/?q=${lat},${lng}`;
    const msg = `Here is my live location (${method}): ${link} \nIs delivery available?`;

    window.open(
      `https://wa.me/${WHATSAPP.replace("+", "")}?text=${encodeURIComponent(
        msg
      )}`,
      "_blank"
    );
  }

  // --- MAIN FUNCTION HANDLING ALL FALLBACKS ---
  async function handleCheckLocation() {
    // 1) Try high accuracy GPS
    try {
      const pos = await tryHighAccuracy();
      openWhatsApp(pos.lat, pos.lng, "GPS High Accuracy");
      return;
    } catch (e) {
      console.warn("High accuracy failed → Trying low accuracy", e);
    }

    // 2) Try low accuracy GPS
    try {
      const pos = await tryLowAccuracy();
      openWhatsApp(pos.lat, pos.lng, "GPS Low Accuracy");
      return;
    } catch (e) {
      console.warn("Low accuracy failed → Trying IP", e);
    }

    // 3) Final fallback (IP)
    const ip = await tryIPLocation();
    if (ip) {
      openWhatsApp(ip.lat, ip.lng, "Network/IP");
      return;
    }

    alert("Unable to detect your location. Please enable GPS.");
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        <div style={styles.left}>
          <span style={styles.icon}>📍</span>
          <span style={styles.text}>
            Check Delivery Availability for Your Location
          </span>
        </div>

        <button style={styles.btn} onClick={handleCheckLocation}>
          Check Now
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "10px",
    animation: "fadeSlide 0.7s ease",
  },
  banner: {
    width: "100%",
    padding: "14px 20px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0, 122, 255, 0.12)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(0, 150, 255, 0.35)",
    boxShadow: "0 0 28px rgba(0,140,255,0.25)",
    color: "#dff2ff",
  },
  left: { display: "flex", alignItems: "center", gap: "10px" },
  icon: {
    fontSize: "23px",
    filter: "drop-shadow(0 0 6px rgba(0,150,255,0.8))",
  },
  text: {
    fontSize: "1rem",
    fontWeight: "600",
    letterSpacing: "0.3px",
    textShadow: "0 0 8px rgba(0,150,255,0.6)",
  },
  btn: {
    background: "linear-gradient(90deg,#3b82f6,#1e40af)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(0,140,255,0.4)",
    transition: "0.25s",
  },
};
