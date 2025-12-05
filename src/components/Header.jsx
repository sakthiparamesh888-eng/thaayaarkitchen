// src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/Logocp.jpg";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-header">
      <div className="header-inner">

        {/* BRAND BLOCK */}
        <div className="brand-block">
          <img src={Logo} alt="Logo" className="brand-logo" />

          <div className="brand-text">
            <span className="brand-en lugrasimo">Thaayar Kitchen</span>
            <span className="brand-ta">தாயார் கிச்சன்</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/orders?meal=lunch">Menu</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/about">About</Link>
        </nav>

        {/* Hamburger */}
        <div
  className={`hamburger ${open ? "open" : ""}`}
  onClick={() => setOpen(!open)}
>
  <span className="line"></span>
  <span className="line"></span>
  <span className="line"></span>
</div>

      </div>

      {/* MOBILE MENU */}
      {open && (
        <>
          <div className="overlay" onClick={() => setOpen(false)} />

          <div className="mobile-menu show">
            

            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/orders?meal=lunch" onClick={() => setOpen(false)}>Menu</Link>
            <Link to="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
            <Link to="/reviews" onClick={() => setOpen(false)}>Reviews</Link>
            <Link to="/about" onClick={() => setOpen(false)}>About</Link>
          </div>
        </>
      )}
    </header>
  );
}
