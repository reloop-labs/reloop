export const LABEL_COLORS = [
	{ id: "default", hex: "#9B9B9B", label: "Gray" },
	{ id: "red", hex: "#EF4444", label: "Red" },
	{ id: "orange", hex: "#F97316", label: "Orange" },
	{ id: "amber", hex: "#F59E0B", label: "Amber" },
	{ id: "green", hex: "#22C55E", label: "Green" },
	{ id: "teal", hex: "#14B8A6", label: "Teal" },
	{ id: "blue", hex: "#3B82F6", label: "Blue" },
	{ id: "indigo", hex: "#6366F1", label: "Indigo" },
	{ id: "purple", hex: "#A855F7", label: "Purple" },
	{ id: "pink", hex: "#EC4899", label: "Pink" },
] as const;

export type LabelColorId = (typeof LABEL_COLORS)[number]["id"];

/** Resolve a stored label color (named id or hex) to a paint color. */
export function resolveLabelColor(color: string | undefined): string {
	if (!color || color === "default") return "#9B9B9B";
	const named = LABEL_COLORS.find((c) => c.id === color);
	if (named) return named.hex;
	return color;
}
