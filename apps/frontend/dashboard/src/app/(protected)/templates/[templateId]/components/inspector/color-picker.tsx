function normalizeHex(value: string): string {
	if (!value) return "#000000";
	const v = value.trim();
	const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v);
	if (shortHex) {
		return `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`;
	}
	if (/^#[0-9a-f]{6}$/i.test(v)) return v;
	return "#000000";
}

export function ColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const normalized = normalizeHex(value);
	return (
		<span className="flex items-center gap-1">
			<input
				type="color"
				value={normalized}
				onChange={(e) => onChange(e.target.value)}
				className="h-5 w-5 cursor-pointer border-0 p-0"
			/>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-16 rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-xs"
			/>
		</span>
	);
}
