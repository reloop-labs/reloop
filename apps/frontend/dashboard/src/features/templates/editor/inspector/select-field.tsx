import * as Select from "@reloop/ui/select";

export interface SelectOption {
	label: string;
	value: string;
}

export function SelectField({
	value,
	onChange,
	options,
	placeholder,
}: {
	value: string;
	onChange: (v: string) => void;
	options: SelectOption[];
	placeholder?: string;
}) {
	return (
		<Select.Root size="xsmall" value={value} onValueChange={onChange}>
			<Select.Trigger className="w-full">
				<Select.Value placeholder={placeholder} />
			</Select.Trigger>
			<Select.Content>
				{options.map((opt) => (
					<Select.Item key={opt.value} value={opt.value}>
						{opt.label}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	);
}
