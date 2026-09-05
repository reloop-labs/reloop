import type { Editor } from "@tiptap/react";
import { applyImportedEmailCss } from "./apply-imported-email-css";
import {
	absolutizeEmailAssetUrls,
	readDocumentBodyBackground,
	scopeEmailCssForEditor,
} from "./inline-email-stylesheet";
import {
	emailHasMixedBackgrounds,
	readableTextColor,
} from "./readable-text-color";
import { useEmailHtmlEditorStore } from "./store";
import {
	emailColumnMaxWidthCss,
	findEmailContainerTable,
} from "./strip-email-centering";

function parseCssUnit(val: string | null | undefined): number | undefined {
	if (!val) return undefined;
	const clean = val.trim().toLowerCase();
	if (clean.endsWith("px")) {
		return Number.parseFloat(clean) || 0;
	}
	if (clean.endsWith("rem")) {
		return (Number.parseFloat(clean) || 0) * 16;
	}
	if (clean.endsWith("em")) {
		return (Number.parseFloat(clean) || 0) * 16;
	}
	const num = Number.parseFloat(clean);
	if (!Number.isNaN(num)) return num;
	return undefined;
}

export function extractThemingStylesFromHtml(rawHtml: string): any[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(rawHtml, "text/html");

	// 1. Get body background color — do not invent #ffffff when the
	// HTML leaves the page gray and paints white only on inner sections.
	const bodyBgColor = readDocumentBodyBackground(doc) || undefined;

	// 2. Find the innermost email column table
	const containerTable = findEmailContainerTable(doc);

	let containerBg: string | undefined;
	let containerTextColor: string | undefined;
	let containerWidth = 600;
	let containerPaddingTop = 0;
	let containerPaddingRight = 0;
	let containerPaddingBottom = 0;
	let containerPaddingLeft = 0;
	let containerBorderRadius = 0;
	let containerAlign = "center";

	if (containerTable) {
		const contentCell =
			containerTable.querySelector("tbody > tr > td") ||
			containerTable.querySelector("tr > td") ||
			containerTable.querySelector("td");

		const tableScratch = document.createElement("div");
		tableScratch.style.cssText = containerTable.getAttribute("style") || "";

		const alignAttr = containerTable.getAttribute("align");
		if (alignAttr) {
			containerAlign = alignAttr.toLowerCase();
		}

		const widthVal = emailColumnMaxWidthCss(containerTable);
		if (widthVal) {
			const parsedWidth = parseCssUnit(widthVal);
			if (parsedWidth) containerWidth = parsedWidth;
		}

		containerBg =
			tableScratch.style.backgroundColor ||
			containerTable.getAttribute("bgcolor") ||
			undefined;

		const radiusAttr = tableScratch.style.borderRadius;
		if (radiusAttr) {
			const parsedRadius = parseCssUnit(radiusAttr);
			if (parsedRadius !== undefined) containerBorderRadius = parsedRadius;
		}

		// Read text color from the container's content cell or from the
		// wrapper TD that provides base typography for the email.
		if (contentCell) {
			const colorCellScratch = document.createElement("div");
			colorCellScratch.style.cssText = contentCell.getAttribute("style") || "";
			if (colorCellScratch.style.color) {
				containerTextColor = colorCellScratch.style.color;
			}
		}
		const outerTd = containerTable.closest?.("td");
		if (outerTd && outerTd !== contentCell) {
			const outerScratch = document.createElement("div");
			outerScratch.style.cssText = outerTd.getAttribute("style") || "";
			if (outerScratch.style.color) {
				containerTextColor = outerScratch.style.color;
			}
		}

		// Read padding from container table style (some react-email/tailwind outputs put padding on the table)
		const tpt = tableScratch.style.paddingTop || tableScratch.style.padding;
		const tpr = tableScratch.style.paddingRight || tableScratch.style.padding;
		const tpb = tableScratch.style.paddingBottom || tableScratch.style.padding;
		const tpl = tableScratch.style.paddingLeft || tableScratch.style.padding;

		if (tpt) {
			const v = parseCssUnit(tpt);
			if (v !== undefined) containerPaddingTop = v;
		}
		if (tpr) {
			const v = parseCssUnit(tpr);
			if (v !== undefined) containerPaddingRight = v;
		}
		if (tpb) {
			const v = parseCssUnit(tpb);
			if (v !== undefined) containerPaddingBottom = v;
		}
		if (tpl) {
			const v = parseCssUnit(tpl);
			if (v !== undefined) containerPaddingLeft = v;
		}

		// Read padding from container td (takes precedence)
		if (contentCell) {
			const cellScratch = document.createElement("div");
			cellScratch.style.cssText = contentCell.getAttribute("style") || "";

			const pt = cellScratch.style.paddingTop || cellScratch.style.padding;
			const pr = cellScratch.style.paddingRight || cellScratch.style.padding;
			const pb = cellScratch.style.paddingBottom || cellScratch.style.padding;
			const pl = cellScratch.style.paddingLeft || cellScratch.style.padding;

			if (pt) {
				const v = parseCssUnit(pt);
				if (v !== undefined) containerPaddingTop = v;
			}
			if (pr) {
				const v = parseCssUnit(pr);
				if (v !== undefined) containerPaddingRight = v;
			}
			if (pb) {
				const v = parseCssUnit(pb);
				if (v !== undefined) containerPaddingBottom = v;
			}
			if (pl) {
				const v = parseCssUnit(pl);
				if (v !== undefined) containerPaddingLeft = v;
			}
		}
	} else {
		const divContainer = doc.querySelector('div[data-type="container"]');
		if (divContainer) {
			const divScratch = document.createElement("div");
			divScratch.style.cssText = divContainer.getAttribute("style") || "";

			const widthVal = emailColumnMaxWidthCss(divContainer);
			if (widthVal) {
				const parsedWidth = parseCssUnit(widthVal);
				if (parsedWidth) containerWidth = parsedWidth;
			}

			containerBg = divScratch.style.backgroundColor || undefined;

			const radiusAttr = divScratch.style.borderRadius;
			if (radiusAttr) {
				const parsedRadius = parseCssUnit(radiusAttr);
				if (parsedRadius !== undefined) containerBorderRadius = parsedRadius;
			}

			const pt = divScratch.style.paddingTop || divScratch.style.padding;
			const pr = divScratch.style.paddingRight || divScratch.style.padding;
			const pb = divScratch.style.paddingBottom || divScratch.style.padding;
			const pl = divScratch.style.paddingLeft || divScratch.style.padding;

			if (pt) {
				const v = parseCssUnit(pt);
				if (v !== undefined) containerPaddingTop = v;
			}
			if (pr) {
				const v = parseCssUnit(pr);
				if (v !== undefined) containerPaddingRight = v;
			}
			if (pb) {
				const v = parseCssUnit(pb);
				if (v !== undefined) containerPaddingBottom = v;
			}
			if (pl) {
				const v = parseCssUnit(pl);
				if (v !== undefined) containerPaddingLeft = v;
			}
		}
	}

	const mixedSurfaces = emailHasMixedBackgrounds(doc.body);
	const resolvedTextColor = mixedSurfaces
		? undefined
		: readableTextColor(
				containerBg && containerBg !== "#ffffff" ? containerBg : bodyBgColor,
				containerTextColor,
			);

	return [
		{
			id: "body",
			title: "Background",
			classReference: "body",
			inputs: [
				{
					label: "Background",
					type: "color",
					value: bodyBgColor,
					prop: "backgroundColor",
					classReference: "body",
				},
				{
					label: "Padding Top",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingTop",
					classReference: "body",
				},
				{
					label: "Padding Right",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingRight",
					classReference: "body",
				},
				{
					label: "Padding Bottom",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingBottom",
					classReference: "body",
				},
				{
					label: "Padding Left",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingLeft",
					classReference: "body",
				},
			],
		},
		{
			id: "container",
			title: "Content",
			classReference: "container",
			inputs: [
				{
					label: "Align",
					type: "select",
					value: containerAlign,
					options: {
						left: "Left",
						center: "Center",
						right: "Right",
					},
					prop: "align",
					classReference: "container",
				},
				{
					label: "Width",
					type: "number",
					value: containerWidth,
					unit: "px",
					prop: "width",
					classReference: "container",
				},
				{
					label: "Height",
					type: "number",
					unit: "px",
					prop: "height",
					classReference: "container",
				},
				{
					label: "Text",
					type: "color",
					value: resolvedTextColor,
					prop: "color",
					classReference: "container",
				},
				{
					label: "Background",
					type: "color",
					value: containerBg,
					prop: "backgroundColor",
					classReference: "container",
				},
				{
					label: "Padding Top",
					type: "number",
					value: containerPaddingTop,
					unit: "px",
					prop: "paddingTop",
					classReference: "container",
				},
				{
					label: "Padding Right",
					type: "number",
					value: containerPaddingRight,
					unit: "px",
					prop: "paddingRight",
					classReference: "container",
				},
				{
					label: "Padding Bottom",
					type: "number",
					value: containerPaddingBottom,
					unit: "px",
					prop: "paddingBottom",
					classReference: "container",
				},
				{
					label: "Padding Left",
					type: "number",
					value: containerPaddingLeft,
					unit: "px",
					prop: "paddingLeft",
					classReference: "container",
				},
				{
					label: "Corner radius",
					type: "number",
					value: containerBorderRadius,
					unit: "px",
					prop: "borderRadius",
					classReference: "container",
				},
				{
					label: "Border color",
					type: "color",
					value: "#000000",
					prop: "borderColor",
					classReference: "container",
				},
			],
		},
	];
}

