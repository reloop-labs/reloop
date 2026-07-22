import * as Modal from "@reloop/ui/modal";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import {
	EditContactForm,
	type EditContactFormContact,
} from "./edit-contact-form";

interface EditContactModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contact: EditContactFormContact | null;
}

export const EditContactModal = ({
	open,
	onOpenChange,
	contact,
}: EditContactModalProps) => {
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
							<Modal.Title>Edit Contact</Modal.Title>
						</div>
					</Modal.Header>
					{!contact && open ? (
						<div className="flex h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<Spinner size={32} />
							<p className="text-sm text-text-sub-600">
								Loading contact details...
							</p>
						</div>
					) : contact ? (
						<Modal.Body className="space-y-0">
							<EditContactForm
								contact={contact}
								variant="modal"
								onCancel={() => onOpenChange(false)}
								onSuccess={() => onOpenChange(false)}
							/>
						</Modal.Body>
					) : null}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
