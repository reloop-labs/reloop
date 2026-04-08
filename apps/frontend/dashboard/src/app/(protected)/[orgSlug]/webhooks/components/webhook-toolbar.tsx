import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";

interface WebhookToolbarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
}

export const WebhookToolbar = ({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
}: WebhookToolbarProps) => {
	return (
		<div className="flex items-center gap-3 border-stroke-soft-100 border-b p-3 dark:border-stroke-soft-100/50">
			<div className="flex-1">
				<Input.Root
					size="small"
					className="rounded-lg border-stroke-soft-100 bg-bg-surface-0 dark:border-stroke-soft-100/50"
				>
					<Input.Wrapper>
						<Input.Icon as={() => <Icon name="search" className="h-4 w-4" />} />
						<Input.Input
							type="text"
							placeholder="Search endpoints..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div>
				<Select.Root
					size="small"
					value={statusFilter}
					onValueChange={onStatusFilterChange}
				>
					<Select.Trigger className="rounded-lg border-stroke-soft-100 px-3 hover:bg-bg-weak-50 dark:border-stroke-soft-100/50">
						<div className="flex items-center gap-2">
							<Icon name="list-filter" className="h-4 w-4 text-text-sub-600" />
							<span className="font-medium text-sm">Filter</span>
						</div>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All statuses</Select.Item>
						<Select.Item value="active">Active</Select.Item>
						<Select.Item value="paused">Paused</Select.Item>
						<Select.Item value="disabled">Disabled</Select.Item>
						<Select.Item value="failed">Failed</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	);
};
