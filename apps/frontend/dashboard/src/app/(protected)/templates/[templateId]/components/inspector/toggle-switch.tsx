export function ToggleSwitch({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label?: string;
}) {
	return (
		<label className="flex cursor-pointer items-center gap-1.5">
			<span
				onClick={() => onChange(!checked)}
				role="switch"
				aria-checked={checked}
				className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
					checked ? "bg-(--re-text)" : "bg-(--re-border)"
				}`}
			>
				<span
					className={`absolute h-3 w-3 rounded-full bg-white shadow transition-transform ${
						checked ? "translate-x-3.5" : "translate-x-0.5"
					}`}
				/>
			</span>
			{label && (
				<span className="text-xs text-(--re-text-muted)">{label}</span>
			)}
		</label>
	);
}
