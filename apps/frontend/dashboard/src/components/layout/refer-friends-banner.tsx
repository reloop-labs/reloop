"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";

const DISMISS_KEY = "reloop.refer-friends-banner.dismissed";

interface ReferFriendsBannerProps {
	isCollapsed?: boolean;
	onInvite: () => void;
}

export const ReferFriendsBanner = ({
	isCollapsed = false,
	onInvite,
}: ReferFriendsBannerProps) => {
	const [dismissed, setDismissed] = useState<boolean | null>(null);

	useEffect(() => {
		try {
			setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
		} catch {
			setDismissed(false);
		}
	}, []);

	if (dismissed === null || dismissed) return null;

	if (isCollapsed) {
		return (
			<button
				type="button"
				onClick={onInvite}
				title="Invite friends"
				className="flex size-9 items-center justify-center rounded-xl bg-neutral-alpha-10 text-text-strong-950 transition-colors hover:bg-neutral-alpha-16"
			>
				<Icon name="user-plus" className="size-4" />
			</button>
		);
	}

	return (
		<div
			className={cn(
				"group relative flex w-full items-center gap-2.5 rounded-xl border border-neutral-alpha-16 bg-neutral-alpha-10 px-3 py-2 text-left transition-colors hover:bg-neutral-alpha-16",
			)}
		>
			<button
				type="button"
				onClick={onInvite}
				className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
			>
				<Icon
					name="user-plus"
					className="size-4 shrink-0 text-text-strong-950"
				/>
				<span className="font-medium text-[13px] text-text-strong-950 leading-snug">
					Invite friends to Reloop
				</span>
			</button>
		</div>
	);
};
