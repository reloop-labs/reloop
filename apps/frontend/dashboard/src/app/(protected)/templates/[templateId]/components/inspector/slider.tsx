export function Slider({
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	unit,
}: {
	value: number;
	onChange: (v: number) => void;
	min?: number;
	max?: number;
	step?: number;
	unit?: string;
}) {
	return (
		<span className="flex items-center gap-1.5 w-full">
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="h-1 flex-1 cursor-pointer accent-(--re-text)"
			/>
			<span className="w-8 text-right text-xs tabular-nums text-(--re-text-muted)">
				{value}
				{unit}
			</span>
		</span>
	);
}