export function mergeParsedStyles(
	existingStyles: any,
	parsedBodyAndContainer: any[],
): any[] {
	const baseGroups =
		Array.isArray(existingStyles) && existingStyles.length > 0
			? existingStyles
			: [
					{
						id: "body",
						title: "Background",
						classReference: "body",
						inputs: [],
					},
					{
						id: "container",
						title: "Content",
						classReference: "container",
						inputs: [],
					},
					{
						id: "typography",
						title: "Text",
						classReference: "body",
						inputs: [],
					},
					{ id: "h1", title: "Title", classReference: "h1", inputs: [] },
					{ id: "h2", title: "Subtitle", classReference: "h2", inputs: [] },
					{ id: "h3", title: "Heading", classReference: "h3", inputs: [] },
					{
						id: "text",
						title: "Paragraph",
						classReference: "paragraph",
						inputs: [],
					},
					{
						id: "button",
						title: "Button",
						classReference: "button",
						inputs: [],
					},
					{ id: "link", title: "Link", classReference: "link", inputs: [] },
					{ id: "list", title: "List", classReference: "list", inputs: [] },
					{
						id: "nested-list",
						title: "Nested List",
						classReference: "nestedList",
						inputs: [],
					},
					{
						id: "list-item",
						title: "List Item",
						classReference: "listItem",
						inputs: [],
					},
					{
						id: "code-block",
						title: "Code Block",
						classReference: "codeBlock",
						inputs: [],
					},
					{
						id: "inline-code",
						title: "Inline Code",
						classReference: "inlineCode",
						inputs: [],
					},
				];

	const parsedMap = new Map(parsedBodyAndContainer.map((g) => [g.id, g]));

	return baseGroups.map((group) => {
		const parsedGroup = parsedMap.get(group.id);
		if (parsedGroup) {
			return parsedGroup;
		}
		return group;
	});
}

