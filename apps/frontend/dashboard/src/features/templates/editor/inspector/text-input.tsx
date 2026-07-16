import * as Input from "@reloop/ui/input";

export function TextInput({
	value,
	onChange,
	placeholder,
	disabled,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	disabled?: boolean;
}) {
	return (
		<Input.Root
			size="xsmall"
			className="border border-stroke-sub-300 shadow-none before:hidden"
		>
			<Input.Wrapper>
				<Input.Input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
				/>
			</Input.Wrapper>
		</Input.Root>
	);
}
