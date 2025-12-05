import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import "./styles.css";
import Logo from "./assets/Logocp.jpg";


// Dynamically set favicon from src/assets
const favicon = document.querySelector("link[rel='icon']");
if (favicon) favicon.href = Logo;


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
