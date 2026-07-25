import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmailsEmptyStateProps {
	title?: string;
	description?: string;
	isFiltered?: boolean;
	onClearFilters?: () => void;
	/** "sent" (default) or "received" — tweaks empty copy when not filtered */
	variant?: "sent" | "received";
}

export const EmailsEmptyState = ({
	title,
	description,
	isFiltered = false,
	onClearFilters,
	variant = "sent",
}: EmailsEmptyStateProps) => {
	const defaultTitle = isFiltered
		? "No emails found"
		: variant === "received"
			? "No received emails yet"
			: "No sent emails yet";
	const defaultDescription = isFiltered
		? "Try adjusting your search or filters."
		: variant === "received"
			? "Inbound mail to your agent addresses will show up here."
			: "Send transactional email via the API or SMTP to see delivery activity here.";

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon
					name={
						isFiltered
							? "search"
							: variant === "received"
								? "mail-receive"
								: "mail-send"
					}
					className="h-8 w-8 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{title || defaultTitle}
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{description || defaultDescription}
			</p>
			{isFiltered && onClearFilters ? (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={onClearFilters}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="cross-circle" className="h-4 w-4 text-text-sub-600" />
					Clear filters
				</Button.Root>
			) : null}
		</div>
	);
};
