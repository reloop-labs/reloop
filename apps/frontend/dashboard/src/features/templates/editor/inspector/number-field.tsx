import * as Input from "@reloop/ui/input";

export function NumberField({
	value,
	onChange,
	unit,
}: {
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	unit?: string;
}) {
	return (
		<span className="flex items-center gap-1">
			<Input.Root
				size="xsmall"
				className="border border-stroke-sub-300 shadow-none before:hidden"
			>
				<Input.Wrapper>
					<Input.Input
						value={value ?? ""}
						onChange={(e) => {
							const raw = e.target.value;
							onChange(raw === "" ? "" : Number.parseFloat(raw));
						}}
					/>
				</Input.Wrapper>
			</Input.Root>
			{unit && <span className="text-text-strong-950">{unit}</span>}
		</span>
	);
}
