import { Slider } from "./slider";

export function OpacitySlider({
	value,
	onChange,
}: {
	/** Opacity as a 0–100 integer */
	value: number;
	onChange: (v: number) => void;
}) {
	return (
		<Slider
			value={value}
			onChange={onChange}
			min={0}
			max={100}
			step={1}
			unit="%"
		/>
	);
}
