import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface ContactsEmptyStateProps {
	onAddContact?: () => void;
}

export const ContactsEmptyState = ({
	onAddContact,
}: ContactsEmptyStateProps) => {
	useUserOrganization();

	return (
		<div className="flex flex-col items-center justify-center py-16">
			<div className="relative mb-4">
				<Icon name="users" className="h-8 w-8 text-natural-base" />
			</div>
			{/* Content */}
			<div className="flex max-w-md flex-col items-center text-center">
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No contacts yet
				</h3>
				<p className="mb-2 text-sm text-text-sub-600">
					Contacts are the people you send emails to through Reloop.
				</p>
				<p className="mb-6 text-text-soft-400 text-xs">
					Add your first contact to get started.
				</p>

				{/* CTA */}
				<div>
					<Button.Root variant="neutral" size="small" onClick={onAddContact}>
						<Icon name="plus" className="h-4 w-4" />
						Add your first contact
					</Button.Root>
				</div>

				{/* Help link */}
				<a
					href="https://reloop.sh/docs/contacts"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
				>
					<Icon name="book-closed" className="h-3 w-3" />
					Learn more about contacts
				</a>
			</div>
		</div>
	);
};
