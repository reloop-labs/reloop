import * as Input from "@reloop/ui/input";

/* ------------------------------------------------------------------ */
/* Color picker — circular swatch trigger + hex input                  */
/* ------------------------------------------------------------------ */
export function ColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<Input.Root
			size="xsmall"
			className="rounded-xl border border-stroke-sub-300 shadow-none before:hidden"
		>
			<Input.Wrapper>
				<div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-lg border border-stroke-soft-200 transition-all duration-150 hover:scale-110">
					<input
						type="color"
						value={value || "#000000"}
						onChange={(e) => onChange(e.target.value)}
						className="-inset-1 absolute h-[200%] w-[200%] cursor-pointer border-none bg-transparent p-0"
					/>
				</div>
				<Input.Input
					value={value}
					placeholder="#000000"
					onChange={(e) => onChange(e.target.value)}
				/>
			</Input.Wrapper>
		</Input.Root>
	);
}
