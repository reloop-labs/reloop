import * as SegmentedControl from "@reloop/ui/segmented-control";
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
	alignment: Alignment;
	setAlignment: (alignment: Alignment) => void;
}) {
	return (
		<SegmentedControl.Root
			value={alignment}
			onValueChange={(v) => setAlignment(v as Alignment)}
			className="rounded-xl border border-stroke-sub-300 bg-bg-white-0"
		>
			<SegmentedControl.List
				className="bg-transparent"
				floatingBgClassName="shadow-none! border border-stroke-soft-200 bg-bg-weak-50"
			>
				{ALIGN_OPTIONS.map(({ value: a, icon: Icon, label }) => (
					<SegmentedControl.Trigger
						key={a}
						value={a}
						title={label}
						aria-label={label}
						className="rounded-2xl"
					>
						<Icon className="h-4 w-4" strokeWidth={2} />
					</SegmentedControl.Trigger>
				))}
			</SegmentedControl.List>
		</SegmentedControl.Root>
	);
}
