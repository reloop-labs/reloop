import * as ButtonGroup from "@reloop/ui/button-group";
import {
	Bold,
	CaseLower,
	CaseUpper,
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
				title={
					marks.uppercase ? "Uppercase" : marks.lowercase ? "Lowercase" : "Case"
				}
				aria-label="Toggle Case"
				data-state={marks.uppercase || marks.lowercase ? "on" : "off"}
				onClick={() => {
					if (marks.uppercase) {
						toggleMark("uppercase");
						toggleMark("lowercase");
					} else if (marks.lowercase) {
						toggleMark("lowercase");
					} else {
						toggleMark("uppercase");
					}
				}}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<CaseUpper className="h-4 w-4" />
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	);
}
