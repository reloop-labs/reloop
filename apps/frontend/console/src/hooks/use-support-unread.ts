"use client";

import { useSupportSocket } from "@fe/console/hooks/use-support-socket";
import { adminGet } from "@fe/console/lib/admin-api";
import type { SupportServerEvent } from "@fe/console/lib/support-types";
import { useCallback } from "react";
import useSWR from "swr";

export const SUPPORT_UNREAD_KEY = "/support/unread-count";

export function useSupportUnread() {
	const { data: count = 0, mutate } = useSWR(
		SUPPORT_UNREAD_KEY,
		() => adminGet<{ count: number }>(SUPPORT_UNREAD_KEY).then((d) => d.count),
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
				void mutate();
			}
		},
		[mutate],
	);

	useSupportSocket({
		enabled: true,
		onEvent,
	});

	return { unreadCount: count, mutateUnread: mutate };
}
