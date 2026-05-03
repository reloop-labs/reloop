const ALIGN_OPTIONS = [
	{
		value: "left",
		label: "L",
		title: "Align left",
	},
	{
		value: "center",
		label: "C",
		title: "Align center",
	},
	{
		value: "right",
		label: "R",
		title: "Align right",
	},
	{
		value: "justify",
		label: "J",
		title: "Justify",
	},
] as const;

export type AlignValue = "left" | "center" | "right" | "justify";

export function AlignButtons({
	value,
	onChange,
	justify = false,
}: {
	value: AlignValue;
	onChange: (v: AlignValue) => void;
	/** Whether to show the justify option */
	justify?: boolean;
}) {
	const options = justify ? ALIGN_OPTIONS : ALIGN_OPTIONS.slice(0, 3);
	return (
		<span className="flex gap-0.5">
			{options.map(({ value: v, label, title }) => (
				<button
					key={v}
					type="button"
					title={title}
					onClick={() => onChange(v)}
					className={`h-6 w-6 rounded border text-xs transition-colors ${
						value === v
							? "border-(--re-text) bg-(--re-text) text-(--re-bg)"
							: "border-(--re-border) bg-transparent text-(--re-text)"
					}`}
				>
					{label}
				</button>
			))}
		</span>
	);
}
