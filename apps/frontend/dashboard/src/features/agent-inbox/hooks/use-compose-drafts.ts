import { useSWR } from "#/features/agent-inbox/lib/use-swr-compat";
import { parseComposeDraftsList } from "#/features/agent-inbox/utils/parse-compose-drafts";
import type { ComposeDraft } from "#/features/agent-inbox/types";
import { useMemo } from "react";

function draftsUrl(mailboxId: string) {
	return `/api/inbox/v1/drafts?mailboxId=${encodeURIComponent(mailboxId)}`;
}

/**
 * Live compose-draft list for a mailbox (sidebar badge + Drafts folder).
 */
export function useComposeDrafts(mailboxId: string | undefined): {
	drafts: ComposeDraft[];
	count: number;
	isLoading: boolean;
	refresh: () => Promise<void>;
} {
	const key = mailboxId ? draftsUrl(mailboxId) : null;
	const { data, isLoading, mutate } = useSWR<unknown>(key, {
		revalidateOnFocus: true,
	});

	const drafts = useMemo(() => parseComposeDraftsList(data), [data]);

	return {
		drafts,
		count: drafts.length,
		isLoading: !!mailboxId && isLoading,
		refresh: async () => {
			await mutate();
		},
	};
}
