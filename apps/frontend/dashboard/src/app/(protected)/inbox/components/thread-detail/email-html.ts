import DOMPurify from "dompurify";

export type EmailTheme = "light" | "dark";

/**
 * Sanitize raw email HTML for XSS-safe display.
 */
export const cleanHtml = (html: string): string => {
	if (!html) return "<p><em>No email content available</em></p>";
	try {
		return DOMPurify.sanitize(html, {
			ADD_TAGS: ["style", "details", "summary"],
			ADD_ATTR: [
				"target",
				"rel",
				"class",
				"style",
				"align",
				"valign",
				"width",
				"height",
				"cellpadding",
				"cellspacing",
				"border",
				"bgcolor",
				"colspan",
				"rowspan",
				"data-theme-color",
			],
			ALLOW_DATA_ATTR: true,
		});
	} catch {
		return "<p><em>No email content available</em></p>";
	}
};

const collapseQuoted = (doc: Document, selector: string) => {
	const nodes = Array.from(doc.querySelectorAll(selector));
	for (const el of nodes) {
		if (el.closest("details.quoted-toggle")) continue;
		const inner = el.innerHTML;
		const details = doc.createElement("details");
		details.className = "quoted-toggle";
		details.setAttribute("style", "margin-top:1em;");
		const summary = doc.createElement("summary");
		summary.setAttribute("style", "cursor:pointer;");
		summary.setAttribute("data-theme-color", "muted");
		summary.textContent = "Show quoted text";
		details.appendChild(summary);
		const wrapper = doc.createElement("div");
		wrapper.innerHTML = inner;
		details.appendChild(wrapper);
		el.replaceWith(details);
	}
};

/**
 * Client-side preprocess: collapse quotes, strip trackers, force safe links.
 */
export const preprocessEmailHtml = (html: string): string => {
	const sanitized = cleanHtml(html);
	const doc = new DOMParser().parseFromString(sanitized, "text/html");

	collapseQuoted(doc, "blockquote");
	collapseQuoted(doc, ".gmail_quote");

	for (const title of Array.from(doc.querySelectorAll("title"))) {
		title.remove();
	}

	for (const img of Array.from(doc.querySelectorAll("img"))) {
		const w = img.getAttribute("width");
		const h = img.getAttribute("height");
		if ((w === "1" && h === "1") || (w === "0" && h === "0")) {
			img.remove();
		}
	}

	for (const el of Array.from(
		doc.querySelectorAll('.preheader, .preheaderText, [class*="preheader"]'),
	)) {
		const style = el.getAttribute("style") || "";
		if (
			/display:\s*none/i.test(style) ||
			/font-size:\s*0/i.test(style) ||
			/line-height:\s*0/i.test(style) ||
			/max-height:\s*0/i.test(style) ||
			/opacity:\s*0/i.test(style) ||
			/mso-hide:\s*all/i.test(style)
		) {
			el.remove();
		}
	}

	for (const a of Array.from(doc.querySelectorAll("a"))) {
		a.setAttribute("target", a.getAttribute("target") || "_blank");
		a.setAttribute("rel", "noopener noreferrer");
	}

	return doc.body.innerHTML;
};

const themeStyles = (theme: EmailTheme): string => {
	const isDark = theme === "dark";
	return `
<style type="text/css">
  :host {
    display: block;
    line-height: 1.5;
    background-color: transparent;
    color: ${isDark ? "#ffffff" : "#000000"};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
  }
  *, *::before, *::after { box-sizing: border-box; }
  img { max-width: 100%; height: auto; }
  a {
    cursor: pointer;
    color: ${isDark ? "#60a5fa" : "#2563eb"};
    text-decoration: underline;
  }
  table { border-collapse: collapse; }
  details.quoted-toggle {
    border-left: 2px solid ${isDark ? "#374151" : "#d1d5db"};
    padding-left: 8px;
    margin-top: 0.75rem;
  }
  details.quoted-toggle summary {
    cursor: pointer;
    color: ${isDark ? "#9CA3AF" : "#6B7280"};
    list-style: none;
    user-select: none;
  }
  details.quoted-toggle summary::-webkit-details-marker { display: none; }
  [data-theme-color="muted"] {
    color: ${isDark ? "#9CA3AF" : "#6B7280"};
  }
</style>`;
};

/**
 * Apply image preferences + theme styles for Shadow DOM injection.
 */
export const processEmailHtmlForDisplay = ({
	html,
	shouldLoadImages,
	theme,
}: {
	html: string;
	shouldLoadImages: boolean;
	theme: EmailTheme;
}): { processedHtml: string; hasBlockedImages: boolean } => {
	const preprocessed = preprocessEmailHtml(html);
	const doc = new DOMParser().parseFromString(preprocessed, "text/html");
	let hasBlockedImages = false;

	if (!shouldLoadImages) {
		for (const img of Array.from(doc.querySelectorAll("img"))) {
			const src = img.getAttribute("src") || "";
			if (src && !src.startsWith("cid:")) {
				hasBlockedImages = true;
				const placeholder = doc.createElement("span");
				placeholder.style.display = "none";
				placeholder.textContent = `<!-- blocked image: ${src} -->`;
				img.replaceWith(placeholder);
			}
		}
	}

	return {
		processedHtml: `${themeStyles(theme)}${doc.body.innerHTML}`,
		hasBlockedImages,
	};
};
