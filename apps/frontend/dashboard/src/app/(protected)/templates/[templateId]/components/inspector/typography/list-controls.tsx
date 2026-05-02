import * as ButtonGroup from "@reloop/ui/button-group";
import { useCurrentEditor } from "@tiptap/react";
import { List, ListOrdered, Quote } from "lucide-react";

export function ListControls() {
	const { editor } = useCurrentEditor();

	const listType = editor?.isActive("bulletList")
		? "bullet"
		: editor?.isActive("orderedList")
			? "ordered"
			: "none";
	const isQuoteActive = editor?.isActive("blockquote") ?? false;
	return (
		<div className="flex items-center">
			<ButtonGroup.Root className="w-full">
				<ButtonGroup.Item
					data-state={isQuoteActive ? "on" : "off"}
					onClick={() => editor?.chain().focus().toggleBlockquote().run()}
					className="flex-1 first:rounded-l-xl last:rounded-r-xl"
				>
					<Quote className="h-4 w-4" />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					data-state={listType === "bullet" ? "on" : "off"}
					onClick={() => editor?.chain().focus().toggleBulletList().run()}
					className="flex-1 first:rounded-l-xl last:rounded-r-xl"
				>
					<List className="h-4 w-4" />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					data-state={listType === "ordered" ? "on" : "off"}
					onClick={() => editor?.chain().focus().toggleOrderedList().run()}
					className="flex-1 first:rounded-l-xl last:rounded-r-xl"
				>
					<ListOrdered className="h-4 w-4" />
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		</div>
	);
}
