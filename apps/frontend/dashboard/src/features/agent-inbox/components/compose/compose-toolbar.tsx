import { cn } from "@reloop/ui/cn";
import type { Editor } from "@tiptap/react";
import {
	Bold,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	List,
	ListOrdered,
	Quote,
	Redo2,
	Strikethrough,
	Underline,
	Undo2,
} from "lucide-react";

const btn =
	"inline-flex h-7 w-7 items-center justify-center rounded p-1.5 text-mail-muted transition-colors hover:bg-[var(--inbox-hover)] disabled:opacity-40";

export const ComposeToolbar = ({ editor }: { editor: Editor | null }) => {
	if (!editor) return null;

	return (
		<div className="flex flex-wrap gap-1 rounded-md border border-[#E7E7E7] p-1.5 dark:border-[#2B2B2B]">
			<button
				type="button"
				tabIndex={-1}
				className={btn}
				disabled={!editor.can().undo()}
				onClick={() => editor.chain().focus().undo().run()}
				aria-label="Undo"
			>
				<Undo2 className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={btn}
				disabled={!editor.can().redo()}
				onClick={() => editor.chain().focus().redo().run()}
				aria-label="Redo"
			>
				<Redo2 className="h-4 w-4" />
			</button>
			<span className="mx-1 w-px self-stretch bg-mail-border" />
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("heading", { level: 1 }) &&
						"bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				aria-label="Heading 1"
			>
				<Heading1 className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("heading", { level: 2 }) &&
						"bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				aria-label="Heading 2"
			>
				<Heading2 className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("heading", { level: 3 }) &&
						"bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				aria-label="Heading 3"
			>
				<Heading3 className="h-4 w-4" />
			</button>
			<span className="mx-1 w-px self-stretch bg-mail-border" />
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("bold") && "bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleBold().run()}
				aria-label="Bold"
			>
				<Bold className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("italic") && "bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleItalic().run()}
				aria-label="Italic"
			>
				<Italic className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("strike") && "bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleStrike().run()}
				aria-label="Strikethrough"
			>
				<Strikethrough className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("underline") && "bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				aria-label="Underline"
			>
				<Underline className="h-4 w-4" />
			</button>
			<span className="mx-1 w-px self-stretch bg-mail-border" />
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("bulletList") && "bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				aria-label="Bullet list"
			>
				<List className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("orderedList") && "bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				aria-label="Ordered list"
			>
				<ListOrdered className="h-4 w-4" />
			</button>
			<button
				type="button"
				tabIndex={-1}
				className={cn(
					btn,
					editor.isActive("blockquote") && "bg-[var(--inbox-muted-bg)]",
				)}
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				aria-label="Quote"
			>
				<Quote className="h-4 w-4" />
			</button>
		</div>
	);
};
