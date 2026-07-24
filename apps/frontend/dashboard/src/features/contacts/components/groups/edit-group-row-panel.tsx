import type { Group } from "#/features/contacts/hooks/use-contacts-query";
import { EditGroupForm } from "./edit-group-form";

interface EditGroupRowPanelProps {
	group: Group;
	onClose: () => void;
}

export function EditGroupRowPanel({ group, onClose }: EditGroupRowPanelProps) {
	return (
		<div
			className="border-stroke-soft-100 border-t bg-bg-weak-50/40 px-4 py-4 dark:bg-bg-weak-50/20"
			onClick={(e) => e.stopPropagation()}
		>
			<EditGroupForm
				group={group}
				variant="inline"
				onCancel={onClose}
				onSuccess={onClose}
			/>
		</div>
	);
}
