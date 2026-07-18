import { cn } from "@reloop/ui/cn";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
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
import type { ReactNode } from "react";

const btn =
	"inline-flex h-7 w-7 items-center justify-center rounded p-1.5 text-mail-muted transition-colors hover:bg-[var(--inbox-hover)] disabled:opacity-40";

function ToolbarButton({
	label,
	active,
	disabled,
	onAction,
	children,
}: {
	label: string;
	active?: boolean;
	disabled?: boolean;
	onAction: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			tabIndex={-1}
			aria-label={label}
			aria-pressed={active}
			disabled={disabled}
			className={cn(btn, active && "bg-[var(--inbox-muted-bg)]")}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onAction}
		>
			{children}
		</button>
	);
}

function Divider() {
	return <span className="mx-1 w-px self-stretch bg-mail-border" />;
}

/** Inbox-styled format toolbar wired to the React Email / TipTap editor. */
export const ComposeToolbar = () => {
	const { editor } = useCurrentEditor();
	const state = useEditorState({
		editor,
		selector: ({ editor: ed }) => {
			if (!ed) return null;
			return {
				canUndo: ed.can().undo(),
				canRedo: ed.can().redo(),
				isH1: ed.isActive("heading", { level: 1 }),
				isH2: ed.isActive("heading", { level: 2 }),
				isH3: ed.isActive("heading", { level: 3 }),
				isBold: ed.isActive("bold"),
				isItalic: ed.isActive("italic"),
				isStrike: ed.isActive("strike"),
				isUnderline: ed.isActive("underline"),
				isBullet: ed.isActive("bulletList"),
				isOrdered: ed.isActive("orderedList"),
				isQuote: ed.isActive("blockquote"),
			};
		},
	});

	if (!editor || !state) return null;

	return (
		<div className="flex flex-wrap gap-1 p-1.5">
			<ToolbarButton
				label="Undo"
				disabled={!state.canUndo}
				onAction={() => editor.chain().focus().undo().run()}
			>
				<Undo2 className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Redo"
				disabled={!state.canRedo}
				onAction={() => editor.chain().focus().redo().run()}
			>
				<Redo2 className="h-4 w-4" />
			</ToolbarButton>

			<Divider />

			<ToolbarButton
				label="Heading 1"
				active={state.isH1}
				onAction={() =>
					editor.chain().focus().toggleHeading({ level: 1 }).run()
				}
			>
				<Heading1 className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Heading 2"
				active={state.isH2}
				onAction={() =>
					editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
			>
				<Heading2 className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Heading 3"
				active={state.isH3}
				onAction={() =>
					editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
			>
				<Heading3 className="h-4 w-4" />
			</ToolbarButton>

			<Divider />

			<ToolbarButton
				label="Bold"
				active={state.isBold}
				onAction={() => editor.chain().focus().toggleBold().run()}
			>
				<Bold className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Italic"
				active={state.isItalic}
				onAction={() => editor.chain().focus().toggleItalic().run()}
			>
				<Italic className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Strikethrough"
				active={state.isStrike}
				onAction={() => editor.chain().focus().toggleStrike().run()}
			>
				<Strikethrough className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Underline"
				active={state.isUnderline}
				onAction={() => editor.chain().focus().toggleUnderline().run()}
			>
				<Underline className="h-4 w-4" />
			</ToolbarButton>

			<Divider />

			<ToolbarButton
				label="Bullet list"
				active={state.isBullet}
				onAction={() => editor.chain().focus().toggleBulletList().run()}
			>
				<List className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Ordered list"
				active={state.isOrdered}
				onAction={() => editor.chain().focus().toggleOrderedList().run()}
			>
				<ListOrdered className="h-4 w-4" />
			</ToolbarButton>
			<ToolbarButton
				label="Quote"
				active={state.isQuote}
				onAction={() => editor.chain().focus().toggleBlockquote().run()}
			>
				<Quote className="h-4 w-4" />
			</ToolbarButton>
		</div>
	);
};
