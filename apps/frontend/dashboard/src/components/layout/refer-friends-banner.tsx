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

	const dismiss = (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			localStorage.setItem(DISMISS_KEY, "true");
		} catch {}
		setDismissed(true);
	};

	if (dismissed === null || dismissed) return null;

	if (isCollapsed) {
		return (
			<button
				type="button"
				onClick={onInvite}
				title="Invite friends"
				className="flex size-9 items-center justify-center rounded-xl bg-primary-alpha-10 text-primary-base transition-colors hover:bg-primary-alpha-16"
			>
				<Icon name="gift" className="size-4" />
			</button>
		);
	}

	return (
		<div
			className={cn(
				"group relative flex w-full items-start gap-2.5 rounded-xl border border-primary-alpha-16 bg-primary-alpha-10 px-3 py-2.5 text-left transition-colors hover:bg-primary-alpha-16",
			)}
		>
			<button
				type="button"
				onClick={onInvite}
				className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
			>
				<Icon
					name="gift"
					className="mt-0.5 size-4 shrink-0 text-primary-base"
				/>
				<span className="text-[13px] text-primary-base leading-snug">
					Refer friends, earn up to 5000 credits each
				</span>
			</button>
			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss"
				className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-primary-base/50 transition-colors hover:text-primary-base"
			>
				<Icon name="cross" className="size-3" />
			</button>
		</div>
	);
};
