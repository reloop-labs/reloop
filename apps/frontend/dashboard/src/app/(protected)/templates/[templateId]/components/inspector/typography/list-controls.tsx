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
		<div className="flex items-center gap-2">
			{/* Quote Toggle */}
			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleBlockquote().run()}
				className={`flex h-9 w-20 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
					isQuoteActive
						? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950"
						: "border-stroke-sub-300 bg-bg-white-0 text-text-sub-600 hover:bg-bg-strong-950/5 hover:text-text-strong-950"
				}`}
			>
				<Quote className="h-4 w-4" />
			</button>

			{/* List Type Button Group */}
			<ButtonGroup.Root className="flex-1">
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
