"use client";

import { authClient } from "@reloop/auth/client";
import { useEffect, useState } from "react";
import { ContactSupportChat, FoundersAvatarStack } from "./support-chat";

function LoginPromptCard() {
	return (
		<div className="relative flex h-full min-h-[360px] w-full flex-col overflow-hidden rounded-2xl bg-bg-white-0 text-text-strong-950 dark:bg-[#0c0c0c] dark:text-white">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between gap-3 border-stroke-soft-200 border-b bg-bg-weak-50/50 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="flex min-w-0 items-center gap-3">
					<FoundersAvatarStack />
					<div className="min-w-0">
						<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
							The Founders
						</h2>
						<p className="truncate text-[11px] text-text-sub-600 dark:text-white/45">
							Pranav · Twinkal · replies in ~2 mins
						</p>
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="flex flex-1 flex-col justify-between px-4 py-4">
				<div className="flex w-full flex-col items-start">
					<div className="max-w-[90%] rounded-2xl rounded-tl-xs border border-stroke-soft-200/80 bg-bg-weak-50 px-4 py-3 text-[14px] text-text-strong-950 leading-relaxed dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
						<p className="whitespace-pre-wrap break-words">
							Hey — this goes straight to the founders&apos; inboxes. Log in to
							your Reloop account so we can open live support for you.
						</p>
					</div>
					<p className="mt-1 ml-1 font-mono text-[11px] text-text-soft-400 dark:text-white/35">
						The founders
					</p>
				</div>

				<div className="mt-6">
					<a
						href="/dashboard/login?redirectTo=/contact"
						className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-text-strong-950 font-medium text-sm text-white transition-all hover:bg-text-strong-950/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
					>
						Log in to start chat
					</a>
				</div>
			</div>
		</div>
	);
}

function ContactChatPanel() {
	const { useSession } = authClient;
	const { data: session, isPending } = useSession();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || isPending) {
		return (
			<div className="h-full min-h-[360px] w-full animate-pulse rounded-2xl bg-bg-white-0 dark:bg-[#161616]" />
		);
	}

	return session ? (
		<ContactSupportChat userName={session.user?.name} />
	) : (
		<LoginPromptCard />
	);
}

export function ContactPanel() {
	return <ContactChatPanel />;
}
