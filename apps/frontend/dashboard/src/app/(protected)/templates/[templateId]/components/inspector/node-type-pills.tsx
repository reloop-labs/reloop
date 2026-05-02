/* ------------------------------------------------------------------ */
/* Node type segmented control (Title / Subtitle / Heading / Body)     */
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
		<div className="flex gap-0.5 rounded-lg bg-bg-weak-50 p-0.5">
			{NODE_TYPES.map((t) => (
				<button
					key={t}
					type="button"
					onClick={() => onChange(t)}
					className={`flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-150 ${
						active === t
							? "bg-white text-text-strong-950 shadow-regular-xs"
							: "bg-transparent text-text-sub-600 hover:text-text-strong-950"
					}`}
				>
					{t}
				</button>
			))}
		</div>
	);
}
