import { ColorPicker } from "./color-picker";
import { PropRow } from "./prop-row";

/* ------------------------------------------------------------------ */
/* Color row: swatch + hex text field in one Input                     */
/* ------------------------------------------------------------------ */
export function ColorRow({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<PropRow label={label}>
			<ColorPicker value={value} onChange={onChange} />
		</PropRow>
	);
}
