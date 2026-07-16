import * as ButtonGroup from "@reloop/ui/button-group";
import { useCurrentEditor } from "@tiptap/react";
import { Code, List, ListOrdered, Quote } from "lucide-react";

export function ListControls() {
	const { editor } = useCurrentEditor();

	const listType = editor?.isActive("bulletList")
		? "bullet"
		: editor?.isActive("orderedList")
			? "ordered"
			: "none";
	const isQuoteActive = editor?.isActive("blockquote") ?? false;
	const isCodeActive = editor?.isActive("code") ?? false;

	return (
		<div className="flex items-center">
			<ButtonGroup.Root className="w-full">
				<ButtonGroup.Item
					data-state={isQuoteActive ? "on" : "off"}
					onClick={() =>
						(editor?.chain().focus() as any).toggleBlockquote().run()
					}
					className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
					title="Quote"
				>
					<Quote className="h-4 w-4" />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					data-state={isCodeActive ? "on" : "off"}
					onClick={() => (editor?.chain().focus() as any).toggleCode().run()}
					className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
					title="Code"
				>
					<Code className="h-4 w-4" />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					data-state={listType === "bullet" ? "on" : "off"}
					onClick={() =>
						(editor?.chain().focus() as any).toggleBulletList().run()
					}
					className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
					title="Bullet List"
				>
					<List className="h-4 w-4" />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					data-state={listType === "ordered" ? "on" : "off"}
					onClick={() =>
						(editor?.chain().focus() as any).toggleOrderedList().run()
					}
					className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
					title="Ordered List"
				>
					<ListOrdered className="h-4 w-4" />
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		</div>
	);
}
