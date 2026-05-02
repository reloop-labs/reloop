import * as SliderUI from "@reloop/ui/slider";

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
		<span className="flex items-center gap-2.5 w-full">
			<SliderUI.Root
				value={[value]}
				onValueChange={([v]) => {
					if (v !== undefined) {
						onChange(v);
					}
				}}
				min={min}
				max={max}
				step={step}
				className="flex-1"
			>
				<SliderUI.Thumb />
			</SliderUI.Root>
			<span className="w-8 text-right text-xs tabular-nums text-(--re-text-muted)">
				{value}
				{unit}
			</span>
		</span>
	);
}
