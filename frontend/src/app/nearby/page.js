"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, X, Star, Navigation, Calendar, Ruler } from "lucide-react";
import { getNearby } from "@/lib/api";
import { CATEGORY_COLORS, CATEGORIES, CategoryIcon } from "@/lib/categories";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function NearbyPage() {
  const [form, setForm] = useState({ lat: "", lng: "", radius_km: "", category: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [centerOn, setCenterOn] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const doSearch = async (lat, lng, radius, cat) => {
    if (!lat || !lng || !radius) return;
    setLoading(true);
    setError("");
    setSelected(null);
    try {
      const res = await getNearby(lat, lng, radius, cat || null);
      setResults(res.data);
      setCenterOn({ lat: parseFloat(lat), lng: parseFloat(lng), ts: Date.now() });
      // On desktop auto-open sidebar, on mobile keep it closed so map is visible
      if (!isMobile) setSidebarOpen(true);
    } catch { setError("Search failed. Check inputs."); }
    finally { setLoading(false); }
  };

  const handleSearch = () => doSearch(form.lat, form.lng, form.radius_km, form.category);

  const handleCategoryChange = (cat) => {
    setForm(f => ({ ...f, category: cat }));
    doSearch(form.lat, form.lng, form.radius_km, cat);
  };

  const handleListClick = (s) => {
    setSelected(s);
    setCenterOn({ lat: s.latitude, lng: s.longitude, ts: Date.now() });
    if (isMobile) setSidebarOpen(false); // close sidebar on mobile to show map
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>

      {/* Search inputs — 2×2 grid on mobile, single row on desktop */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "12px 16px" }}>
        {/* Desktop: single row | Mobile: 2x2 grid */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }} className="search-desktop-row">
          <input placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} style={desktopInputStyle} />
          <input placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} style={desktopInputStyle} />
          <input placeholder="Radius (km)" value={form.radius_km} onChange={(e) => setForm({ ...form, radius_km: e.target.value })} style={{ ...desktopInputStyle, width: "100px" }} />
          <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)} style={{ ...desktopInputStyle, width: "140px" }}>
            <option value="">All Categories</option>
            {CATEGORIES.filter(c => c.value).map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button onClick={handleSearch} style={{ padding: "9px 18px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(59,130,246,0.4)", whiteSpace: "nowrap" }}>
            <Search size={14} />{loading ? "Searching..." : "Search"}
          </button>
          {results.length > 0 && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>
              {sidebarOpen ? "✕ Hide" : `☰ ${results.length} Results`}
            </button>
          )}
        </div>
        {error && <p style={{ color: "#fca5a5", fontSize: "13px", margin: "6px 0 0" }}>{error}</p>}
      </div>

      {/* Map + Sidebar */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* Map always full */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Map services={results} onMarkerClick={handleListClick} centerOn={centerOn} />
        </div>

        {/* Sidebar — desktop: left panel | mobile: slide from right overlay */}
        {sidebarOpen && results.length > 0 && (
          <>
            <div style={{
              position: isMobile ? "absolute" : "relative",
              top: isMobile ? 0 : "auto",
              left: isMobile ? 0 : "auto",
              bottom: isMobile ? 0 : "auto",
              width: isMobile ? "65%" : "320px",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              boxShadow: isMobile ? "4px 0 24px rgba(0,0,0,0.2)" : "2px 0 12px rgba(0,0,0,0.1)",
              zIndex: 20,
              overflow: "hidden",
              height: "100%",
              flexShrink: 0,
              transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}>
              <div style={{ padding: "12px 16px", background: "linear-gradient(135deg,#0f172a,#1e3a5f)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>
                  {selected ? "Service Details" : `${results.length} Results Found`}
                </span>
                <button onClick={() => { setSidebarOpen(false); setSelected(null); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={13} />
                </button>
              </div>
              {selected
                ? <NearbyDetailPanel service={selected} onBack={() => setSelected(null)} />
                : <div style={{ flex: 1, overflowY: "auto" }}>{results.map(s => <NearbyListItem key={s.id} service={s} onClick={() => handleListClick(s)} />)}</div>
              }
            </div>
          </>
        )}

        {/* FAB to reopen sidebar on mobile after closing */}
        {!sidebarOpen && results.length > 0 && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 10, background: "#1e293b", color: "#fff", border: "none", borderRadius: "24px", padding: "10px 20px", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Search size={14} /> {results.length} Results
          </button>
        )}
      </div>
    </div>
  );
}

function NearbyListItem({ service: s, onClick }) {
  const cat = s.category?.toLowerCase();
  const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
  return (
    <div onClick={onClick} style={{ padding: "11px 12px", cursor: "pointer", background: "#fff", margin: "6px 8px", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "11px" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}
    >
      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${color}18`, border: `1.5px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <CategoryIcon category={cat} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#1e293b" }}>{s.name}</div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
          <span style={{ color, fontWeight: 600 }}>{s.category}</span> · <Star size={10} style={{ display: "inline", verticalAlign: "middle" }} color="#f59e0b" fill="#f59e0b" /> {s.rating ?? "N/A"}
        </div>
      </div>
      <div style={{ fontSize: "11px", fontWeight: 700, color, background: `${color}15`, padding: "3px 8px", borderRadius: "10px", flexShrink: 0 }}>{s.distance_km} km</div>
    </div>
  );
}

function NearbyDetailPanel({ service: s, onBack }) {
  const cat = s.category?.toLowerCase();
  const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", padding: "0 0 10px", display: "flex", alignItems: "center", gap: "4px" }}>
        ← Back to results
      </button>
      <div style={{ borderRadius: "14px", background: `linear-gradient(135deg,${color}20,${color}08)`, border: `1.5px solid ${color}28`, padding: "16px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${color}50`, flexShrink: 0 }}>
            <CategoryIcon category={cat} size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{s.name}</div>
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, background: color, color: "#fff", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.category}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={13} fill={s.rating && i <= Math.round(s.rating) ? "#f59e0b" : "none"} color={s.rating && i <= Math.round(s.rating) ? "#f59e0b" : "#cbd5e1"} />)}
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b", marginLeft: "5px" }}>{s.rating ?? "N/A"}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { icon: <Ruler size={14} color="#22c55e" />, label: "Distance", value: `${s.distance_km} km`, bg: "#f0fdf4" },
          { icon: <Navigation size={14} color="#3b82f6" />, label: "Coordinates", value: `${s.latitude}, ${s.longitude}`, bg: "#eff6ff" },
          { icon: <Calendar size={14} color="#8b5cf6" />, label: "Added On", value: new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), bg: "#f5f3ff" },
        ].map(({ icon, label, value, bg }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: bg, borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const desktopInputStyle = { padding: "9px 12px", borderRadius: "6px", border: "none", fontSize: "14px", background: "rgba(255,255,255,0.95)", outline: "none", width: "130px" };
const inputStyle = { padding: "9px 12px", borderRadius: "8px", border: "none", fontSize: "14px", background: "rgba(255,255,255,0.95)", outline: "none", width: "100%" };
