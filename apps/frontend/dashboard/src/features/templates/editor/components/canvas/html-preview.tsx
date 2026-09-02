"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { sanitizePreviewHtml } from "#/features/templates/editor/utils/sanitize-preview-html";

function serializeIframeDocument(doc: Document): string {
	const doctype = doc.doctype
		? `<!DOCTYPE ${doc.doctype.name}>`
		: "<!DOCTYPE html>";
	return `${doctype}${doc.documentElement.outerHTML}`;
}

export function HtmlEmailPreview({
	editable = false,
}: {
	editable?: boolean;
}) {
	const codeHtml = useEditorStore((s) => s.codeHtml);
	const setCodeHtml = useEditorStore((s) => s.setCodeHtml);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const skipSrcDocRef = useRef(false);
	const [srcDoc, setSrcDoc] = useState(() => sanitizePreviewHtml(codeHtml));

	useEffect(() => {
		if (skipSrcDocRef.current) {
			skipSrcDocRef.current = false;
			return;
		}
		setSrcDoc(sanitizePreviewHtml(codeHtml));
	}, [codeHtml]);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;

		const bind = () => {
			const doc = iframe.contentDocument;
			if (!doc?.body) return;

			doc.body.contentEditable = editable ? "true" : "false";
			doc.body.spellcheck = false;

			if (!editable) return undefined;

			const persist = () => {
				const next = serializeIframeDocument(doc);
				if (next === useEditorStore.getState().codeHtml) return;
				skipSrcDocRef.current = true;
				setCodeHtml(next);
				useEditorStore.getState().setHasUnsavedChanges(true);
			};

			const preventNavigation = (event: MouseEvent) => {
				const target = event.target as Element | null;
				if (target?.closest("a")) {
					event.preventDefault();
				}
			};

			doc.addEventListener("input", persist);
			doc.addEventListener("click", preventNavigation);

			return () => {
				doc.removeEventListener("input", persist);
				doc.removeEventListener("click", preventNavigation);
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
			sandbox={editable ? "allow-same-origin" : ""}
			srcDoc={srcDoc}
			className="absolute inset-0 size-full border-0 bg-transparent"
		/>
	);
}
