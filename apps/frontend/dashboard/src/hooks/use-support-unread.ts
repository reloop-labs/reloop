"use client";

import { useSupportSocket } from "@fe/dashboard/hooks/use-support-socket";
import type { SupportServerEvent } from "@fe/dashboard/lib/support-types";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import axios from "axios";
import { useCallback, useEffect } from "react";
import useSWR, { mutate } from "swr";

export const SUPPORT_UNREAD_KEY = "/api/admin/v1/support/unread-count";

async function fetchUnreadCount() {
	const { data } = await axios.get<{ count: number }>(SUPPORT_UNREAD_KEY, {
		withCredentials: true,
	});
	return data.count;
}

export function clearSupportUnreadCache() {
	return mutate(SUPPORT_UNREAD_KEY, 0, { revalidate: false });
}

export function useSupportUnread() {
	const { isAiPanelOpen, aiPanelActiveTab } = useUIStore();
	const supportOpen = isAiPanelOpen && aiPanelActiveTab === "support";

	const { data: count = 0, mutate: mutateUnread } = useSWR(
		SUPPORT_UNREAD_KEY,
		fetchUnreadCount,
		{
			refreshInterval: 30_000,
			revalidateOnFocus: true,
		},
	);

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
		// When support tab is open, refresh unread (panel will mark read)
		void mutateUnread();
	}, [supportOpen, mutateUnread]);

	return {
		unreadCount: count,
		mutateUnread,
		clearUnread: () => clearSupportUnreadCache(),
	};
}
