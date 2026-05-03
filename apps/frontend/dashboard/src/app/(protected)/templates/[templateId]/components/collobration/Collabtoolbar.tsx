"use client";

import type { Editor } from "@tiptap/react";

interface CollabToolbarProps {
	editor: Editor;
}

export function CollabToolbar({ editor }: CollabToolbarProps) {
	const btn = (
		active: boolean,
		onClick: () => void,
		label: string,
		title?: string,
	) => (
		<button
			onMouseDown={(e) => {
				e.preventDefault(); // don't blur editor
				onClick();
			}}
			className={`rounded px-2 py-1 font-medium text-sm transition-colors ${
				active
					? "bg-gray-900 text-white"
					: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
			}`}
			title={title || label}
			aria-label={title || label}
			type="button"
		>
			{label}
		</button>
	);

	const divider = () => (
		<div className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
	);

	return (
		<div className="flex flex-wrap items-center gap-0.5 border-gray-100 border-b bg-gray-50 px-4 py-1.5">
			{/* Text style */}
			{btn(
				editor.isActive("bold"),
				() => editor.chain().focus().toggleBold().run(),
				"B",
				"Bold",
			)}
			{btn(
				editor.isActive("italic"),
				() => editor.chain().focus().toggleItalic().run(),
				"I",
				"Italic",
			)}
			{btn(
				editor.isActive("underline"),
				() => editor.chain().focus().toggleUnderline().run(),
				"U",
				"Underline",
			)}
			{btn(
				editor.isActive("strike"),
				() => editor.chain().focus().toggleStrike().run(),
				"S̶",
				"Strikethrough",
			)}

			{divider()}

			{/* Headings */}
			{btn(
				editor.isActive("heading", { level: 1 }),
				() => editor.chain().focus().toggleHeading({ level: 1 }).run(),
				"H1",
			)}
			{btn(
				editor.isActive("heading", { level: 2 }),
				() => editor.chain().focus().toggleHeading({ level: 2 }).run(),
				"H2",
			)}
			{btn(
				editor.isActive("heading", { level: 3 }),
				() => editor.chain().focus().toggleHeading({ level: 3 }).run(),
				"H3",
			)}

			{divider()}

			{/* Alignment */}
			{btn(
				editor.isActive({ textAlign: "left" }),
				() => editor.chain().focus().setTextAlign("left").run(),
				"≡",
				"Align left",
			)}
			{btn(
				editor.isActive({ textAlign: "center" }),
				() => editor.chain().focus().setTextAlign("center").run(),
				"≡",
				"Align center",
			)}
			{btn(
				editor.isActive({ textAlign: "right" }),
				() => editor.chain().focus().setTextAlign("right").run(),
				"≡",
				"Align right",
			)}

			{divider()}

			{/* Lists */}
			{btn(
				editor.isActive("bulletList"),
				() => editor.chain().focus().toggleBulletList().run(),
				"• List",
				"Bullet list",
			)}
			{btn(
				editor.isActive("orderedList"),
				() => editor.chain().focus().toggleOrderedList().run(),
				"1. List",
				"Ordered list",
			)}

			{divider()}

			{/* Block */}
			{btn(
				editor.isActive("blockquote"),
				() => editor.chain().focus().toggleBlockquote().run(),
				"❝",
				"Blockquote",
			)}
			{btn(
				editor.isActive("code"),
				() => editor.chain().focus().toggleCode().run(),
				"</>",
				"Inline code",
			)}
			{btn(
				editor.isActive("codeBlock"),
				() => editor.chain().focus().toggleCodeBlock().run(),
				"[ ]",
				"Code block",
			)}

			{divider()}

			{/* Link */}
			{btn(
				editor.isActive("link"),
				() => {
					const url = window.prompt(
						"Enter URL",
						editor.getAttributes("link").href,
					);
					if (url === null) return;
					if (url === "") {
						editor.chain().focus().unsetLink().run();
					} else {
						editor.chain().focus().setLink({ href: url }).run();
					}
				},
				"🔗",
				"Insert link",
			)}

			{divider()}

			{/* Undo / Redo — Yjs collaborative undo */}
			<button
				onMouseDown={(e) => {
					e.preventDefault();
					editor.chain().focus().undo().run();
				}}
				disabled={!editor.can().undo()}
				className="rounded px-2 py-1 text-gray-600 text-sm transition-colors hover:bg-gray-100 disabled:opacity-30"
				title="Undo (Ctrl+Z)"
				type="button"
			>
				↩
			</button>
			<button
				onMouseDown={(e) => {
					e.preventDefault();
					editor.chain().focus().redo().run();
				}}
				disabled={!editor.can().redo()}
				className="rounded px-2 py-1 text-gray-600 text-sm transition-colors hover:bg-gray-100 disabled:opacity-30"
				title="Redo (Ctrl+Y)"
				type="button"
			>
				↪
			</button>
		</div>
	);
}
