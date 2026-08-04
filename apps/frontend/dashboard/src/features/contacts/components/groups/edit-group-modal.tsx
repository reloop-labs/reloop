import * as Modal from "@reloop/ui/modal";
import { motion } from "framer-motion";
import type { Group } from "#/features/contacts/hooks/use-contacts-query";
import { EditGroupForm } from "./edit-group-form";

interface EditGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group | null;
}

export const EditGroupModal = ({
	open,
	onOpenChange,
	group,
}: EditGroupModalProps) => {
	const handleClose = () => {
		onOpenChange(false);
	};

	if (!group) return null;

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						<Modal.Title className="mb-5 font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Edit group
						</Modal.Title>

						<EditGroupForm
							group={group}
							variant="modal"
							onCancel={handleClose}
							onSuccess={handleClose}
						/>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
};
