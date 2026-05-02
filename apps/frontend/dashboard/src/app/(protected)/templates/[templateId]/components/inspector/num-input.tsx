import * as InputPrimitive from "@reloop/ui/input";

/* ------------------------------------------------------------------ */
/* Inline number input styled like the reference UI                     */
/* ------------------------------------------------------------------ */
export function NumInput({
	value,
	onChange,
	placeholder,
	unit,
}: {
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	placeholder?: string;
	unit?: string;
}) {
	return (
		<InputPrimitive.Root
			size="xsmall"
			className="flex-1 rounded-xl border border-stroke-sub-300 shadow-none before:hidden"
		>
			<InputPrimitive.Wrapper>
				<InputPrimitive.Input
					placeholder={placeholder ?? "0"}
					value={value ?? ""}
					onChange={(e) => {
						const raw = e.target.value;
						onChange(raw === "" ? "" : Number.parseFloat(raw));
					}}
				/>
				{unit && (
					<InputPrimitive.InlineAffix>{unit}</InputPrimitive.InlineAffix>
				)}
			</InputPrimitive.Wrapper>
		</InputPrimitive.Root>
	);
}
