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
		<div className="flex w-full flex-col gap-1.5">
			<div className="flex items-center gap-1">
				<span className="flex flex-col items-center gap-0.5">
					<NumberField
						value={value.x}
						onChange={(v) => onChange({ ...value, x: v })}
					/>
					<span className="text-(--re-text-muted) text-[10px]">X</span>
				</span>
				<span className="flex flex-col items-center gap-0.5">
					<NumberField
						value={value.y}
						onChange={(v) => onChange({ ...value, y: v })}
					/>
					<span className="text-(--re-text-muted) text-[10px]">Y</span>
				</span>
				<span className="flex flex-col items-center gap-0.5">
					<NumberField
						value={value.blur}
						onChange={(v) => onChange({ ...value, blur: v })}
					/>
					<span className="text-(--re-text-muted) text-[10px]">Blur</span>
				</span>
				<span className="flex flex-col items-center gap-0.5">
					<NumberField
						value={value.spread}
						onChange={(v) => onChange({ ...value, spread: v })}
					/>
					<span className="text-(--re-text-muted) text-[10px]">Spread</span>
				</span>
			</div>
			<ColorPicker
				value={value.color}
				onChange={(c) => onChange({ ...value, color: c })}
			/>
		</div>
	);
}
