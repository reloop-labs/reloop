import type { ToolVariable } from "../hooks/use-editor-store";

/**
 * Hand-off from the public editor to the dashboard. The tool and the
 * dashboard share an origin (`/tools/*` and `/dashboard/*`), so the draft
 * waits in localStorage through sign-up, verification, and onboarding, and
 * the dashboard turns it into a template once a workspace is active.
 *
 * Keep in sync with the dashboard's `features/templates/lib/pending-template-draft.ts`.
 */
export const PENDING_TEMPLATE_DRAFT_KEY = "reloop:pending-template-draft";

export interface PendingTemplateDraft {
	version: 1;
	name: string;
	subject: string;
	previewText: string;
	html: string;
	/**
	 * Editor document nodes, set once the canvas has been edited. Both apps
	 * share the same editor schema, so the dashboard loads these as-is;
	 * re-importing composed HTML would lose spacing and button styles.
	 */
	content?: unknown[];
	variables: ToolVariable[];
	createdAt: string;
}

export type SavePendingDraftResult = "saved" | "too-large" | "unavailable";

export function savePendingTemplateDraft(
	draft: Omit<PendingTemplateDraft, "version" | "createdAt">,
): SavePendingDraftResult {
	const value: PendingTemplateDraft = {
		version: 1,
		...draft,
		createdAt: new Date().toISOString(),
	};
	try {
		window.localStorage.setItem(
			PENDING_TEMPLATE_DRAFT_KEY,
			JSON.stringify(value),
		);
		return "saved";
	} catch (error) {
		// Inline (data: URL) images can push the HTML past the storage quota.
		if (error instanceof DOMException && error.name === "QuotaExceededError") {
			return "too-large";
		}
		return "unavailable";
	}
}
