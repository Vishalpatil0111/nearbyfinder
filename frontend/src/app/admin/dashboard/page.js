"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check, MapPin, Star, AlertCircle, LayoutDashboard, Heart, CreditCard, ShoppingBag } from "lucide-react";
import { getServices, createService, updateService, deleteService, isAuthenticated } from "@/lib/api";
import { CATEGORY_COLORS, CategoryIcon } from "@/lib/categories";

const CATEGORIES = ["hospital", "atm", "shop", "others"];
const emptyForm = { name: "", category: "hospital", latitude: "", longitude: "", rating: "" };

export default function DashboardPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/admin/login"); return; }
    fetchServices();
  }, []);

  const fetchServices = () => getServices().then((r) => setServices(r.data)).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), rating: form.rating ? parseFloat(form.rating) : null };
    try {
      if (editId) { await updateService(editId, payload); setEditId(null); }
      else await createService(payload);
      setForm(emptyForm);
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.detail || "Error saving service");
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({ name: s.name, category: s.category, latitude: s.latitude, longitude: s.longitude, rating: s.rating ?? "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await deleteService(id);
    setDeleteConfirm(null);
    fetchServices();
  };

  const stats = CATEGORIES.map(c => ({ cat: c, count: services.filter(s => s.category === c).length }));

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#f1f5f9" }}>
      {/* Header */}
      <div className="dashboard-header" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutDashboard size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "20px", fontWeight: 700 }}>Admin Dashboard</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", margin: 0, fontSize: "13px" }}>{services.length} total services</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 16px rgba(59,130,246,0.4)" }}>
          <Plus size={18} /> Add Service
        </button>
      </div>

        <div className="dashboard-padding" style={{ padding: "24px 32px" }}>
        {/* Stats */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "14px", marginBottom: "24px" }}>
          {stats.map(({ cat, count }) => {
            const color = CATEGORY_COLORS[cat];
            return (
              <div key={cat} style={{ background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CategoryIcon category={cat} size={18} />
                  </div>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{count}</span>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "capitalize" }}>{cat}s</div>
              </div>
            );
          })}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "520px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", overflow: "hidden" }}>
              {/* Modal Header */}
              <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {editId ? <Pencil size={16} color="#fff" /> : <Plus size={16} color="#fff" />}
                  </div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>{editId ? "Edit Service" : "Add New Service"}</span>
                </div>
                <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); setError(""); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Service Name</label>
                    <input placeholder="e.g. City Hospital" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Category</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {CATEGORIES.map(c => {
                        const active = form.category === c;
                        const color = CATEGORY_COLORS[c];
                        return (
                          <button key={c} type="button" onClick={() => setForm({ ...form, category: c })} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: `1.5px solid ${active ? color : "#e2e8f0"}`, background: active ? `${color}15` : "#f8fafc", cursor: "pointer", fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? color : "#64748b", transition: "all 0.15s" }}>
                            <CategoryIcon category={c} size={14} color={active ? color : "#94a3b8"} />
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Latitude</label>
                    <input placeholder="e.g. 19.0728" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Longitude</label>
                    <input placeholder="e.g. 72.8826" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Rating <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional, 1–5)</span></label>
                    <input placeholder="e.g. 4.5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", marginTop: "16px" }}>
                    <AlertCircle size={15} color="#ef4444" />
                    <span style={{ color: "#ef4444", fontSize: "13px" }}>{error}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Check size={16} />{editId ? "Update Service" : "Add Service"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); setError(""); }} style={{ padding: "12px 20px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Services Table */}
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>All Services</h2>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>{services.length} entries</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Service", "Category", "Coordinates", "Rating", "Added", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const cat = s.category?.toLowerCase();
                  const color = CATEGORY_COLORS[cat] || "#64748b";
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <CategoryIcon category={cat} size={17} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: `${color}18`, color, textTransform: "capitalize" }}>{s.category}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#64748b" }}>
                          <MapPin size={12} color={color} />
                          {s.latitude}, {s.longitude}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Star size={13} color="#f59e0b" fill="#f59e0b" />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{s.rating ?? "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#94a3b8" }}>
                        {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleEdit(s)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", background: "#eff6ff", color: "#3b82f6", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(s.id)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {services.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
                <MapPin size={40} color="#e2e8f0" style={{ marginBottom: "12px" }} />
                <p style={{ margin: 0, fontSize: "15px" }}>No services yet. Add your first one!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Delete Service?</h3>
            <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box", background: "#f8fafc", transition: "border 0.2s" };
