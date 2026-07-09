"use client";

import { Mail } from "lucide-react";
import { AiSidebarToggle } from "./ai-sidebar";
import { InboxEmptyStateIcon } from "./inbox-empty-state-icon";
import { InboxListEmptyIcon } from "./inbox-list-empty-icon";

export const InboxEmptyState = ({
	title = "It's empty here",
	description = "Choose an email to view details",
	onCompose,
	onOpenAi,
	showComposeAction = true,
}: {
	title?: string;
	description?: string;
	onCompose?: () => void;
	onOpenAi?: () => void;
	showComposeAction?: boolean;
}) => (
	<div className="flex h-full w-full items-center justify-center">
		<div className="flex flex-col items-center justify-center text-center">
			<InboxEmptyStateIcon width={140} height={152} />
			<div className="mt-2">
				<p className="font-medium text-mail-foreground text-xl tracking-tight">
					{title}
				</p>
				<p className="mt-1 text-mail-muted text-sm dark:text-white/50">
					{description}
				</p>
				{(showComposeAction && onCompose) || onOpenAi ? (
					<div className="mt-4 grid grid-cols-1 gap-2 xl:grid-cols-2">
						{onOpenAi ? <AiSidebarToggle onClick={onOpenAi} /> : null}
						{showComposeAction && onCompose ? (
							<button
								type="button"
								onClick={onCompose}
								className="inline-flex h-7 cursor-pointer items-center justify-center gap-0.5 overflow-hidden rounded-lg border-none bg-[var(--inbox-control)] px-2 transition-colors hover:bg-[var(--inbox-control-hover)]"
							>
								<Mail className="mr-1 h-3.5 w-3.5 fill-[#959595]" />
								<span className="text-sm leading-none">Send email</span>
							</button>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	</div>
);

export const InboxListEmptyState = ({
	hasFilters,
	onClearFilters,
}: {
	hasFilters?: boolean;
	onClearFilters?: () => void;
}) => (
	<div className="flex h-full w-full items-center justify-center">
		<div className="flex flex-col items-center justify-center text-center">
			<InboxListEmptyIcon
				width={96}
				height={96}
				className="text-mail-muted opacity-80"
			/>
			<div className="mt-1">
				<p className="font-mediumimage.png text-mail-foreground text-xl tracking-tight">
					It's empty here
				</p>
				<p className="mt-1 text-mail-muted text-sm dark:text-white/50">
					{hasFilters ? (
						<>
							Search for another email or{" "}
							<button
								type="button"
								className="cursor-pointer underline"
								onClick={onClearFilters}
							>
								clear filters
							</button>
						</>
					) : (
						"No messages in this folder"
					)}
				</p>
			</div>
		</div>
	</div>
);
