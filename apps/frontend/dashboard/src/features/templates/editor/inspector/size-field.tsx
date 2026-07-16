import { NumberField } from "./number-field";
import { SelectField } from "./select-field";

const UNITS = [
	{ label: "px", value: "px" },
	{ label: "em", value: "em" },
	{ label: "%", value: "%" },
];

export function SizeField({
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
			<div className="w-14">
				<SelectField value={unit} onChange={onUnitChange} options={UNITS} />
			</div>
		</span>
	);
}
