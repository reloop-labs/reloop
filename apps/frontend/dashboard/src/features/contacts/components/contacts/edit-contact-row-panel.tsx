import { fetchContact } from "#/features/contacts/hooks/use-contacts-query";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { EditContactForm } from "./edit-contact-form";

interface EditContactRowPanelProps {
	contactId: string;
	onClose: () => void;
}

export function EditContactRowPanel({
	contactId,
	onClose,
}: EditContactRowPanelProps) {
	const { data: contact, isPending, isError } = useQuery({
		queryKey: ["contacts", "detail", contactId],
		queryFn: () => fetchContact(contactId),
	});

	return (
		<div
			className="border-stroke-soft-100 border-t bg-bg-weak-50/40 px-4 py-4 dark:bg-bg-weak-50/20"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="rounded-2xl border border-stroke-soft-100/80 bg-bg-white-0 p-4 shadow-regular-xs dark:border-stroke-soft-100/40">
				<AnimatePresence mode="wait" initial={false}>
					{isPending ? (
						<motion.div
							key="loading"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="flex items-center justify-center gap-2 py-8 text-paragraph-sm text-text-sub-600"
						>
							<Spinner size={20} />
							Loading contact details...
						</motion.div>
					) : isError || !contact ? (
						<motion.div
							key="error"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="py-6 text-center text-paragraph-sm text-error-base"
						>
							Failed to load contact details.
						</motion.div>
					) : (
						<motion.div
							key="form"
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 4 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<EditContactForm
								contact={contact}
								variant="inline"
								onCancel={onClose}
								onSuccess={onClose}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
