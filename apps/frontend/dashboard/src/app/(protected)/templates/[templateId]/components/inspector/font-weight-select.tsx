import { SelectField } from "./select-field";

const FONT_WEIGHTS = [
	{ label: "Thin (100)", value: "100" },
	{ label: "Extra Light (200)", value: "200" },
	{ label: "Light (300)", value: "300" },
	{ label: "Regular (400)", value: "400" },
	{ label: "Medium (500)", value: "500" },
	{ label: "Semi Bold (600)", value: "600" },
	{ label: "Bold (700)", value: "700" },
	{ label: "Extra Bold (800)", value: "800" },
	{ label: "Black (900)", value: "900" },
];

export function FontWeightSelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<SelectField
			value={value}
			onChange={onChange}
			options={FONT_WEIGHTS}
			placeholder="Default"
		/>
	);
}
