import * as ButtonGroup from "@reloop/ui/button-group";
import {
	Bold,
	Italic,
	type LucideIcon,
	Strikethrough,
	Underline,
} from "lucide-react";

export type Mark = "bold" | "italic" | "underline" | "strike" | "case";

const MARK_OPTIONS: { mark: Mark; icon: LucideIcon; label: string }[] = [
	{ mark: "bold", icon: Bold, label: "Bold" },
	{ mark: "italic", icon: Italic, label: "Italic" },
	{ mark: "underline", icon: Underline, label: "Underline" },
	{ mark: "strike", icon: Strikethrough, label: "Strikethrough" },
];

export function MarkControls({
	marks,
	toggleMark,
}: {
	marks: Record<string, boolean | undefined>;
	toggleMark: (mark: string) => void;
}) {
	return (
		<ButtonGroup.Root className="w-full">
			{MARK_OPTIONS.map(({ mark, icon: Icon, label }) => (
				<ButtonGroup.Item
					key={mark}
					title={label}
					aria-label={label}
					data-state={marks[mark] ? "on" : "off"}
					onClick={() => toggleMark(mark)}
					className="flex-1 first:rounded-l-xl last:rounded-r-xl"
				>
					<Icon className="h-4 w-4" />
				</ButtonGroup.Item>
			))}
		</ButtonGroup.Root>
	);
}
