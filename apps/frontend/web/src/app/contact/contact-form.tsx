"use client";

import { authClient } from "@reloop/auth/client";
import * as FancyButton from "@reloop/ui/fancy-button";
import { useEffect, useState } from "react";
import { ContactSupportChat, SupportChatHeader } from "./support-chat";

function LoginPromptCard({
	user,
}: {
	user?: { name?: string | null; image?: string | null; email?: string | null } | null;
}) {
	return (
		<div className="relative flex h-full min-h-[360px] w-full flex-col overflow-hidden text-text-strong-950 dark:text-white">
			{/* Header */}
			<SupportChatHeader user={user} />

			{/* Body */}
			<div className="flex flex-1 flex-col justify-between px-4 pt-4 pb-4 sm:px-6 sm:pb-6">
				<div className="flex w-full flex-col items-start">
					<div className="max-w-[90%] rounded-2xl rounded-tl-xs border border-stroke-soft-200/80 bg-bg-white-0 px-4 py-3 text-[14px] text-text-strong-950 leading-relaxed dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
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
					<FancyButton.Root
						asChild
						variant="neutral"
						size="medium"
						className="w-full! h-11! rounded-xl!"
					>
						<a href="/dashboard/login?redirectTo=/contact">
							Log in to start chat
						</a>
					</FancyButton.Root>
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
			<div className="h-full min-h-[360px] w-full animate-pulse bg-bg-weak-50/50 dark:bg-white/[0.02]" />
		);
	}

	return session ? (
		<ContactSupportChat user={session.user} />
	) : (
		<LoginPromptCard user={null} />
	);
}

export function ContactPanel() {
	return <ContactChatPanel />;
}
