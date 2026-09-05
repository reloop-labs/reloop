import { inspectorFieldClassName } from "./scrub-field";

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
		<div className={inspectorFieldClassName}>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className="min-w-0 flex-1 bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 disabled:text-text-disabled-300"
			/>
		</div>
	);
}
