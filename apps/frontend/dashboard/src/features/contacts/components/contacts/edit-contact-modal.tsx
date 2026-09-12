import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { X } from "lucide-react";
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
			{/* Transparent shell — the card itself (same nested gray/white layout as
			    CreateApiKeyModal) is rendered by EditContactForm. */}
			<Modal.Content
				className="border-0 bg-transparent p-0 shadow-none sm:max-w-[520px]"
				showClose={false}
			>
				{!contact && open ? (
					<div className="w-full font-sans">
						<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
							<div className="relative m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
								<div className="flex items-start justify-between gap-4 px-6">
									<div className="flex items-center gap-2">
										<Icon
											name="user"
											className="size-4 text-text-sub-600 dark:text-white/60"
										/>
										<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
											Edit contact
										</Modal.Title>
									</div>
									<button
										type="button"
										onClick={() => onOpenChange(false)}
										aria-label="Close"
										className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
									>
										<X className="size-3.5" strokeWidth={2.25} />
									</button>
								</div>
								<div className="flex h-[280px] flex-col items-center justify-center space-y-4 px-6 pb-6 text-center">
									<Spinner size={32} />
									<p className="text-sm text-text-sub-600">
										Loading contact details...
									</p>
								</div>
							</div>
							<div className="px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40" />
						</div>
					</div>
				) : contact ? (
					<EditContactForm
						contact={contact}
						variant="modal"
						onCancel={() => onOpenChange(false)}
						onSuccess={() => onOpenChange(false)}
					/>
				) : null}
			</Modal.Content>
		</Modal.Root>
	);
};
