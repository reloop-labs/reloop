import * as Modal from "@reloop/ui/modal";
import { EditPropertyForm } from "./edit-property-form";

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface EditPropertyModalProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditSuccess?: () => void;
	title?: string;
	nameLabel?: string;
}

export const EditPropertyModal = ({
	property,
	open,
	onOpenChange,
	onEditSuccess,
	title = "Edit property",
	nameLabel = "Property name",
}: EditPropertyModalProps) => {
	if (!property) return null;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<EditPropertyForm
					property={property}
					variant="modal"
					title={title}
					nameLabel={nameLabel}
					onCancel={() => onOpenChange(false)}
					onSuccess={() => {
						onOpenChange(false);
						onEditSuccess?.();
					}}
				/>
			</Modal.Content>
		</Modal.Root>
	);
};
