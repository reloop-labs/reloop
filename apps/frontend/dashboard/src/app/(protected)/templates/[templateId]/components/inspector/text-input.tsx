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
		<input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			disabled={disabled}
			className="w-full rounded border border-(--re-border) bg-transparent px-1.5 py-1 text-xs placeholder:text-(--re-text-muted) disabled:opacity-50"
		/>
	);
}
