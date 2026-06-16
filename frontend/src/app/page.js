"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal, X, Star, Navigation, Calendar, ChevronRight } from "lucide-react";
import { getServices } from "@/lib/api";
import { CATEGORY_COLORS, CATEGORY_BG, CATEGORIES, CategoryIcon } from "@/lib/categories";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  const [centerOn, setCenterOn] = useState(null);

  useEffect(() => {
    getServices(category || null).then((r) => {
      setServices(r.data);
      setSelected(prev => prev ? (r.data.find(s => s.id === prev.id) || null) : null);
    }).catch(console.error);
  }, [category]);

  const handleMarkerClick = (s) => { setSelected(s); setSidebarOpen(true); };
  const handleListClick = (s) => { setSelected(s); setCenterOn({ lat: s.latitude, lng: s.longitude }); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      {/* Filter Bar */}
      <div className="filter-scroll" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "10px 20px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap" }}>
        <SlidersHorizontal size={15} color="rgba(255,255,255,0.5)" />
        {CATEGORIES.map((c) => {
          const active = category === c.value;
          const col = CATEGORY_COLORS[c.value] || "#3b82f6";
          return (
            <button key={c.value} onClick={() => { setCategory(c.value); setSelected(null); }} style={{
              padding: "6px 14px", borderRadius: "20px", border: active ? "none" : "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer", fontSize: "13px", fontWeight: active ? 700 : 400,
              background: active ? col : "rgba(255,255,255,0.08)",
              color: "#fff", display: "flex", alignItems: "center", gap: "6px",
              boxShadow: active ? `0 2px 8px ${col}60` : "none", transition: "all 0.2s",
            }}>
              <CategoryIcon category={c.value || "others"} size={13} color="#fff" />
              {c.label}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{services.length} services</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
          {sidebarOpen ? "◀ Hide" : "▶ List"}
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {sidebarOpen && (
          <div className="sidebar-panel" style={{ width: "300px", background: "#f8fafc", display: "flex", flexDirection: "column", boxShadow: "2px 0 12px rgba(0,0,0,0.1)", zIndex: 5, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "linear-gradient(135deg,#0f172a,#1e3a5f)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>
                {selected ? "Service Details" : `${services.length} Services`}
              </span>
              <button onClick={() => { setSidebarOpen(false); setSelected(null); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={13} />
              </button>
            </div>
            {selected
              ? <DetailPanel service={selected} onBack={() => setSelected(null)} />
              : <div style={{ flex: 1, overflowY: "auto" }}>{services.map(s => <ListItem key={s.id} service={s} onClick={() => handleListClick(s)} />)}</div>
            }
          </div>
        )}

        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{ position: "absolute", left: "12px", top: "12px", zIndex: 20, background: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
            ▶ Show List
          </button>
        )}

        <div style={{ flex: 1 }}>
          <Map services={services} onMarkerClick={handleMarkerClick} centerOn={centerOn} />
        </div>
      </div>
    </div>
  );
}

function ListItem({ service: s, onClick }) {
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
      <ChevronRight size={14} color="#cbd5e1" />
    </div>
  );
}

function DetailPanel({ service: s, onBack }) {
  const cat = s.category?.toLowerCase();
  const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", padding: "0 0 10px", display: "flex", alignItems: "center", gap: "4px" }}>
        ← Back to list
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
