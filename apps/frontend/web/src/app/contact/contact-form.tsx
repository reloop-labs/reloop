"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import {
	CHATWOOT_BASE_URL,
	CHATWOOT_WEBSITE_TOKEN,
} from "@reloop/ui/chatwoot-loader";
import {
	ChatwootLoader,
	ChatwootUserSync,
} from "@reloop/web/components/chatwoot-widget";
import { contactEmail } from "@reloop/web/lib/site";
import Link from "next/link";
import { useEffect, useState } from "react";

const chatwootWidgetUrl = `${CHATWOOT_BASE_URL.replace(/\/+$/, "")}/widget?website_token=${CHATWOOT_WEBSITE_TOKEN.trim()}&locale=en`;

const chatFrameClassName =
	"h-[min(480px,calc(100dvh-16rem))] min-h-[360px] w-full border-none bg-bg-white-0 sm:min-h-[420px] dark:bg-[#161616]";

const chatFrameShellClassName =
	"h-[min(480px,calc(100dvh-16rem))] min-h-[360px] w-full sm:min-h-[420px]";

function LoginPrompt() {
	return (
		<div className="space-y-4 sm:space-y-5">
			<p className="text-[14px] text-text-sub-600 sm:text-[15px] dark:text-white/45">
				Tell us how we can help
			</p>
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 px-5 py-8 text-center sm:px-6 sm:py-10 dark:border-white/[0.08] dark:bg-[#161616]">
				<p className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/45">
					Log in to your Reloop account so we can help you faster:
				</p>
				<Link
					href="/dashboard/login"
					className={`${Button.buttonVariants({
						variant: "neutral",
						mode: "filled",
					}).root()} mt-5 inline-flex h-10! w-full rounded-full! px-5! font-medium text-sm! sm:mt-6 sm:h-9! sm:w-auto dark:bg-white dark:text-black dark:hover:bg-white/90`}
				>
					Log in
				</Link>
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

function LoggedInChat() {
	return (
		<>
			<ChatwootLoader />
			<ChatwootUserSync />
			<div className="space-y-4 sm:space-y-5">
				<div>
					<h2 className="font-medium text-[14px] text-text-strong-950 sm:text-[15px] dark:text-white">
						Tell us how we can help
					</h2>
					<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/45">
						Start a live chat with our team. We typically reply within 10 to 15
						minutes.
					</p>
				</div>

				<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/[0.08] dark:bg-[#161616]">
					<iframe
						src={chatwootWidgetUrl}
						className={chatFrameClassName}
						title="Support live chat"
					/>
				</div>

				<p className="text-[12px] text-text-sub-600 sm:text-[13px] dark:text-white/45">
					You can also email us at{" "}
					<a
						href={`mailto:${contactEmail}`}
						className="break-all text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 sm:break-normal dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
					>
						{contactEmail}
					</a>
				</p>
			</div>
		</>
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
			<div
				className={`${chatFrameShellClassName} animate-pulse rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/[0.08] dark:bg-[#161616]`}
			/>
		);
	}

	return session ? <LoggedInChat /> : <LoginPrompt />;
}

export function ContactPanel() {
	return <ContactChatPanel />;
}
