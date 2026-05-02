import * as ButtonGroup from "@reloop/ui/button-group";
import {
	Bold,
	Italic,
	Strikethrough,
	Type,
	Underline,
} from "lucide-react";

export function MarkControls({
	marks,
	toggleMark,
}: {
	marks: Record<string, boolean | undefined>;
	toggleMark: (mark: string) => void;
}) {
	return (
		<ButtonGroup.Root className="w-full">
			<ButtonGroup.Item
				title="Bold"
				aria-label="Bold"
				data-state={marks.bold ? "on" : "off"}
				onClick={() => toggleMark("bold")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Bold className="h-4 w-4" />
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title="Italic"
				aria-label="Italic"
				data-state={marks.italic ? "on" : "off"}
				onClick={() => toggleMark("italic")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Italic className="h-4 w-4" />
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title="Underline"
				aria-label="Underline"
				data-state={marks.underline ? "on" : "off"}
				onClick={() => toggleMark("underline")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Underline className="h-4 w-4" />
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title="Strikethrough"
				aria-label="Strikethrough"
				data-state={marks.strike ? "on" : "off"}
				onClick={() => toggleMark("strike")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Strikethrough className="h-4 w-4" />
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title="Capitalize"
				aria-label="Capitalize"
				data-state={marks.case ? "on" : "off"}
				onClick={() => toggleMark("case")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Type className="h-4 w-4" />
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	);
}

