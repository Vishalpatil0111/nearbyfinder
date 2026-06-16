"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MapPin, Menu, X } from "lucide-react";
import { isAuthenticated, logout as apiLogout } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsAdmin(isAuthenticated());
    setMenuOpen(false);
  }, [pathname]);

  const logout = () => {
    apiLogout();
    setMenuOpen(false);
    router.push("/");
  };

  const links = [
    { href: "/", label: "Map" },
    { href: "/nearby", label: "Nearby Search" },
    { href: "/services", label: "Services" },
    ...(isAdmin ? [{ href: "/admin/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <>
      <nav style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", height: "56px", display: "flex", alignItems: "center", padding: "0 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", position: "sticky", top: 0, zIndex: 100, gap: "8px" }}>
        {/* Logo */}
        <Link href="/" style={{ color: "#fff", fontWeight: 800, fontSize: "17px", textDecoration: "none", display: "flex", alignItems: "center", gap: "7px", marginRight: "8px", flexShrink: 0 }}>
          <MapPin size={20} color="#3b82f6" />
          <span>NearbyFinder</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} style={{ color: pathname === href ? "#fff" : "#94a3b8", textDecoration: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: pathname === href ? 600 : 400, background: pathname === href ? "rgba(255,255,255,0.1)" : "transparent", whiteSpace: "nowrap" }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="nav-links" style={{ display: "flex", marginLeft: "auto", alignItems: "center", gap: "8px" }}>
          {isAdmin ? (
            <button onClick={logout} style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>Logout</button>
          ) : (
            <Link href="/admin/login" style={{ color: "#fff", background: "linear-gradient(135deg,#3b82f6,#2563eb)", padding: "7px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>Admin Login</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-mobile-menu" onClick={() => setMenuOpen(true)} style={{ display: "none", marginLeft: "auto", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#fff", alignItems: "center", justifyContent: "center" }}>
          <Menu size={20} />
        </button>
      </nav>

      {/* Mobile overlay backdrop */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199, backdropFilter: "blur(2px)" }} />
      )}

      {/* Mobile drawer — slides from RIGHT, 60% width, full height */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "60%", maxWidth: "320px",
        background: "#0f172a",
        zIndex: 200,
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: menuOpen ? "-8px 0 32px rgba(0,0,0,0.5)" : "none",
      }}>
        {/* Drawer header */}
        <div style={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={18} color="#3b82f6" />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>NearbyFinder</span>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", padding: "14px 20px", color: pathname === href ? "#fff" : "#94a3b8", textDecoration: "none", fontSize: "15px", fontWeight: pathname === href ? 600 : 400, background: pathname === href ? "rgba(59,130,246,0.15)" : "transparent", borderLeft: pathname === href ? "3px solid #3b82f6" : "3px solid transparent", marginBottom: "2px" }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Auth button at bottom */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {isAdmin ? (
            <button onClick={logout} style={{ width: "100%", padding: "12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
              Logout
            </button>
          ) : (
            <Link href="/admin/login" onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "12px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700, boxShadow: "0 4px 12px rgba(59,130,246,0.35)" }}>
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
