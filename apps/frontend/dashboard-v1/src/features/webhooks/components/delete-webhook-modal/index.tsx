import * as Modal from "@reloop/ui/modal";
import { AnimatePresence, motion } from "motion/react";
import { FormView } from "./form-view";
import { SuccessView } from "./success-view";
import type { DeleteWebhookModalProps } from "./types";
import { useDeleteWebhook } from "./use-delete-webhook";

export const DeleteWebhookModal = ({
	webhook,
	onSuccess,
}: DeleteWebhookModalProps) => {
	const {
		deleteId,
		deletedWebhookName,
		lastDeletedWebhookName,
		confirmationName,
		setConfirmationName,
		isDeleting,
		validationPhrase,
		webhookToDelete,
		handleDelete,
		handleCancel,
	} = useDeleteWebhook(webhook, onSuccess);

	const showSuccess =
		!!deletedWebhookName || (!!lastDeletedWebhookName && !deleteId);
	const displayWebhookName = deletedWebhookName || lastDeletedWebhookName;

	return (
		<Modal.Root
			open={!!deleteId || !!deletedWebhookName}
			onOpenChange={(open) => !open && handleCancel()}
		>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md overflow-hidden p-0 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-md">
				<AnimatePresence mode="wait" initial={false}>
					{showSuccess ? (
						<motion.div
							key="success"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
						>
							<SuccessView
								displayWebhookName={displayWebhookName}
								handleCancel={handleCancel}
							/>
						</motion.div>
					) : (
						<motion.div
							key="form"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						>
							<FormView
								webhookToDelete={webhookToDelete}
								validationPhrase={validationPhrase}
								confirmationName={confirmationName}
								setConfirmationName={setConfirmationName}
								isDeleting={isDeleting}
								handleDelete={handleDelete}
								handleCancel={handleCancel}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</Modal.Content>
		</Modal.Root>
	);
};
