"use client";

import { MailListSpinner } from "./mail-skeleton";

/**
 * Mailbox bootstrap loading — Zero uses a centered spinner, not a fake
 * split-pane skeleton that no longer matches the inbox shell.
 */
export const AgentInboxSkeleton = () => {
	return (
		<div className="flex h-full min-h-0 w-full items-center justify-center bg-sidebar">
			<div className="mb-1 flex h-[calc(100dvh-8px)] w-full max-w-none flex-col items-center justify-center rounded-2xl bg-panel-light shadow-sm md:mx-0.5 md:mt-1 dark:bg-panel-dark">
				<MailListSpinner className="h-auto" />
			</div>
		</div>
	);
};
