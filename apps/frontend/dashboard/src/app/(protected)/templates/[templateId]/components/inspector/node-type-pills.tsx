/* ------------------------------------------------------------------ */
/* Node type segmented control (Title / Subtitle / Heading / Body)     */
/* ------------------------------------------------------------------ */
export const NODE_TYPES = ["Title", "Subtitle", "Heading", "Body"] as const;
export type NodeTypePill = (typeof NODE_TYPES)[number];

import { useCurrentEditor } from "@tiptap/react";

export function NodeTypePills() {
	const { editor } = useCurrentEditor();

	if (!editor) return null;

	const active = editor.isActive("heading", { level: 1 })
		? "Title"
		: editor.isActive("heading", { level: 2 })
			? "Subtitle"
			: editor.isActive("heading", { level: 3 })
				? "Heading"
				: "Body";

	const setNodeType = (type: NodeTypePill) => {
		const chain = editor.chain().focus();
		if (type === "Title") {
			chain.setHeading({ level: 1 }).run();
		} else if (type === "Subtitle") {
			chain.setHeading({ level: 2 }).run();
		} else if (type === "Heading") {
			chain.setHeading({ level: 3 }).run();
		} else {
			chain.setParagraph().run();
		}
	};

	return (
		<div className="flex flex-wrap gap-2">
			{NODE_TYPES.map((t) => {
				const isActive = active === t;
				return (
					<button
						key={t}
						type="button"
						onClick={() => setNodeType(t)}
						className={`flex items-center justify-center rounded-[10px] border border-stroke-sub-300 px-3 py-1 font-medium text-sm transition-all duration-200 ${
							isActive
								? "border-stroke-medium-300 bg-bg-soft-200 text-text-strong-950"
								: "bg-bg-soft-200/50 text-text-sub-600 hover:bg-bg-soft-100 hover:text-text-sub-600"
						}`}
					>
						{t}
					</button>
				);
			})}
		</div>
	);
}
