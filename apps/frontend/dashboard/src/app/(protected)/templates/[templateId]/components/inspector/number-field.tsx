export function NumberField({
	value,
	onChange,
	unit,
}: {
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	unit?: string;
}) {
	return (
		<span className="flex items-center gap-1">
			<input
				type="number"
				value={value ?? ""}
				onChange={(e) => {
					const raw = e.target.value;
					onChange(raw === "" ? "" : Number.parseFloat(raw));
				}}
				className="w-14 rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-xs"
			/>
			{unit && <span className="text-(--re-text-muted)">{unit}</span>}
		</span>
	);
}
