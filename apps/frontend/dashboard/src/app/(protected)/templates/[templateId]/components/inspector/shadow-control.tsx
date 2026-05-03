import { ColorPicker } from "./color-picker";
import { NumberField } from "./number-field";

export interface ShadowValue {
	x: number | "";
	y: number | "";
	blur: number | "";
	spread: number | "";
	color: string;
}

export function ShadowControl({
	value,
	onChange,
}: {
	value: ShadowValue;
	onChange: (v: ShadowValue) => void;
}) {
	return (
		<div className="flex flex-col gap-1.5 w-full">
			<div className="flex items-center gap-1">
				<span className="flex flex-col items-center gap-0.5">
					<NumberField value={value.x} onChange={(v) => onChange({ ...value, x: v })} />
					<span className="text-[10px] text-(--re-text-muted)">X</span>
				</span>
				<span className="flex flex-col items-center gap-0.5">
					<NumberField value={value.y} onChange={(v) => onChange({ ...value, y: v })} />
					<span className="text-[10px] text-(--re-text-muted)">Y</span>
				</span>
				<span className="flex flex-col items-center gap-0.5">
					<NumberField value={value.blur} onChange={(v) => onChange({ ...value, blur: v })} />
					<span className="text-[10px] text-(--re-text-muted)">Blur</span>
				</span>
				<span className="flex flex-col items-center gap-0.5">
					<NumberField value={value.spread} onChange={(v) => onChange({ ...value, spread: v })} />
					<span className="text-[10px] text-(--re-text-muted)">Spread</span>
				</span>
			</div>
			<ColorPicker value={value.color} onChange={(c) => onChange({ ...value, color: c })} />
		</div>
	);
}
