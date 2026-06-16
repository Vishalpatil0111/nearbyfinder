"use client";
import { useEffect, useState } from "react";
import { Star, MapPin, Clock, Filter } from "lucide-react";
import { getServices } from "@/lib/api";
import { CATEGORY_COLORS, CATEGORY_BG, CATEGORIES, CategoryIcon } from "@/lib/categories";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    getServices(category || null).then((r) => setServices(r.data)).catch(console.error);
  }, [category]);

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#f1f5f9" }}>
      <div className="services-header" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "28px 32px" }}>
        <h1 style={{ color: "#fff", margin: "0 0 4px", fontSize: "24px", fontWeight: 700 }}>Service Directory</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: "14px" }}>Discover hospitals, ATMs, shops and more near you</p>
      </div>

      <div className="filter-bar filter-scroll" style={{ background: "#fff", padding: "12px 32px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", position: "sticky", top: "56px", zIndex: 10 }}>
        <Filter size={14} color="#64748b" />
        <span style={{ fontSize: "13px", color: "#64748b" }}>Filter:</span>
        {CATEGORIES.map((c) => {
          const active = category === c.value;
          const col = CATEGORY_COLORS[c.value] || "#1e293b";
          return (
            <button key={c.value} onClick={() => setCategory(c.value)} style={{
              padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
              fontWeight: active ? 700 : 500, border: "none",
              background: active ? col : "#f1f5f9",
              color: active ? "#fff" : "#475569",
              boxShadow: active ? `0 2px 8px ${col}50` : "none",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px",
            }}>
              <CategoryIcon category={c.value || "others"} size={13} color={active ? "#fff" : col} />
              {c.label}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#94a3b8" }}>{services.length} results</span>
      </div>

      <div className="services-grid" style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
        {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        {services.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            <MapPin size={48} color="#cbd5e1" style={{ marginBottom: "12px" }} />
            <div style={{ fontSize: "16px" }}>No services found</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service: s }) {
  const cat = s.category?.toLowerCase();
  const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
  return (
    <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", transition: "transform 0.2s,box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)"; }}
    >
      <div style={{ background: `linear-gradient(135deg,${color}22,${color}08)`, padding: "20px", borderBottom: `2px solid ${color}20`, display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${color}40`, flexShrink: 0 }}>
          <CategoryIcon category={cat} size={24} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
          <span style={{ display: "inline-block", marginTop: "4px", padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, background: color, color: "#fff", textTransform: "uppercase", letterSpacing: "0.8px" }}>
            {s.category}
          </span>
        </div>
      </div>

      <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={13} fill={s.rating && i <= Math.round(s.rating) ? "#f59e0b" : "none"} color={s.rating && i <= Math.round(s.rating) ? "#f59e0b" : "#e2e8f0"} />
          ))}
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b", marginLeft: "4px" }}>{s.rating ?? "—"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
          <MapPin size={12} color={color} />
          <span>{s.latitude}, {s.longitude}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94a3b8", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
          <Clock size={12} color="#94a3b8" />
          <span>Added {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}