// Helper to extract global theme styling details from custom pasted HTML
export function parseGlobalStylesFromHtml(html: string) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	absolutizeEmailAssetUrls(doc);

	// 1. Extract style block contents
	const styleTags = doc.querySelectorAll("style");
	let cssString = "";
	for (const tag of Array.from(styleTags)) {
		cssString += `${tag.textContent}\n`;
	}

	// Rewrite `body` / `html` selectors to target the TipTap root instead.
	// The visual builder renders inside a `.ProseMirror` element (not an iframe),
	// so keeping `body { ... }` rules would do nothing, and using `&` is not valid
	// plain CSS. Scoping to `.tiptap.ProseMirror` preserves the original intent (fonts,
	// spacing, resets) without leaking styles across the app shell.
	cssString = scopeEmailCssForEditor(cssString);

	// 2. Extract external stylesheet links (e.g. google fonts) so they can load in the head
	const links = doc.querySelectorAll(
		"link[rel='stylesheet'], link[href*='fonts.googleapis.com']",
	);
	let fontImports = "";
	for (const link of Array.from(links)) {
		const href = link.getAttribute("href");
		if (href) {
			fontImports += `@import url('${href}');\n`;
		}
	}

	if (fontImports) {
		cssString = fontImports + cssString;
	}

	// 2.5 Apply a strong "email base" reset to the editor canvas.
	//
	// The visual builder runs inside TipTap's `.ProseMirror`, which has its own
	// default typography (margins, font sizing, colors). Email HTML assumes a
	// mostly-neutral environment (like an iframe/email client), so we read the
	// outer email wrapper `<td>` styles and apply them to `.ProseMirror` with
	// higher specificity to match React Email's preview more closely.
	const wrapperTd =
		doc.querySelector('td[style*="min-height:100%"]') ||
		doc.querySelector('td[style*="min-height: 100%"]');
	if (wrapperTd) {
		const scratch = doc.createElement("div") as HTMLDivElement;
		scratch.style.cssText = wrapperTd.getAttribute("style") || "";

		const baseFontFamily = scratch.style.fontFamily;
		const baseFontSize = scratch.style.fontSize;
		const baseLineHeight = scratch.style.lineHeight;
		const baseColor = scratch.style.color;
		const baseBg = scratch.style.backgroundColor;
		const baseLetterSpacing = scratch.style.letterSpacing;
		const mixedSurfaces = emailHasMixedBackgrounds(doc.body);

		// Defaults only — no !important. Pasted inline font-size / family on
		// headings and footers must win over the wrapper td (15px body text
		// must not paint a 13px / 320px footer at 15px).
		const proseMirrorBase = [
			".tiptap.ProseMirror, .ProseMirror{",
			baseFontFamily ? `font-family:${baseFontFamily};` : "",
			baseFontSize ? `font-size:${baseFontSize};` : "",
			baseLineHeight ? `line-height:${baseLineHeight};` : "",
			baseColor && !mixedSurfaces ? `color:${baseColor};` : "",
			baseBg && !mixedSurfaces ? `background-color:${baseBg};` : "",
			baseLetterSpacing ? `letter-spacing:${baseLetterSpacing};` : "",
			"}",
			// Kill TipTap/EmailTheming block padding without !important on
			// margin so pasted inline spacing (Dither 2.5rem) still wins.
			".tiptap.ProseMirror p, .ProseMirror p{margin:0;}",
			".tiptap.ProseMirror h1, .tiptap.ProseMirror h2, .tiptap.ProseMirror h3, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3{margin:0;}",
			".tiptap.ProseMirror table, .ProseMirror table{border-collapse:separate !important;}",
			".tiptap.ProseMirror img, .ProseMirror img{display:block;}",
			"",
		]
			.filter(Boolean)
			.join("");

		cssString = proseMirrorBase + cssString;
	}

	// Body canvas only. Do not steal an inner section color (Halo gray)
	// or the footer, which sits on white, goes gray with the rest.
	const bodyBg = readDocumentBodyBackground(doc);

	// Fallback: many React Email templates (e.g., Twitch) set body bg via
	// `Body` inline style, not via the `min-height:100%` wrapper td. Without
	// this, `cssString` has no ProseMirror background and the canvas flashes
	// white until globalContent hydrates, making the whole email look grayish
	// vs the iframe preview which already has body gray. Inject it globally
	// here so visual == code preview for any template.
	if (!wrapperTd && bodyBg) {
		const scratch = doc.createElement("div") as HTMLDivElement;
		scratch.style.backgroundColor = bodyBg;
		const normalizedBg = scratch.style.backgroundColor;
		if (normalizedBg) {
			const bodyRule = `.tiptap.ProseMirror, .ProseMirror{background-color:${normalizedBg};}`;
			// Prepend so container white (via node-container) can overlay.
			cssString = bodyRule + cssString;
		}
	}

	// Column width from the pasted wrapper — not the outer 100% body table.
	// Stamp max-width onto the canvas container so `width: 100%` cannot
	// fill the dashboard. Keep the source string (37.5em stays em).
	let containerWidth: number | null = null;
	const columnTable = findEmailContainerTable(doc.body);
	const columnMax = columnTable ? emailColumnMaxWidthCss(columnTable) : null;
	if (columnMax) {
		const parsedWidth = parseCssUnit(columnMax);
		if (parsedWidth) containerWidth = parsedWidth;
		cssString += `.tiptap.ProseMirror .node-container,.tiptap.ProseMirror [data-type="container"],.ProseMirror .node-container,.ProseMirror [data-type="container"]{width:100%;max-width:${columnMax};}`;
	}

	return {
		css: cssString.trim(),
		bodyBg: bodyBg.trim(),
		containerWidth,
	};
}

