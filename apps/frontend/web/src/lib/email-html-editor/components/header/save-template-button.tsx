import * as Button from "@reloop/ui/button";
import { useCurrentEditor } from "@tiptap/react";
import { useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "../../hooks/use-editor-store";
import {
	getLockedSourceHtml,
	getRenderedEmailHtml,
} from "../../utils/get-rendered-email-html";
import { savePendingTemplateDraft } from "../../utils/pending-template-draft";
import { withFontLinks } from "../../utils/with-font-links";

async function hasSession(): Promise<boolean> {
	try {
		const res = await fetch("/api/auth/get-session", {
			credentials: "include",
		});
		if (!res.ok) return false;
		const data = (await res.json()) as { session?: unknown } | null;
		return !!data?.session;
	} catch {
		return false;
	}
}

/**
 * Parks the current email as a pending draft, then sends the user to the
 * dashboard (signed in) or sign-up (signed out). The dashboard picks the
 * draft up once a workspace is active and opens it as a new template.
 */
export function SaveTemplateButton({ templateName }: { templateName: string }) {
	const { editor } = useCurrentEditor();
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!editor || isSaving) return;
		setIsSaving(true);
		try {
			const { subject, previewText, variables, importedEmailCss } =
				useEditorStore.getState();
			const html = withFontLinks(
				await getRenderedEmailHtml(editor, previewText),
				importedEmailCss,
			);
			// Untouched templates keep their source HTML as the record. After a
			// canvas edit, the document itself is what the user sees.
			const content = getLockedSourceHtml()
				? undefined
				: editor.getJSON().content;
			const result = savePendingTemplateDraft({
				name: subject.trim() || templateName,
				subject,
				previewText,
				html,
				content,
				variables,
			});
			if (result === "too-large") {
				toast.error(
					"This email is too large to carry over. Swap uploaded images for hosted image URLs and try again.",
				);
				setIsSaving(false);
				return;
			}
			if (result === "unavailable") {
				toast.error(
					"Your browser blocked saving. Allow site storage and try again.",
				);
				setIsSaving(false);
				return;
			}
			window.location.assign(
				(await hasSession()) ? "/dashboard/templates" : "/dashboard/signup",
			);
		} catch (error) {
			console.error("Failed to save template draft:", error);
			toast.error("Couldn't save your template. Please try again.");
			setIsSaving(false);
		}
	};

	return (
		<Button.Root
			type="button"
			variant="neutral"
			mode="filled"
			size="xsmall"
			disabled={!editor || isSaving}
			onClick={handleSave}
		>
			{isSaving ? (
				"Saving…"
			) : (
				<>
					<span className="sm:hidden">Save</span>
					<span className="hidden sm:inline">Save template</span>
				</>
			)}
		</Button.Root>
	);
}
