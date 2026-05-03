import { NumberField } from "./number-field";

export function LetterSpacingField({
	value,
	onChange,
}: {
	value: number | "";
	onChange: (v: number | "") => void;
}) {
	return <NumberField value={value} onChange={onChange} unit="em" />;
}