/** Same theme pass the HTML editor runs after a full-email paste. */
export function applyPastedEmailTheme(editor: Editor, rawHtml: string): void {
	window.setTimeout(() => {
		try {
			const parsed = parseGlobalStylesFromHtml(rawHtml);
			const existingAfterSeed = getGlobalStylesArray(editor);

			if (parsed.css) {
				applyImportedEmailCss(parsed.css);
				useEmailHtmlEditorStore.getState().setImportedEmailCss(parsed.css);
			}

			const parsedBodyAndContainer = extractThemingStylesFromHtml(rawHtml);

			let mergedStyles = mergeParsedStyles(
				existingAfterSeed,
				parsedBodyAndContainer,
			);

			if (parsed.bodyBg) {
				mergedStyles = updateGlobalStyleValue(
					mergedStyles,
					"body",
					"backgroundColor",
					parsed.bodyBg,
				);
			}

			const containerBg =
				parsed.bodyBg ||
				findStyleInputValue(mergedStyles, "container", "backgroundColor");
			const extractedColor = findStyleInputValue(
				mergedStyles,
				"container",
				"color",
			);
			const mixedSurfaces = emailHasMixedBackgrounds(
				new DOMParser().parseFromString(rawHtml, "text/html").body,
			);
			const textColor = mixedSurfaces
				? undefined
				: readableTextColor(
						typeof containerBg === "string" ? containerBg : undefined,
						typeof extractedColor === "string" ? extractedColor : undefined,
					);
			if (textColor) {
				mergedStyles = updateGlobalStyleValue(
					mergedStyles,
					"container",
					"color",
					textColor,
				);
				mergedStyles = updateGlobalStyleValue(
					mergedStyles,
					"body",
					"color",
					textColor,
				);
			}

			mergedStyles = updateGlobalStyleValue(
				mergedStyles,
				"container",
				"height",
				undefined,
			);
			mergedStyles = updateGlobalStyleValue(
				mergedStyles,
				"container",
				"borderWidth",
				0,
			);

			editor.commands.setGlobalContent("styles", mergedStyles);
		} catch (err) {
			console.error("Failed to apply pasted email theme:", err);
		}
	}, 50);
}

// Helper to retrieve the current styles array from the Tiptap document
export function getGlobalStylesArray(editor: any): any[] {
	let globalContentNode: any = null;
	editor.state.doc.descendants((node: any) => {
		if (node.type.name === "globalContent") {
			globalContentNode = node;
			return false;
		}
	});
	return globalContentNode?.attrs?.data?.styles || [];
}

export function findStyleInputValue(
	styles: any[],
	componentId: string,
	prop: string,
) {
	const group = styles?.find((g) => g.id === componentId);
	return group?.inputs?.find((input: any) => input.prop === prop)?.value;
}

// Helper to update a specific property in the styles array
export function updateGlobalStyleValue(
	styles: any[],
	componentId: string,
	prop: string,
	value: any,
) {
	if (!styles || !Array.isArray(styles)) return styles;
	return styles.map((group) => {
		if (group.id !== componentId) return group;
		return {
			...group,
			inputs: group.inputs.map((input: any) => {
				if (input.prop !== prop) return input;
				return { ...input, value };
			}),
		};
	});
}
