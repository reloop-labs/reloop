import * as ButtonGroup from "@reloop/ui/button-group";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	type LucideIcon,
} from "lucide-react";

export type Alignment = "left" | "center" | "right";

const ALIGN_OPTIONS: { value: Alignment; icon: LucideIcon; label: string }[] = [
	{ value: "left", icon: AlignLeft, label: "Align left" },
	{ value: "center", icon: AlignCenter, label: "Align center" },
	{ value: "right", icon: AlignRight, label: "Align right" },
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
			{ALIGN_OPTIONS.map(({ value: a, icon: Icon, label }) => (
				<ButtonGroup.Item
					key={a}
					title={label}
					aria-label={label}
					data-state={alignment === a ? "on" : "off"}
					onClick={() => setAlignment(a as Alignment)}
					className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
				>
					<Icon className="h-4 w-4" strokeWidth={2} />
				</ButtonGroup.Item>
			))}
		</ButtonGroup.Root>
	);
}
