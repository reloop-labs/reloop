import { composeReactEmail } from "@react-email/editor/core";
import { StarterKit } from "@react-email/editor/extensions";
import {
	EmailTheming,
	extendTheme,
	imageSlashCommand,
	useEditorImage,
} from "@react-email/editor/plugins";
import {
	BubbleMenu,
	defaultSlashCommands,
	SlashCommand,
} from "@react-email/editor/ui";
import "@react-email/editor/themes/default.css";
import Placeholder from "@tiptap/extension-placeholder";
import type { Editor, JSONContent } from "@tiptap/react";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { uploadComposeFile } from "./compose-attachments";
import { ComposeToolbar } from "./compose-toolbar";

export type ComposeBodyEditorHandle = {
	getEmail: () => Promise<{ html: string; text: string }>;
	getEmailHTML: () => Promise<string>;
	getEmailText: () => Promise<string>;
	getJSON: () => JSONContent;
	editor: Editor | null;
};

type ComposeBodyEditorProps = {
	editorKey?: string | number;
	content?: string;
	placeholder?: string;
	editable?: boolean;
	className?: string;
	onUpdate?: (html: string, text: string) => void;
	onModEnter?: () => void;
	/** Show the inbox format toolbar above the editor (default true). */
	showToolbar?: boolean;
};

/** Full-width compose theme — no 600px email-canvas gutters. */
const composeTheme = extendTheme("basic", {
	container: {
		width: "100%",
		maxWidth: "100%",
		marginLeft: 0,
		marginRight: 0,
		paddingLeft: 0,
		paddingRight: 0,
	},
	body: {
		paddingLeft: 0,
		paddingRight: 0,
		paddingTop: 0,
		paddingBottom: 0,
		minHeight: "180px",
	},
});

function buildHandle(editor: Editor | null): ComposeBodyEditorHandle {
	return {
		getEmail: async () => {
			if (!editor) return { html: "", text: "" };
			return composeReactEmail({ editor });
		},
		getEmailHTML: async () => {
			if (!editor) return "";
			return (await composeReactEmail({ editor })).html;
		},
		getEmailText: async () => {
			if (!editor) return "";
			return (await composeReactEmail({ editor })).text;
		},
		getJSON: () => editor?.getJSON() ?? { type: "doc", content: [] },
		editor,
	};
}

function ComposeEditorBridge({
	editorRef,
	onUpdate,
	onModEnter,
}: {
	editorRef: React.MutableRefObject<ComposeBodyEditorHandle | null>;
	onUpdate?: (html: string, text: string) => void;
	onModEnter?: () => void;
}) {
	const { editor } = useCurrentEditor();
	const onModEnterRef = useRef(onModEnter);
	onModEnterRef.current = onModEnter;
	const onUpdateRef = useRef(onUpdate);
	onUpdateRef.current = onUpdate;

	useEffect(() => {
		editorRef.current = buildHandle(editor);
		if (!editor) return;

		const onEditorUpdate = () => {
			onUpdateRef.current?.(editor.getHTML(), editor.getText());
		};
		onEditorUpdate();
		editor.on("update", onEditorUpdate);

		const dom = editor.view.dom;
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
				event.preventDefault();
				onModEnterRef.current?.();
			}
		};
		dom.addEventListener("keydown", onKeyDown);

		return () => {
			editor.off("update", onEditorUpdate);
			dom.removeEventListener("keydown", onKeyDown);
			if (editorRef.current?.editor === editor) {
				editorRef.current = buildHandle(null);
			}
		};
	}, [editor, editorRef]);

	return null;
}

/**
 * React Email editor for compose — keeps the inbox toolbar look,
 * with slash commands + email-ready export under the hood.
 */
export const ComposeBodyEditor = forwardRef<
	ComposeBodyEditorHandle,
	ComposeBodyEditorProps
>(function ComposeBodyEditor(
	{
		editorKey = "compose",
		content = "",
		placeholder = "Start writing… Press '/' for commands",
		editable = true,
		className,
		onUpdate,
		onModEnter,
		showToolbar = true,
	},
	ref,
) {
	const handleRef = useRef<ComposeBodyEditorHandle | null>(null);
	useImperativeHandle(
		ref,
		() => ({
			getEmail: async () =>
				(await handleRef.current?.getEmail()) ?? { html: "", text: "" },
			getEmailHTML: async () => (await handleRef.current?.getEmailHTML()) ?? "",
			getEmailText: async () => (await handleRef.current?.getEmailText()) ?? "",
			getJSON: () =>
				handleRef.current?.getJSON() ?? { type: "doc", content: [] },
			get editor() {
				return handleRef.current?.editor ?? null;
			},
		}),
		[],
	);

	const imageExtension = useEditorImage({
		uploadImage: async (file) => {
			const { url } = await uploadComposeFile(file);
			return { url };
		},
	});

	const extensions = useMemo(
		() => [
			StarterKit.configure(),
			Placeholder.configure({
				placeholder,
				includeChildren: true,
			}),
			EmailTheming.configure({ theme: composeTheme }),
			imageExtension,
		],
		[placeholder, imageExtension],
	);

	const slashItems = useMemo(
		() => [...defaultSlashCommands, imageSlashCommand],
		[],
	);

	return (
		<div
			key={editorKey}
			className="compose-email-editor flex min-h-0 flex-1 flex-col"
		>
			<style>{COMPOSE_EDITOR_CSS}</style>
			<EditorProvider
				extensions={extensions}
				content={content || "<p></p>"}
				editable={editable}
				immediatelyRender={false}
				slotBefore={
					showToolbar ? (
						<div className="shrink-0 border-mail-border/40 border-b px-3 py-2">
							<ComposeToolbar />
						</div>
					) : null
				}
				editorContainerProps={{
					className:
						className ??
						"compose-email-editor__content min-h-[180px] flex-1 px-5 py-4",
				}}
			>
				{/* Keep selection bubble for quick inline edits */}
				<BubbleMenu
					hideWhenActiveNodes={["button", "horizontalRule"]}
					hideWhenActiveMarks={["link"]}
				/>
				<BubbleMenu.LinkDefault />
				<BubbleMenu.ButtonDefault />
				<BubbleMenu.ImageDefault />
				<SlashCommand items={slashItems} />
				<ComposeEditorBridge
					editorRef={handleRef}
					onUpdate={onUpdate}
					onModEnter={onModEnter}
				/>
			</EditorProvider>
		</div>
	);
});

const COMPOSE_EDITOR_CSS = `
/* Slash / bubble menus are portaled to body — sit above Radix modal (z-50). */
body > div:has([data-re-slash-command]),
body > div:has([data-re-bubble-menu]),
body > div:has([data-re-node-selector-content]),
body > div:has([data-re-link-selector-form]),
[data-tippy-root]:has([data-re-bubble-menu]) {
  z-index: 200 !important;
}

[data-re-slash-command] {
  z-index: 200;
  border: 1px solid var(--re-border, #e5e5e5);
  border-radius: 0.5rem;
  background: var(--re-bg, #fff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.dark [data-re-slash-command] {
  background: #202020;
  border-color: #2b2b2b;
}

.compose-email-editor .tiptap.ProseMirror,
.compose-email-editor .ProseMirror {
  outline: none;
  min-height: 180px;
  font-size: 14px;
  line-height: 1.55;
  color: inherit;
}

.compose-email-editor .node-container {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
`;
