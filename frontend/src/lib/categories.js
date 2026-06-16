import { Heart, CreditCard, ShoppingBag, MapPin } from "lucide-react";

export const CATEGORY_COLORS = {
  hospital: "#ef4444",
  atm: "#3b82f6",
  shop: "#22c55e",
  others: "#a855f7",
  default: "#64748b",
};

export const CATEGORY_BG = {
  hospital: "#fef2f2",
  atm: "#eff6ff",
  shop: "#f0fdf4",
  others: "#faf5ff",
  default: "#f8fafc",
};

export const CATEGORY_LABELS = {
  hospital: "Hospital",
  atm: "ATM",
  shop: "Shop",
  others: "Others",
};

export function CategoryIcon({ category, size = 18, color }) {
  const cat = category?.toLowerCase();
  const c = color || CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
  if (cat === "hospital") return <Heart size={size} color={c} />;
  if (cat === "atm") return <CreditCard size={size} color={c} />;
  if (cat === "shop") return <ShoppingBag size={size} color={c} />;
  return <MapPin size={size} color={c} />;
}

export const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Hospital", value: "hospital" },
  { label: "ATM", value: "atm" },
  { label: "Shop", value: "shop" },
  { label: "Others", value: "others" },
];
