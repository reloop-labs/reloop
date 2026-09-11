import * as Switch from "@reloop/ui/switch";
import { useId } from "react";

export function ToggleSwitch({
	checked,
	onChange,
	label,
	ariaLabel,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label?: string;
	ariaLabel?: string;
}) {
	const id = useId();

	const content = (
		<Switch.Root
			id={id}
			checked={checked}
			onCheckedChange={onChange}
			aria-label={ariaLabel || label || "Toggle switch"}
		/>
	);

	if (label) {
		return (
			<label htmlFor={id} className="flex cursor-pointer items-center gap-1.5">
				{content}
				<span className="text-text-strong-950 text-xs">{label}</span>
			</label>
		);
	}

	return content;
}
