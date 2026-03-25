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
			<Button.Root variant="neutral" size="xsmall" onClick={onAddGroup}>
				<Icon name="plus" className="h-4 w-4" />
				Add group
			</Button.Root>
		</div>
	);
};
