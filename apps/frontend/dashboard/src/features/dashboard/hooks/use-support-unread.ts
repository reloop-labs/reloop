import { useSupportSocket } from "#/features/dashboard/hooks/use-support-socket";
import type { SupportServerEvent } from "#/lib/support-types";
import { queryKeys } from "#/lib/query-keys";
import { useUIStore } from "#/store/use-ui-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect } from "react";

async function fetchUnreadCount() {
	const { data } = await axios.get<{ count: number }>(
		"/api/admin/v1/support/unread-count",
		{ withCredentials: true },
	);
	return data.count;
}

/** Imperative clear for support chat panel (sets cache to 0). */
export function clearSupportUnreadInCache(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	queryClient.setQueryData(queryKeys.support.unreadCount(), 0);
}

export function useSupportUnread() {
	const queryClient = useQueryClient();
	const { isAiPanelOpen, aiPanelActiveTab } = useUIStore();
	// Ask AI is currently disabled — panel is support-only, but keep the
	// tab check so re-enabling AI does not mark support as "open" incorrectly.
	const supportOpen = isAiPanelOpen && aiPanelActiveTab === "support";

	const { data: count = 0, refetch: mutateUnread } = useQuery({
		queryKey: queryKeys.support.unreadCount(),
		queryFn: fetchUnreadCount,
		refetchInterval: 30_000,
		refetchOnWindowFocus: true,
	});

	const clearUnread = useCallback(() => {
		clearSupportUnreadInCache(queryClient);
	}, [queryClient]);

	const onEvent = useCallback(
		(event: SupportServerEvent) => {
			if (
				event.type === "message_created" ||
				event.type === "conversation_updated"
			) {
				void mutateUnread();
			}
		},
		[mutateUnread],
	);

	// Keep a lightweight WS connection for live badge updates while logged in
	useSupportSocket({
		enabled: true,
		onEvent,
	});

	useEffect(() => {
		if (!supportOpen) return;
		void mutateUnread();
	}, [supportOpen, mutateUnread]);

	return {
		unreadCount: count,
		mutateUnread,
		clearUnread,
	};
}
