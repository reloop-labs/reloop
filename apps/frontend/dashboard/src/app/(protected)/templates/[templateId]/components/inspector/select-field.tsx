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
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-full rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-xs text-(--re-text) cursor-pointer"
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{options.map((opt) => (
				<option key={opt.value} value={opt.value}>
					{opt.label}
				</option>
			))}
		</select>
	);
}
