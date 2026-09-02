/**
 * Campaign autosave used to persist composeReactEmail() output (table
 * scaffold, align="center") as contentHtml, then reload it with
 * editor.commands.setContent(html). TipTap inherited the email-layout
 * centering, so blocks jumped to the center after save.
 *
 * Visual round-trips must use the editor JSON document. Composed HTML
 * is only for send/test. HTML is a fallback for drafts saved before
 * the JSON column existed.
 */

export type CampaignEditorJsonNode = Record<string, unknown>;

export type CampaignEditorDocument =
	| { kind: "json"; content: CampaignEditorJsonNode[] }
	| { kind: "html"; html: string };

export function isEditorJsonContent(
	content: unknown,
): content is CampaignEditorJsonNode[] {
	if (!Array.isArray(content) || content.length === 0) return false;
	const first = content[0];
	return typeof first === "object" && first !== null && !Array.isArray(first);
}

export function resolveCampaignEditorDocument(input: {
	content?: unknown;
	contentHtml?: string | null;
}): CampaignEditorDocument | null {
	if (isEditorJsonContent(input.content)) {
		return { kind: "json", content: input.content };
	}
	const html = input.contentHtml?.trim();
	if (html) return { kind: "html", html };
	return null;
}

/**
 * Strip email-client layout centering and unwrap the outer container
 * table so TipTap maps content to editor nodes instead of a centered
 * presentation table.
 */
export function prepareCampaignHtmlForEditor(html: string): string {
	if (typeof DOMParser === "undefined") return html;
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	for (const center of Array.from(doc.getElementsByTagName("center"))) {
		const parent = center.parentNode;
		if (!parent) continue;
		while (center.firstChild) {
			parent.insertBefore(center.firstChild, center);
		}
		center.remove();
	}

	const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = doc.body;
	while (node) {
		const el = node as HTMLElement;
		if (el.getAttribute?.("align")?.toLowerCase() === "center") {
			el.removeAttribute("align");
		}
		if (el.style?.textAlign?.toLowerCase() === "center") {
			el.style.removeProperty("text-align");
		}
		node = walker.nextNode();
	}

	return unwrapEmailContainerTable(doc);
}

function unwrapEmailContainerTable(doc: Document): string {
	const containerTable = findContainerTable(doc);
	if (!containerTable) return doc.body.innerHTML;

	const contentCell =
		containerTable.querySelector("tbody > tr > td") ||
		containerTable.querySelector("tr > td") ||
		containerTable.querySelector("td");
	if (!contentCell) return doc.body.innerHTML;

	const containerDiv = doc.createElement("div");
	containerDiv.setAttribute("data-type", "container");
	containerDiv.setAttribute("class", "node-container");

	const tableStyle = containerTable.getAttribute("style");
	if (tableStyle) containerDiv.setAttribute("style", tableStyle);

	const cellNodes = Array.from(contentCell.childNodes);
	for (const child of cellNodes) {
		containerDiv.appendChild(child);
	}

	return containerDiv.outerHTML;
}

function findContainerTable(doc: Document): Element | null {
	const explicit = doc.querySelector('table[data-type="container"]');
	if (explicit) return explicit;

	const tables = Array.from(doc.body.getElementsByTagName("table"));
	for (const table of tables) {
		const style = table.getAttribute("style") || "";
		const width = table.getAttribute("width") || "";
		if (
			table.className.includes("container") ||
			style.includes("max-width") ||
			style.includes("maxWidth") ||
			(/^\d+$/.test(width) && width !== "100%")
		) {
			return table;
		}
	}
	return tables[0] ?? null;
}
