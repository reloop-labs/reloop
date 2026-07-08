"use client";

import { InboxEmptyStateIcon } from "./inbox-empty-state-icon";
import { Mail } from "lucide-react";

export const InboxEmptyState = ({
	title = "It's empty here",
	description = "Choose an email to view details",
	onCompose,
	showComposeAction = true,
}: {
	title?: string;
	description?: string;
	onCompose?: () => void;
	showComposeAction?: boolean;
}) => (
	<div className="flex h-full items-center justify-center">
		<div className="flex flex-col items-center justify-center gap-2 text-center">
			<InboxEmptyStateIcon width={200} height={200} />
			<div className="mt-4">
				<p className="text-lg">{title}</p>
				<p className="text-md text-mail-muted">{description}</p>
				{showComposeAction && onCompose ? (
					<div className="mt-4 grid grid-cols-1 gap-2 xl:grid-cols-2">
						<button
							type="button"
							onClick={onCompose}
							className="inline-flex h-7 cursor-pointer items-center justify-center gap-0.5 overflow-hidden rounded-lg border-none bg-[#313131] px-2 transition-colors hover:bg-[#404040]"
						>
							<Mail className="mr-1 h-3.5 w-3.5 fill-[#959595]" />
							<span className="text-sm leading-none">Send email</span>
						</button>
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
	<div className="flex w-full items-center justify-center py-12">
		<div className="flex flex-col items-center justify-center gap-2 text-center">
			<InboxEmptyStateIcon width={200} height={200} />
			<div className="mt-5">
				<p className="text-lg">It's empty here</p>
				<p className="text-md text-mail-muted">
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
