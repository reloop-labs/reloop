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
		<Input.Root size="xsmall">
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
