import { InboxEmptyStateIcon } from "./inbox-empty-state-icon";
import { InboxListEmptyIcon } from "./inbox-list-empty-icon";

export const InboxEmptyState = ({
	title = "It's empty here",
	description = "Choose an email to view details",
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
				<p className="font-medium text-mail-foreground text-xl tracking-tight">
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
