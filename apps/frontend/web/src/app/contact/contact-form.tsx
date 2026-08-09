"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { contactEmail } from "@reloop/web/lib/site";
import { useEffect, useState } from "react";
import { ContactSupportChat } from "./support-chat";

function LoginPrompt() {
	return (
		<div className="space-y-4 sm:space-y-5">
			<p className="text-[14px] text-text-sub-600 sm:text-[15px] dark:text-white/45">
				Tell us how we can help
			</p>
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 px-5 py-8 text-center sm:px-6 sm:py-10 dark:border-white/[0.08] dark:bg-[#161616]">
				<p className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/45">
					Log in to your Reloop account so we can open live support for you:
				</p>
				<a
					href="/dashboard/login?redirectTo=/contact"
					className={`${Button.buttonVariants({
						variant: "neutral",
						mode: "filled",
					}).root()} mt-5 inline-flex h-10! w-full rounded-full! px-5! font-medium text-sm! sm:mt-6 sm:h-9! sm:w-auto dark:bg-white dark:text-black dark:hover:bg-white/90`}
				>
					Log in
				</a>
			</div>
			<p className="text-[13px] text-text-sub-600 sm:text-[14px] dark:text-white/45">
				Or email us at{" "}
				<a
					href={`mailto:${contactEmail}`}
					className="break-all text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 sm:break-normal dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
				>
					{contactEmail}
				</a>
			</p>
		</div>
	);
}

function LoggedInSupport({ userName }: { userName?: string | null }) {
	return (
		<div className="space-y-4 sm:space-y-5">
			<p className="text-[14px] text-text-sub-600 sm:text-[15px] dark:text-white/45">
				Tell us how we can help
			</p>
			<ContactSupportChat userName={userName} />
			<p className="text-[13px] text-text-sub-600 sm:text-[14px] dark:text-white/45">
				Or email us at{" "}
				<a
					href={`mailto:${contactEmail}`}
					className="break-all text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 sm:break-normal dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
				>
					{contactEmail}
				</a>
			</p>
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
			<div className="h-[min(520px,calc(100dvh-12rem))] min-h-[360px] w-full animate-pulse rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/[0.08] dark:bg-[#161616]" />
		);
	}

	return session ? (
		<LoggedInSupport userName={session.user?.name} />
	) : (
		<LoginPrompt />
	);
}

export function ContactPanel() {
	return <ContactChatPanel />;
}
