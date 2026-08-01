import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { useMailboxesQuery } from "#/features/emails/hooks/use-emails-query";

interface MailboxSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export const MailboxSelector = ({ value, onChange }: MailboxSelectorProps) => {
	const { data: mailboxesData, isPending: isLoading } = useMailboxesQuery();

	const selectedMailbox = mailboxesData?.find((m) => m.id === value);
	const displayLabel = selectedMailbox
		? selectedMailbox.displayName || selectedMailbox.email
		: "All Mailboxes";

	return (
		<Select
			value={value === "" ? "all" : value}
			onValueChange={(val) => onChange(!val || val === "all" ? "" : val)}
		>
			<SelectTrigger className="w-48">
				<SelectValue placeholder="All Mailboxes">
					<Icon name="inbox" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<span className="min-w-0 truncate">{displayLabel}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-48">
				<SelectItem value="all">
					<Icon name="inbox" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<span className="min-w-0 truncate">All Mailboxes</span>
				</SelectItem>
				{isLoading ? (
					<div className="space-y-1 p-1">
						<Skeleton className="h-8 w-full rounded-lg" />
						<Skeleton className="h-8 w-full rounded-lg" />
					</div>
				) : !mailboxesData?.length ? (
					<div className="px-2.5 py-3 text-center text-text-sub-600 text-xs">
						No mailboxes found
					</div>
				) : (
					mailboxesData.map((mailbox) => (
						<SelectItem key={mailbox.id} value={mailbox.id}>
							<div className="flex min-w-0 flex-col items-start gap-0.5">
								<span className="w-full truncate font-medium text-sm">
									{mailbox.displayName || mailbox.email.split("@")[0]}
								</span>
								<span className="w-full truncate text-[11px] text-text-sub-600">
									{mailbox.email}
								</span>
							</div>
						</SelectItem>
					))
				)}
			</SelectContent>
		</Select>
	);
};
