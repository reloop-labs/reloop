import * as Modal from "@reloop/ui/modal";
import { Icon } from "@reloop/ui/icon";
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
}

export const EditPropertyModal = ({
	property,
	open,
	onOpenChange,
	onEditSuccess,
}: EditPropertyModalProps) => {
	if (!property) return null;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="edit-2" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title className="font-medium">Edit Property</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body>
						<EditPropertyForm
							property={property}
							variant="modal"
							onCancel={() => onOpenChange(false)}
							onSuccess={() => {
								onOpenChange(false);
								onEditSuccess?.();
							}}
						/>
					</Modal.Body>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
