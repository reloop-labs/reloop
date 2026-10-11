import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import {
	clearPendingTemplateDraft,
	type PendingTemplateDraft,
	type PendingTemplateVariable,
	readPendingTemplateDraft,
	restorePendingTemplateDraft,
} from "#/features/templates/lib/pending-template-draft";
import { queryKeys } from "#/lib/query-keys";
import type { Template } from "./use-templates-query";

/** Module-level so StrictMode's double effect never claims twice. */
let claimInFlight = false;

function mergeVariables(
	extracted: PendingTemplateVariable[],
	fromEditor: PendingTemplateVariable[],
): PendingTemplateVariable[] {
	const byName = new Map(extracted.map((v) => [v.name, v]));
	for (const variable of fromEditor) byName.set(variable.name, variable);
	return [...byName.values()];
}

async function createTemplateFromDraft(
	draft: PendingTemplateDraft,
): Promise<Template> {
	// Edited in the tool: load the same editor nodes the user saw. Untouched:
	// a single `{ html }` block, which the editor imports on first open and
	// keeps as the source of record.
	const content = draft.content?.length
		? draft.content
		: [{ id: crypto.randomUUID(), type: "html", props: {}, html: draft.html }];
	const createRes = await fetch("/api/template/v1/create", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({
			name: draft.name.trim().slice(0, 255) || "Untitled",
			subject: draft.subject.slice(0, 500) || undefined,
			content,
		}),
	});
	if (!createRes.ok) {
		throw new Error(`Failed to create template (${createRes.status})`);
	}
	const created = (await createRes.json()) as Template & {
		variables?: PendingTemplateVariable[] | null;
	};

	const variables = mergeVariables(created.variables ?? [], draft.variables);

	// Create only takes the basics; preview text and the editor's variable
	// defaults go on with an update.
	const updateRes = await fetch(`/api/template/v1/${created.id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ previewText: draft.previewText, variables }),
	});
	if (!updateRes.ok) {
		// The template exists with its content; missing defaults are not worth
		// failing the hand-off over.
		console.error(
			`Failed to apply draft details to template (${updateRes.status})`,
		);
	}

	// Editor nodes carry no stylesheet, so web fonts would be lost on open.
	// A first draft version keeps the composed HTML (with its font links),
	// which the editor reads fonts from, and refreshes the list thumbnail.
	if (draft.content?.length) {
		const versionRes = await fetch(`/api/template/v1/${created.id}/versions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				name: "Saved from email editor",
				content: draft.content,
				renderedHtml: draft.html,
				subject: draft.subject.slice(0, 500) || undefined,
				previewText: draft.previewText,
				variables,
				isMajor: false,
			}),
		});
		if (!versionRes.ok) {
			console.error(
				`Failed to save first template version (${versionRes.status})`,
			);
		}
	}

	return created;
}

/**
 * Turns an email saved from the public editor into a template in the active
 * workspace, then opens it. Runs on any dashboard page, so the hand-off
 * survives sign-up, verification, and onboarding redirects.
 */
export function useClaimPendingTemplateDraft(enabled: boolean) {
	const router = useRouter();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!enabled || claimInFlight) return;
		const draft = readPendingTemplateDraft();
		if (!draft) return;

		claimInFlight = true;
		// Clear before the request so a second tab can't create a duplicate.
		clearPendingTemplateDraft();
		const toastId = toast.loading("Saving your template…");

		void (async () => {
			try {
				const template = await createTemplateFromDraft(draft);
				await queryClient.invalidateQueries({
					queryKey: queryKeys.templates.all,
				});
				toast.success("Your template is saved to Templates.", { id: toastId });
				router.push(`/templates/${template.id}`);
			} catch (error) {
				console.error("Failed to save template from the editor:", error);
				// Put it back so the next dashboard load can retry.
				restorePendingTemplateDraft(draft);
				toast.error("Couldn't save your template. We'll retry on reload.", {
					id: toastId,
				});
			} finally {
				claimInFlight = false;
			}
		})();
	}, [enabled, queryClient, router]);
}
