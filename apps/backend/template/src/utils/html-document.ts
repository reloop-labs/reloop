import { TemplateErrors } from "@be/template/error/template.error";
import { templateConfig } from "@be/template/template.config";

export const IMAGE_FORMATS = ["png", "jpeg", "webp"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export type HtmlToImageRequest = {
	html: string;
	width: number;
	format: ImageFormat;
	quality: number;
	scale: number;
};

const { htmlToImage: limits } = templateConfig.constants;

export function isFullHtmlDocument(html: string): boolean {
	return /<html[\s>]/i.test(html);
}

/**
 * Email HTML is often a fragment. Wrap fragments in a 600px document so
 * Chromium screenshots the email canvas, not a collapsed empty page.
 */
export function wrapEmailHtml(html: string, width: number): string {
	if (isFullHtmlDocument(html)) return html;

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=${width}, initial-scale=1" />
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  body { width: ${width}px; }
  img { max-width: 100%; height: auto; display: block; }
  table { border-collapse: collapse; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}

export function byteLength(value: string): number {
	return new TextEncoder().encode(value).length;
}

export function parseHtmlToImageRequest(input: {
	html?: string;
	width?: number;
	format?: string;
	quality?: number;
	scale?: number;
}): HtmlToImageRequest {
	const html = input.html?.trim() ?? "";
	if (!html) throw TemplateErrors.htmlRequired();

	const size = byteLength(html);
	if (size > limits.maxHtmlBytes) {
		throw TemplateErrors.htmlTooLarge(size, limits.maxHtmlBytes);
	}

	const width = input.width ?? limits.defaultWidth;
	if (
		!Number.isFinite(width) ||
		width < limits.minWidth ||
		width > limits.maxWidth
	) {
		throw TemplateErrors.invalidImageWidth(
			width,
			limits.minWidth,
			limits.maxWidth,
		);
	}

	const format = (input.format ?? "png").toLowerCase();
	if (!IMAGE_FORMATS.includes(format as ImageFormat)) {
		throw TemplateErrors.invalidImageFormat(format);
	}

	const quality = input.quality ?? 80;
	const clampedQuality = Math.min(100, Math.max(1, Math.round(quality)));

	const scale = input.scale ?? limits.defaultScale;
	const clampedScale = Math.min(3, Math.max(1, scale));

	return {
		html,
		width: Math.round(width),
		format: format as ImageFormat,
		quality: clampedQuality,
		scale: clampedScale,
	};
}

export function contentTypeFor(format: ImageFormat): string {
	if (format === "jpeg") return "image/jpeg";
	if (format === "webp") return "image/webp";
	return "image/png";
}
