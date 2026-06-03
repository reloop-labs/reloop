"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

export const AgentMailboxNotFound = () => (
	<div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:px-8">
		<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
			<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
		</div>
		<h2 className="mb-2 font-semibold text-text-strong-950 text-xl">
			Agent address not found
		</h2>
		<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
			This inbox does not exist or may have been removed.
		</p>
		<Link
			href="/agent-inbox"
			className={Button.buttonVariants({ variant: "neutral", size: "xsmall" }).root()}
		>
			<Icon name="arrow-left" className="h-4 w-4" />
			Back to all addresses
		</Link>
	</div>
);
