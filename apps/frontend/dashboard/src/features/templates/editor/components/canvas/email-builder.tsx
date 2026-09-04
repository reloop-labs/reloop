import { BubbleMenu } from "@react-email/editor/ui";
import { Icon } from "@reloop/ui/icon";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { EditorContent, useCurrentEditor } from "@tiptap/react";
import { useEffect } from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { applyImportedEmailCss } from "#/features/templates/editor/utils/apply-imported-email-css";
import {
	EMAIL_BUBBLE_HIDE_NODES,
	emailTextBubbleTrigger,
} from "#/features/templates/editor/utils/email-slash-command-plugin";

import "@react-email/editor/themes/default.css";
import "./email-canvas.css";

const DRAG_NESTED_OPTIONS = {
	edgeDetection: { threshold: -16, edges: ["left" as const] },
};

const DRAG_POSITION_CONFIG = {
	placement: "left" as const,
	strategy: "fixed" as const,
};

function normalizeStoredIconRows(editor: any) {
	if (!editor) return;
	const json = editor.getJSON();
	let changed = false;

	function isEmptyParagraph(node: any) {
		if (node.type !== "paragraph") return false;
		if (!node.content || node.content.length === 0) return true;
		return node.content.every((c: any) => c.type === "paragraph" || (c.type === "text" && !c.text?.trim()));
	}

	function fixContentArray(content: any[]): any[] {
		if (!content || content.length === 0) return content;
		const out: any[] = [];
		let i = 0;
		while (i < content.length) {
			const cur: any = content[i];
			// Recurse first
			if (cur.content) {
				cur.content = fixContentArray(cur.content);
				// Also fix nested tableCell that holds 2-8 direct images
				if ((cur.type === "tableCell" || cur.type === "tableHeader") && cur.content) {
					const imgs = cur.content.filter((c: any) => c.type === "image");
					const hasEmptyPara = cur.content.some((c: any) => c.type === "paragraph" && (!c.content || c.content.length === 0));
					if (imgs.length >= 2 && imgs.length <= 8) {
						// Collect consecutive images (they are direct children after lift)
						const firstIdx = cur.content.findIndex((c: any) => c.type === "image");
						const lastIdx = cur.content.length - 1 - [...cur.content].reverse().findIndex((c: any) => c.type === "image");
						const slice = cur.content.slice(firstIdx, lastIdx + 1).filter((c: any) => c.type === "image");
						if (slice.length >= 2 && slice.length <= 8) {
							// Build a centered paragraph wrapping the images
							const wrapped: any = {
								type: "paragraph",
								attrs: {
									style: "text-align:center;line-height:1;margin:0;padding:0",
									"data-icon-row": "true",
								},
								content: slice.map((img: any) => ({
									...img,
									attrs: {
										...img.attrs,
										style: `${img.attrs?.style || ""};display:inline-block;vertical-align:middle`.replace(/^;/, ""),
									},
								})),
							};
							// Rebuild cell content: keep content before first image (except empty para), then wrapped, then after
							const before = cur.content.slice(0, firstIdx).filter((c: any) => !(c.type === "paragraph" && (!c.content || c.content.length === 0)));
							const after = cur.content.slice(lastIdx + 1);
							// Add gap between icons via margin-right on all but last
							if (wrapped.content.length > 1) {
								wrapped.content.forEach((img: any, idx: number) => {
									if (idx < wrapped.content.length - 1) {
										img.attrs.style = `${img.attrs.style};margin-right:1.5rem`;
									}
								});
							}
							cur.content = [...before, wrapped, ...after];
							changed = true;
						}
					}
				}
			}
			// Fix paragraph that contains only images but is left
			if (cur.type === "paragraph" && cur.content) {
				const imgs = cur.content.filter((c: any) => c.type === "image");
				const onlyImgs = cur.content.every((c: any) => c.type === "image" || (c.type === "text" && !c.text?.trim()));
				if (imgs.length >= 2 && imgs.length <= 8 && onlyImgs) {
					const style: string = cur.attrs?.style || "";
					if (!/text-align\s*:\s*center/i.test(style)) {
						let nextStyle = style;
						if (/text-align\s*:\s*(left|start)/i.test(nextStyle)) {
							nextStyle = nextStyle.replace(/text-align\s*:\s*(left|start)/i, "text-align:center");
						} else {
							nextStyle = nextStyle ? `${nextStyle};text-align:center` : "text-align:center";
						}
						cur.attrs = { ...cur.attrs, style: nextStyle, "data-icon-row": "true" };
						changed = true;
					}
				}
			}
			// Fix icon table kept as table (twitch: 2 cells right/left) — ensure
			// cell text-align and image inline-block so right/left are respected
			if (cur.type === "table" && cur.content) {
				const rows = cur.content.filter((c: any) => c.type === "tableRow");
				if (rows.length === 1) {
					const cells = rows[0].content?.filter((c: any) => c.type === "tableCell" || c.type === "tableHeader") || [];
					if (cells.length >= 2 && cells.length <= 8) {
						const isIconTable = cells.every((cell: any) => {
							const imgs = cell.content?.filter((c: any) => c.type === "image") || [];
							return imgs.length === 1;
						});
						if (isIconTable) {
							cells.forEach((cell: any) => {
								const align = cell.attrs?.align;
								let style: string = cell.attrs?.style || "";
								if (align === "right" && !/text-align/i.test(style)) {
									style = style ? `${style};text-align:right` : "text-align:right";
									cell.attrs.style = style;
									changed = true;
								} else if (align === "left" && !/text-align/i.test(style)) {
									style = style ? `${style};text-align:left` : "text-align:left";
									cell.attrs.style = style;
									changed = true;
								}
								const img = cell.content?.find((c: any) => c.type === "image");
								if (img) {
									let imgStyle: string = img.attrs?.style || "";
									if (/display\s*:\s*block/i.test(imgStyle)) {
										imgStyle = imgStyle.replace(/display\s*:\s*block/i, "display:inline-block");
										if (!/vertical-align/i.test(imgStyle)) imgStyle += ";vertical-align:middle";
										img.attrs.style = imgStyle;
										changed = true;
									} else if (!/display/i.test(imgStyle)) {
										imgStyle = imgStyle ? `${imgStyle};display:inline-block;vertical-align:middle` : "display:inline-block;vertical-align:middle";
										img.attrs.style = imgStyle;
										changed = true;
									}
								}
							});
							if (!cur.attrs?.["data-icon-row"]) {
								cur.attrs = { ...cur.attrs, "data-icon-row": "true" };
								changed = true;
							}
						}
					}
				}
			}
			out.push(cur);
			i++;
		}
		return out;
	}

	if (json.content) {
		json.content = fixContentArray(json.content);
	}
	if (changed) {
		editor.commands.setContent(json, { emitUpdate: false } as any);
	}
}

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();
	const importedEmailCss = useEditorStore((s) => s.importedEmailCss);

	useEffect(() => {
		applyImportedEmailCss(importedEmailCss);
	}, [importedEmailCss]);

	useEffect(() => {
		if (!editor) return;
		// Fix already-stored Yjs content that was flattened left before the global fix.
		normalizeStoredIconRows(editor);
		const handler = () => normalizeStoredIconRows(editor);
		editor.on("update", handler);
		return () => {
			editor.off("update", handler);
		};
	}, [editor]);

	if (!editor) return null;

	return (
		<div className="relative min-h-full w-full">
			<DragHandle
				editor={editor}
				nested={DRAG_NESTED_OPTIONS}
				computePositionConfig={DRAG_POSITION_CONFIG}
			>
				<div
					className="mr-1 cursor-pointer rounded-sm bg-bg-soft-200 py-0.5 text-text-sub-600"
					title="Drag to reorder"
				>
					<Icon name="more-vertical" className="h-3.5 w-3.5" />
				</div>
			</DragHandle>
			<EditorContent
				editor={editor}
				className="min-h-full w-full [&>.ProseMirror]:min-h-full [&>.ProseMirror]:w-full"
			/>
			<BubbleMenu
				hideWhenActiveNodes={[...EMAIL_BUBBLE_HIDE_NODES]}
				trigger={emailTextBubbleTrigger}
			/>
			<BubbleMenu.ButtonDefault />
			<BubbleMenu.ImageDefault />
		</div>
	);
}
