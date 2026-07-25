import * as Modal from "@reloop/ui/modal";
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
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<div className="p-6">
					<div className="relative mb-5 pr-6">
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Edit contact
						</Modal.Title>
						<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
							Update this contact&apos;s details, groups, and email preferences.
						</p>
					</div>

					{!contact && open ? (
						<div className="flex h-[280px] flex-col items-center justify-center space-y-4 text-center">
							<Spinner size={32} />
							<p className="text-sm text-text-sub-600">
								Loading contact details...
							</p>
						</div>
					) : contact ? (
						<EditContactForm
							contact={contact}
							variant="modal"
							onCancel={() => onOpenChange(false)}
							onSuccess={() => onOpenChange(false)}
						/>
					) : null}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
