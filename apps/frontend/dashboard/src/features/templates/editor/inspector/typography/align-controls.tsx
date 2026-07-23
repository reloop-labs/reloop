import * as ButtonGroup from "@reloop/ui/button-group";
import { Icon } from "@reloop/ui/icon";

export type Alignment = "left" | "center" | "right";

const ALIGN_OPTIONS: { value: Alignment; icon: string; label: string }[] = [
	{ value: "left", icon: "align-left", label: "Align left" },
	{ value: "center", icon: "align-center", label: "Align center" },
	{ value: "right", icon: "align-right", label: "Align right" },
];

export function AlignControls({
	alignment,
	setAlignment,
}: {
	alignment: string;
	setAlignment: (alignment: string) => void;
}) {
	return (
		<ButtonGroup.Root className="w-full">
			{ALIGN_OPTIONS.map(({ value: a, icon, label }) => (
				<ButtonGroup.Item
					key={a}
					title={label}
					aria-label={label}
					data-state={alignment === a ? "on" : "off"}
					onClick={() => setAlignment(a as Alignment)}
					className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
				>
					<Icon name={icon} className="h-4 w-4" />
				</ButtonGroup.Item>
			))}
		</ButtonGroup.Root>
	);
}
