import * as Modal from "@reloop/ui/modal";
import { motion } from "framer-motion";
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
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						<div className="relative mb-5 pr-6">
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Edit property
							</Modal.Title>
						</div>

						<EditPropertyForm
							property={property}
							variant="modal"
							onCancel={() => onOpenChange(false)}
							onSuccess={() => {
								onOpenChange(false);
								onEditSuccess?.();
							}}
						/>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
};
