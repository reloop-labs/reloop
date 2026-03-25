"use client";
import * as Button from "@reloop/ui/button";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";

interface Group {
	id: string;
	name: string;
}

interface GroupDropdownProps {
	group: Group;
	onEdit: (contact_group_id: string) => void;
	onDelete: (contact_group_id: string) => void;
	onOpenChange?: (open: boolean) => void;
}

export const GroupDropdown = ({
	group,
	onEdit,
	onDelete,
	onOpenChange,
}: GroupDropdownProps) => {
	return (
		<Dropdown.Root onOpenChange={onOpenChange}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xsmall"
					className="h-8 w-8 p-0"
				>
					<Icon name="dots-horizontal" className="h-4 w-4" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="end" className="w-40">
				<Dropdown.Item onClick={() => onEdit(group.id)}>
					<Icon name="edit" className="mr-2 h-4 w-4" />
					Edit
				</Dropdown.Item>
				<Dropdown.Item
					onClick={() => onDelete(group.id)}
					className="text-error-base focus:text-error-base"
				>
					<Icon name="trash" className="mr-2 h-4 w-4" />
					Delete
				</Dropdown.Item>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
