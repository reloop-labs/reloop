"use client";

import { useQueryState } from "nuqs";
import { AddContactModal } from "./add-contact-modal";
import { AddPropertyModal } from "./add-property-modal";
import { CreateGroupModal } from "./create-group-modal";
import { CreateTopicModal } from "./create-topic-modal";

interface ContactsModalsProps {
	topicId?: string;
}

export const ContactsModals = ({ topicId }: ContactsModalsProps) => {
	const [modal, setModal] = useQueryState("modal");

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setModal(null);
		}
	};

	return (
		<>
			<AddContactModal
				open={modal === "add-contact"}
				onOpenChange={handleOpenChange}
				topicId={topicId}
			/>
			<AddPropertyModal
				open={modal === "add-property"}
				onOpenChange={handleOpenChange}
			/>
			<CreateTopicModal
				open={modal === "create-topic"}
				onOpenChange={handleOpenChange}
			/>
			<CreateGroupModal
				open={modal === "create-group"}
				onOpenChange={handleOpenChange}
			/>
		</>
	);
};
