"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import {
	sanitizePreviewHtml,
	withoutEditorChrome,
} from "#/features/templates/editor/utils/sanitize-preview-html";

function serializeIframeDocument(doc: Document): string {
	const doctype = doc.doctype
		? `<!DOCTYPE ${doc.doctype.name}>`
		: "<!DOCTYPE html>";
	return withoutEditorChrome(`${doctype}${doc.documentElement.outerHTML}`);
}

function enableDocumentEditing(doc: Document, enabled: boolean) {
	try {
		doc.designMode = enabled ? "on" : "off";
	} catch {
		// Some browsers reject designMode until the frame is same-origin.
	}

	if (enabled) {
		for (const el of Array.from(doc.querySelectorAll("[contenteditable]"))) {
			el.removeAttribute("contenteditable");
		}
	}

	doc.documentElement.contentEditable = enabled ? "true" : "inherit";
	if (doc.body) {
		doc.body.contentEditable = enabled ? "true" : "false";
		doc.body.spellcheck = false;
	}
}

export function HtmlEmailPreview({ editable = false }: { editable?: boolean }) {
	const codeHtml = useEditorStore((s) => s.codeHtml);
	const setCodeHtml = useEditorStore((s) => s.setCodeHtml);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const skipSrcDocRef = useRef(false);
	const bodyHtmlRef = useRef("");
	const [srcDoc, setSrcDoc] = useState(() => sanitizePreviewHtml(codeHtml));

	useEffect(() => {
		if (skipSrcDocRef.current) {
			skipSrcDocRef.current = false;
			return;
		}
		setSrcDoc(sanitizePreviewHtml(codeHtml));
	}, [codeHtml]);

	useEffect(() => {
		void srcDoc;
		const iframe = iframeRef.current;
		if (!iframe) return;

		const bind = () => {
			const doc = iframe.contentDocument;
			if (!doc?.body) return;

			enableDocumentEditing(doc, editable);
			bodyHtmlRef.current = doc.body.innerHTML;

			const persist = () => {
				if (doc.body.innerHTML === bodyHtmlRef.current) return;
				bodyHtmlRef.current = doc.body.innerHTML;
				const next = serializeIframeDocument(doc);
				if (next === useEditorStore.getState().codeHtml) return;
				skipSrcDocRef.current = true;
				setCodeHtml(next);
				useEditorStore.getState().setHasUnsavedChanges(true);
			};

			const preventNavigation = (event: MouseEvent) => {
				const target = event.target as Element | null;
				if (target?.closest?.("a")) {
					event.preventDefault();
				}
			};

			const focusFrame = () => {
				iframe.contentWindow?.focus();
			};

			doc.addEventListener("click", preventNavigation);
			if (editable) {
				doc.addEventListener("input", persist);
				doc.addEventListener("pointerdown", focusFrame);
			}

			return () => {
				doc.removeEventListener("click", preventNavigation);
				doc.removeEventListener("input", persist);
				doc.removeEventListener("pointerdown", focusFrame);
			};
		};

		let unbind: (() => void) | undefined;
		const onLoad = () => {
			unbind?.();
			unbind = bind();
		};

		iframe.addEventListener("load", onLoad);
		unbind = bind();

		return () => {
			iframe.removeEventListener("load", onLoad);
			unbind?.();
		};
	}, [editable, srcDoc, setCodeHtml]);

	if (!srcDoc) {
		return <div className="absolute inset-0 bg-bg-white-0 dark:bg-black" />;
	}

	return (
		<iframe
			ref={iframeRef}
			title="Email HTML preview"
			sandbox="allow-same-origin allow-scripts"
			srcDoc={srcDoc}
			className="absolute inset-0 size-full border-0 bg-transparent"
		/>
	);
}
