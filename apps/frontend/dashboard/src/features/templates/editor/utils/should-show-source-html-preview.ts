/**
 * The iframe HTML preview is only the code-split right pane.
 * Visual mode is always TipTap — including after a full-email paste
 * (`htmlLocked`). Wiring slash/bubble to TipTap does nothing if the
 * canvas has been swapped out for a contenteditable iframe.
 */
export function shouldShowSourceHtmlPreview(options: {
	isCodeSplit: boolean;
	codeHtml: string;
}): boolean {
	return options.isCodeSplit && Boolean(options.codeHtml.trim());
}
