import { Inspector } from "@react-email/editor/ui";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useCurrentEditor } from "@tiptap/react";

export interface EmailBreadcrumbNode {
	nodeType: string;
	pos: number;
}

export interface CollapsedEmailBreadcrumb<T extends EmailBreadcrumbNode> {
	displayType: string;
	source: T;
}

function typeName(nodeType: string): string {
	return nodeType.toLowerCase();
}

/** Nested 1×1 layout tables stay in the doc; collapse them only in this trail. */
export function collapseEmailBreadcrumb<T extends EmailBreadcrumbNode>(
	nodes: T[],
	isSingleCellTable: (pos: number) => boolean,
): CollapsedEmailBreadcrumb<T>[] {
	const withoutRows = nodes.filter(
		(node) => typeName(node.nodeType) !== "tablerow",
	);

	const collapsed: CollapsedEmailBreadcrumb<T>[] = [];
	for (let i = 0; i < withoutRows.length; i++) {
		const current = withoutRows[i];
		if (!current) continue;
		const currentType = typeName(current.nodeType);
		const next = withoutRows[i + 1];
		const nextType = next ? typeName(next.nodeType) : "";

		if (currentType === "table" && isSingleCellTable(current.pos)) {
			if (next && (nextType === "tablecell" || nextType === "tableheader")) {
				collapsed.push({ displayType: "section", source: next });
				i += 1;
				continue;
			}
			collapsed.push({ displayType: "section", source: current });
			continue;
		}

		collapsed.push({ displayType: current.nodeType, source: current });
	}

	const merged: CollapsedEmailBreadcrumb<T>[] = [];
	for (const item of collapsed) {
		const prev = merged[merged.length - 1];
		if (
			prev &&
			typeName(prev.displayType) === "section" &&
			typeName(item.displayType) === "section"
		) {
			merged[merged.length - 1] = item;
			continue;
		}
		merged.push(item);
	}
	return merged;
}

export function emailBreadcrumbLabel(type: string): string {
	switch (typeName(type)) {
		case "body":
			return "Page style";
		case "container":
		case "div":
			return "Container";
		case "section":
			return "Section";
		case "heading":
			return "Heading";
		case "paragraph":
		case "text":
			return "Text";
		case "table":
			return "Table";
		case "tablecell":
			return "Table Cell";
		case "tableheader":
			return "Table Header";
		case "tablerow":
			return "Table Row";
		case "image":
			return "Image";
		case "button":
			return "Button";
		case "blockquote":
			return "Blockquote";
		case "bulletlist":
			return "Bullet List";
		case "orderedlist":
			return "Ordered List";
		case "listitem":
			return "List Item";
		case "horizontalrule":
			return "Divider";
		case "variable":
			return "Variable";
		default:
			return type;
	}
}

function emailBreadcrumbIcon(type: string): string {
	switch (typeName(type)) {
		case "text":
		case "paragraph":
		case "heading":
			return "text";
		case "image":
			return "image-upload";
		case "button":
			return "button-rect";
		case "section":
		case "layout":
			return "section-rect";
		case "table":
			return "layout-grid";
		case "tablecell":
		case "tableheader":
		case "container":
		case "div":
			return "box";
		case "blockquote":
			return "quote";
		case "column":
		case "row":
			return "layout-grid";
		case "body":
			return "layout";
		case "variable":
			return "brackets";
		case "bulletlist":
		case "listitem":
			return "list-bullets";
		case "orderedlist":
			return "list-ordered";
		default:
			return "section-rect";
	}
}

const MAX_VISIBLE = 4;

export function visibleEmailBreadcrumbIndexes(length: number): number[] {
	if (length <= MAX_VISIBLE) {
		return Array.from({ length }, (_, i) => i);
	}
	return [0, length - 2, length - 1];
}

function isSingleCellTable(
	editor: ReturnType<typeof useCurrentEditor>["editor"],
	pos: number,
): boolean {
	if (!editor) return false;
	const node =
		editor.state.doc.nodeAt(pos) ?? editor.state.doc.resolve(pos).nodeAfter;
	if (!node || node.type.name !== "table") return false;
	if (node.childCount !== 1) return false;
	return node.child(0).childCount === 1;
}

const BreadCrumb = () => {
	const { editor } = useCurrentEditor();

	return (
		<div className="sticky top-0 z-10 min-w-0 border-stroke-soft-100 border-b bg-bg-white-0 px-3 py-3 dark:border-stroke-soft-100/40 dark:bg-black">
			<ol className="flex min-w-0 list-none items-center gap-1 overflow-hidden">
				<Inspector.Breadcrumb>
					{(segments) => {
						const collapsed = collapseEmailBreadcrumb(
							segments.map((segment) => ({
								nodeType: segment.node?.nodeType ?? "Layout",
								pos: segment.node?.nodePos?.pos ?? 0,
								focus: () => segment.focus(),
							})),
							(pos) => isSingleCellTable(editor, pos),
						);
						const visible = visibleEmailBreadcrumbIndexes(collapsed.length);

						return visible.map((index, visibleIndex) => {
							const item = collapsed[index];
							if (!item) return null;
							const label = emailBreadcrumbLabel(item.displayType);
							const iconName = emailBreadcrumbIcon(item.displayType);
							const isLast = index === collapsed.length - 1;
							const showEllipsis =
								visibleIndex === 1 && (visible[1] ?? 1) !== 1;

							return (
								<li
									key={`${item.source.pos}-${item.displayType}`}
									className={
										isLast
											? "flex min-w-0 flex-1 items-center gap-1 overflow-hidden"
											: "flex shrink-0 items-center gap-1"
									}
								>
									{visibleIndex !== 0 && (
										<span className="shrink-0 text-text-disabled-300 text-xs">
											/
										</span>
									)}
									{showEllipsis && (
										<>
											<span className="shrink-0 text-text-disabled-300 text-xs">
												…
											</span>
											<span className="shrink-0 text-text-disabled-300 text-xs">
												/
											</span>
										</>
									)}
									{isLast ? (
										<div className="flex min-w-0 items-center gap-1.5">
											<Icon
												name={iconName}
												className="h-3.5 w-3.5 shrink-0 text-text-strong-950"
											/>
											<span
												title={label}
												className="min-w-0 truncate font-semibold text-label-xs text-text-strong-950"
											>
												{label}
											</span>
										</div>
									) : (
										<Button.Root
											type="button"
											variant="neutral"
											mode="ghost"
											size="xxsmall"
											title={label}
											className="flex max-w-28 cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-label-xs text-text-sub-600 outline-none ring-0 transition-colors hover:text-text-strong-950"
											onClick={() => item.source.focus()}
										>
											<Icon name={iconName} className="h-3.5 w-3.5 shrink-0" />
											<span className="min-w-0 truncate">{label}</span>
										</Button.Root>
									)}
								</li>
							);
						});
					}}
				</Inspector.Breadcrumb>
			</ol>
		</div>
	);
};

export default BreadCrumb;
