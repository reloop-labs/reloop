import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateClick?: () => void;
}

export const EmptyState = ({ onCreateClick }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center py-16">
			<div className="relative mb-4">
				<Icon
					name="notification-indicator"
					className="h-8 w-8 text-natural-base"
				/>
			</div>
			<div className="flex max-w-md flex-col items-center text-center">
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No topics yet
				</h3>
				<p className="mb-4 max-w-[250px] text-sm text-text-sub-600">
					Topics help you organize contacts by interest, preference, or
					category.
				</p>
				<Button.Root variant="neutral" size="small" onClick={onCreateClick}>
					<Icon name="plus" className="h-4 w-4" />
					Create your first topic
				</Button.Root>

				<a
					href="https://reloop.sh/docs/topics"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
				>
					<Icon name="book-closed" className="h-3 w-3" />
					Learn more about topics
				</a>
			</div>
		</div>
	);
};
