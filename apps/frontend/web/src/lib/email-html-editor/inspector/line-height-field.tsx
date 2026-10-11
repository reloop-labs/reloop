import { NumberField } from "./number-field";
import { SelectField } from "./select-field";

const LINE_HEIGHT_UNITS = [
	{ label: "–", value: "" }, // unitless multiplier
	{ label: "px", value: "px" },
	{ label: "%", value: "%" },
];

export function LineHeightField({
	value,
	unit,
	onChange,
	onUnitChange,
}: {
	value: number | "";
	unit: string;
	onChange: (v: number | "") => void;
	onUnitChange: (u: string) => void;
}) {
	return (
		<span className="flex items-center gap-1">
			<NumberField value={value} onChange={onChange} />
			<div className="w-12">
				<SelectField
					value={unit}
					onChange={onUnitChange}
					options={LINE_HEIGHT_UNITS}
				/>
			</div>
		</span>
	);
}
