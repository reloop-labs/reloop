import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import { apiFetch } from "#/features/agent-inbox/lib/api-fetch";
import type { AgentMailbox } from "#/features/agent-inbox/types";

type SelectedMailboxResponse = {
	mailboxId: string | null;
	folder: string | null;
};

const SELECTED_URL = "/api/inbox/v1/mailboxes/selected";

async function fetchSelected(): Promise<SelectedMailboxResponse | null> {
	try {
		const res = await apiFetch(SELECTED_URL);
		if (!res.ok) return null;
		return (await res.json()) as SelectedMailboxResponse;
	} catch {
		return null;
	}
}

async function saveSelected(mailboxId: string, folder: string): Promise<void> {
	try {
		await apiFetch(SELECTED_URL, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ mailboxId, folder }),
		});
	} catch {
		// Persistence is best-effort; inbox stays fully usable without it.
	}
}

/**
 * Persists the user's selected mailbox (+ folder) per user + organization,
 * and restores it when they return with no explicit `mailboxId` in the URL.
 *
 * Organization scoping is enforced server-side (session org), while `orgId`
 * here re-runs the resolution when the user switches organizations
 * (orgs can be shared, so each org remembers its own selection).
 *
 * An explicit, still-valid `mailboxId` in the URL always wins and is
 * (re-)saved; a missing or stale id falls back to the saved selection.
 * The checks are idempotent, so mailbox list refetches and org switches
 * self-heal instead of fighting over the URL.
 */
export function useSelectedMailboxPersistence({
	mailboxes,
	isLoadingMailboxes,
	orgId,
}: {
	mailboxes: AgentMailbox[];
	isLoadingMailboxes: boolean;
	orgId: string | null;
}) {
	const [mailboxIdParam, setMailboxId] = useQueryState(
		"mailboxId",
		parseAsString.withDefault(""),
	);
	const [folderParam, setFolder] = useQueryState(
		"folder",
		parseAsString.withDefault("inbox"),
	);

	const lastSavedRef = useRef("");

	useEffect(() => {
		if (isLoadingMailboxes || mailboxes.length === 0 || !orgId) {
			return;
		}

		const key = `${orgId}|${mailboxIdParam}|${folderParam}`;
		const urlValid =
			!!mailboxIdParam && mailboxes.some((m) => m.id === mailboxIdParam);

		if (urlValid) {
			if (lastSavedRef.current !== key) {
				lastSavedRef.current = key;
				void saveSelected(mailboxIdParam, folderParam);
			}
			return;
		}

		void fetchSelected().then((saved) => {
			if (
				!saved?.mailboxId ||
				!mailboxes.some((m) => m.id === saved.mailboxId)
			) {
				return;
			}
			const savedKey = `${orgId}|${saved.mailboxId}|${saved.folder ?? folderParam}`;
			lastSavedRef.current = savedKey;
			void setMailboxId(saved.mailboxId, { history: "replace" });
			if (saved.folder && saved.folder !== folderParam) {
				void setFolder(saved.folder, { history: "replace" });
			}
		});
	}, [
		isLoadingMailboxes,
		mailboxes,
		orgId,
		mailboxIdParam,
		folderParam,
		setMailboxId,
		setFolder,
	]);
}
