const SKIP_SELECTOR = /:(?:hover|focus|active|visited|link)\b|::/;

function stripCssComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function readBraceBlock(
	css: string,
	openIdx: number,
): { body: string; end: number } {
	let depth = 0;
	for (let i = openIdx; i < css.length; i++) {
		if (css[i] === "{") depth++;
		else if (css[i] === "}") {
			depth--;
			if (depth === 0) {
				return { body: css.slice(openIdx + 1, i), end: i + 1 };
			}
		}
	}
	return { body: css.slice(openIdx + 1), end: css.length };
}

function parseStyleRules(
	css: string,
): Array<{ selector: string; body: string }> {
	const source = stripCssComments(css);
	const rules: Array<{ selector: string; body: string }> = [];
	let i = 0;

	while (i < source.length) {
		while (i < source.length && /\s/.test(source[i] ?? "")) i++;
		if (i >= source.length) break;

		if (source[i] === "@") {
			const open = source.indexOf("{", i);
			if (open < 0) break;
			const prelude = source.slice(i, open).trim();
			const block = readBraceBlock(source, open);
			if (
				/^@media\b/i.test(prelude) &&
				/max-width/i.test(prelude) &&
				!/min-width/i.test(prelude)
			) {
				i = block.end;
				continue;
			}
			if (/^@media\b/i.test(prelude)) {
				rules.push(...parseStyleRules(block.body));
			}
			i = block.end;
			continue;
		}

		const open = source.indexOf("{", i);
		if (open < 0) break;
		const selector = source.slice(i, open).trim();
		const block = readBraceBlock(source, open);
		if (selector) rules.push({ selector, body: block.body });
		i = block.end;
	}

	return rules;
}

function isDocumentResetSelector(selector: string): boolean {
	return selector.split(",").every((part) => {
		const s = part.trim();
		return s === "*" || s === "html" || s === "body";
	});
}
function originalStyleProps(el: HTMLElement): Set<string> {
	const cssText = el.getAttribute("style");
	const props = new Set<string>();
	if (!cssText) return props;
	const scratch = el.ownerDocument.createElement("div");
	scratch.style.cssText = cssText;
	for (let i = 0; i < scratch.style.length; i++) {
		const prop = scratch.style[i];
		if (prop) props.add(prop);
	}
	return props;
}

function isLocked(locked: Set<string> | undefined, prop: string): boolean {
	if (!locked) return false;
	if (locked.has(prop)) return true;
	const root = prop.split("-")[0];
	if (
		(root === "padding" || root === "margin" || root === "border") &&
		locked.has(root)
	) {
		return true;
	}
	return false;
}

function applyDeclarations(
	el: HTMLElement,
	body: string,
	locked: Set<string> | undefined,
): void {
	for (const part of body.split(";")) {
		const colon = part.indexOf(":");
		if (colon < 0) continue;
		const prop = part.slice(0, colon).trim();
		if (!prop) continue;
		let value = part.slice(colon + 1).trim();
		if (!value) continue;
		const important = /!important/i.test(value);
		value = value.replace(/\s*!important/gi, "").trim();
		if (isLocked(locked, prop)) continue;
		el.style.setProperty(prop, value, important ? "important" : "");
	}
}

/**
 * Copy stylesheet rules onto matching elements as inline styles so TipTap
 * keeps spacing after `<style>` tags are stripped. HTML inline styles win.
 */
export function inlineEmailStylesheet(doc: Document): void {
	const css = Array.from(doc.querySelectorAll("style"))
		.map((el) => el.textContent ?? "")
		.join("\n")
		.trim();
	if (!css) return;

	const originals = new WeakMap<HTMLElement, Set<string>>();
	const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = doc.body;
	while (node) {
		if (node instanceof HTMLElement) {
			originals.set(node, originalStyleProps(node));
		}
		node = walker.nextNode();
	}

	for (const rule of parseStyleRules(css)) {
		if (SKIP_SELECTOR.test(rule.selector)) continue;
		if (isDocumentResetSelector(rule.selector)) continue;

		let matches: NodeListOf<Element>;
		try {
			matches = doc.querySelectorAll(rule.selector);
		} catch {
			continue;
		}

		for (const el of Array.from(matches)) {
			if (!(el instanceof HTMLElement)) continue;
			if (
				el.tagName === "HTML" ||
				el.tagName === "HEAD" ||
				el.tagName === "STYLE"
			) {
				continue;
			}
			applyDeclarations(el, rule.body, originals.get(el));
		}
	}
}

