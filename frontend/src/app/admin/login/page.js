"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { login } from "@/lib/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      router.push("/admin/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", borderRadius: "50%", background: "rgba(59,130,246,0.06)", width: `${120 + i * 80}px`, height: `${120 + i * 80}px`, top: `${10 + i * 12}%`, left: `${5 + i * 15}%` }} />
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(59,130,246,0.4)" }}>
            <MapPin size={32} color="#fff" />
          </div>
          <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: 800, margin: "0 0 6px" }}>NearbyFinder</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", margin: 0 }}>Admin Portal</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "36px", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
          <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: "0 0 6px" }}>Welcome back</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "0 0 28px" }}>Sign in to manage services</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Username</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
                  <User size={16} color="rgba(255,255,255,0.35)" />
                </div>
                <input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  style={{ width: "100%", padding: "12px 14px 12px 42px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
                  <Lock size={16} color="rgba(255,255,255,0.35)" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ width: "100%", padding: "12px 42px 12px 42px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {showPass ? <EyeOff size={16} color="rgba(255,255,255,0.35)" /> : <Eye size={16} color="rgba(255,255,255,0.35)" />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px" }}>
                <AlertCircle size={15} color="#f87171" />
                <span style={{ color: "#f87171", fontSize: "13px" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding: "13px", background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: 700, boxShadow: "0 4px 16px rgba(59,130,246,0.4)", marginTop: "4px" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "20px" }}>
          NearbyFinder Admin · Secure Access Only
        </p>
      </div>
    </div>
  );
}
