export const ALL_CATEGORIES = [
  "Semua",
  "Tata Bahasa",
  "Kosakata",
  "Kanji",
  "Percakapan",
  "Budaya",
] as const;

export type MaterialCategory = (typeof ALL_CATEGORIES)[number];

type CategoryMeta = {
  color: string;
  soft: string;
  icon: string;
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  "Tata Bahasa": { color: "#C0272D", soft: "#FFF0F0", icon: "Lang" },
  "Kosakata": { color: "#059669", soft: "#ECFDF5", icon: "Kata" },
  "Kanji": { color: "#7C3AED", soft: "#F5F3FF", icon: "Kanji" },
  "Percakapan": { color: "#2563EB", soft: "#EFF6FF", icon: "Talk" },
  "Budaya": { color: "#D97706", soft: "#FFFBEB", icon: "Budaya" },
};

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? { color: "#C0272D", soft: "#FFF0F0", icon: "Materi" };
}