/**
 * Rewrite email `body` / `html` / `*` rules so they apply inside TipTap
 * without a `.ProseMirror *` reset beating utility classes.
 */
export function scopeEmailCssForEditor(css: string): string {
	let scoped = css.replace(
		/(?<![.#\-\w])body\b/g,
		".tiptap.ProseMirror, .ProseMirror",
	);
	scoped = scoped.replace(
		/(?<![.#\-\w])html\b/g,
		".tiptap.ProseMirror, .ProseMirror",
	);
	return scoped.replace(
		/(^|[,{}])(\s*)\*(?=\s*[,{])/g,
		"$1$2.tiptap.ProseMirror :where(*), $2.ProseMirror :where(*)",
	);
}

const ABSOLUTE_ASSET = /^(?:https?:|data:|cid:|blob:)/i;

function resolveEmailAssetOrigin(doc: Document): string {
	const baseHref =
		doc.querySelector("base[href]")?.getAttribute("href")?.trim() ?? "";
	if (ABSOLUTE_ASSET.test(baseHref)) {
		try {
			return new URL(baseHref).origin;
		} catch {
			/* ignore invalid base href */
		}
	}

	for (const img of Array.from(doc.querySelectorAll("img[src]"))) {
		const src = img.getAttribute("src")?.trim() ?? "";
		if (!ABSOLUTE_ASSET.test(src)) continue;
		try {
			return new URL(src).origin;
		} catch {
			/* ignore invalid src */
		}
	}

	const css = Array.from(doc.querySelectorAll("style"))
		.map((el) => el.textContent ?? "")
		.join("\n");
	const fromCss = css.match(/url\(\s*['"]?(https?:\/\/[^/'")]+)/i);
	if (fromCss?.[1]) {
		try {
			return new URL(fromCss[1]).origin;
		} catch {
			/* ignore invalid css url */
		}
	}
	return "";
}

function absolutizeAssetUrl(url: string, origin: string): string {
	const trimmed = url.trim();
	if (
		!trimmed ||
		ABSOLUTE_ASSET.test(trimmed) ||
		trimmed.startsWith("#") ||
		trimmed.startsWith("data:")
	) {
		return trimmed;
	}
	if (trimmed.startsWith("//")) {
		try {
			return new URL(`https:${trimmed}`).href;
		} catch {
			return trimmed;
		}
	}
	try {
		return new URL(trimmed, `${origin}/`).href;
	} catch {
		return trimmed;
	}
}

function rewriteCssUrls(css: string, origin: string): string {
	if (!origin || !css.includes("url(")) return css;
	return css.replace(
		/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
		(_full, quote: string, raw: string) => {
			const abs = absolutizeAssetUrl(raw, origin);
			return `url(${quote}${abs}${quote})`;
		},
	);
}

/**
 * Resolve relative `url()` / `src` against the paste document so
 * email backgrounds that point at `/static/...` still load in the editor.
 */
export function absolutizeEmailAssetUrls(doc: Document): void {
	const origin = resolveEmailAssetOrigin(doc);
	if (!origin) return;

	for (const styleEl of Array.from(doc.querySelectorAll("style"))) {
		if (styleEl.textContent) {
			styleEl.textContent = rewriteCssUrls(styleEl.textContent, origin);
		}
	}

	const root = doc.body ?? doc.documentElement;
	const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = root;
	while (node) {
		if (node instanceof HTMLElement) {
			const style = node.getAttribute("style");
			if (style?.includes("url(")) {
				node.setAttribute("style", rewriteCssUrls(style, origin));
			}
			for (const attr of ["src", "poster"] as const) {
				const val = node.getAttribute(attr);
				if (val && !ABSOLUTE_ASSET.test(val)) {
					node.setAttribute(attr, absolutizeAssetUrl(val, origin));
				}
			}
		}
		node = walker.nextNode();
	}
}
