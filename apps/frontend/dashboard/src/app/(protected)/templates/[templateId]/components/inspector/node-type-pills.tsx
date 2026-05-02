/* ------------------------------------------------------------------ */
/* Node type pills shown at the top (Title / Subtitle / Heading / Body) */
/* ------------------------------------------------------------------ */
export const NODE_TYPES = ["Title", "Subtitle", "Heading", "Body"] as const;
export type NodeTypePill = (typeof NODE_TYPES)[number];

export function NodeTypePills({
	active,
	onChange,
}: {
	active: NodeTypePill;
	onChange: (v: NodeTypePill) => void;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{NODE_TYPES.map((t) => (
				<button
					key={t}
					type="button"
					onClick={() => onChange(t)}
					className={`rounded-lg px-3 py-1 font-medium text-xs transition-colors ${
						active === t
							? "bg-bg-weak-50 text-text-strong-950 shadow-regular-xs"
							: "bg-transparent text-text-sub-600 hover:bg-bg-weak-50"
					}`}
				>
					{t}
				</button>
			))}
		</div>
	);
}
