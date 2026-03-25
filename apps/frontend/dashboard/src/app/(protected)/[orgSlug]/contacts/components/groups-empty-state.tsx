"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface GroupsEmptyStateProps {
	onAddGroup?: () => void;
}

export const GroupsEmptyState = ({ onAddGroup }: GroupsEmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-12 text-center">
			<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-weak-50">
				<Icon name="modules" className="h-6 w-6 text-text-sub-600" />
			</div>
			<h3 className="mb-1 font-semibold text-lg text-text-strong-950">
				No groups yet
			</h3>
			<p className="mb-6 max-w-[280px] font-normal text-sm text-text-sub-600">
				Create a group to organize your contacts more effectively.
			</p>
			<Button.Root
				variant="neutral"
				size="xsmall"
				onClick={onAddGroup}
				className="gap-2"
			>
				<Icon name="plus" className="h-4 w-4" />
				Create Your First Group
				<span className="inline-flex items-center gap-0.5">
					<Icon
						name="command"
						className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
					/>
					<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
						A
					</span>
				</span>
			</Button.Root>
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
	);
};
