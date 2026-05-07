import { ColorPicker } from "./color-picker";
import { SelectField } from "./select-field";

export interface BorderValue {
	width: number | "";
	style: string;
	color: string;
}

const BORDER_STYLES = [
	{ label: "None", value: "none" },
	{ label: "Solid", value: "solid" },
	{ label: "Dashed", value: "dashed" },
	{ label: "Dotted", value: "dotted" },
	{ label: "Double", value: "double" },
];

export function BorderControl({
	value,
	onChange,
}: {
	value: BorderValue;
	onChange: (v: BorderValue) => void;
}) {
	return (
		<div className="flex w-full flex-col gap-1.5">
			<div className="flex items-center gap-1">
				{/* Width */}
				<span className="flex items-center gap-0.5">
					<input
						type="number"
						min={0}
						value={value.width}
						onChange={(e) => {
							const raw = e.target.value;
							onChange({
								...value,
								width: raw === "" ? "" : Number.parseFloat(raw),
							});
						}}
						className="w-12 rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-xs"
					/>
					<span className="text-(--re-text-muted) text-[10px]">px</span>
				</span>
				{/* Style */}
				<div className="flex-1">
					<SelectField
						value={value.style}
						onChange={(s) => onChange({ ...value, style: s })}
						options={BORDER_STYLES}
					/>
				</div>
			</div>
			{/* Color */}
			{value.style !== "none" && (
				<ColorPicker
					value={value.color}
					onChange={(c) => onChange({ ...value, color: c })}
				/>
			)}
		</div>
	);
}
