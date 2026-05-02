import * as Switch from "@reloop/ui/switch";

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
			<Switch.Root checked={checked} onCheckedChange={onChange} />
			{label && <span className="text-(--re-text-muted) text-xs">{label}</span>}
		</label>
	);
}
