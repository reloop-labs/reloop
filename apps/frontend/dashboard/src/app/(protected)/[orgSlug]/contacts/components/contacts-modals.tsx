"use client";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { AddContactModal } from "./add-contact-modal";
import { AddPropertyModal } from "./add-property-modal";
import { CreateGroupModal } from "./create-group-modal";
import { CreateTopicModal } from "./create-topic-modal";
import { DeleteContactModal } from "./delete-contact-modal";
import { DeleteGroupModal } from "./delete-group";
import { DeletePropertyModal } from "./delete-property-modal";
import { DeleteTopicModal } from "./delete-topic";
import { EditContactModal } from "./edit-contact-modal";
import { EditGroupModal } from "./edit-group-modal";
import { EditPropertyModal } from "./edit-property-modal";
import { EditTopicModal } from "./edit-topic-modal";

interface Contact {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: string;
	organizationId: string;
	properties: Record<string, string | number>;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface Group {
	id: string;
	name: string;
}

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

interface ContactsModalsProps {
	topicId?: string;
}

export const ContactsModals = ({ topicId }: ContactsModalsProps) => {
	const [modal, setModal] = useQueryState("modal");
	const [id, setId] = useQueryState("id");

	const { data: topicsData } = useSWR<{ topics: Topic[] }>(
		modal?.includes("topic") ? "/api/contacts/v1/topics/list" : null,
	);
	const { data: groupsData } = useSWR<{ groups: Group[] }>(
		modal?.includes("group") ? "/api/contacts/v1/groups/list" : null,
	);
	const { data: propertiesData } = useSWR<{ properties: Property[] }>(
		modal?.includes("property") ? "/api/contacts/v1/properties/list" : null,
	);
	const { data: contactData } = useSWR<Contact>(
		modal?.includes("contact") && id ? `/api/contacts/retrieve/${id}` : null,
	);

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setModal(null);
			setId(null);
		}
	};

	return (
		<>
			{/* Create Modals */}
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

			{/* Edit Modals */}
			<EditTopicModal
				open={modal === "edit-topic"}
				onOpenChange={handleOpenChange}
				topic={topicsData?.topics?.find((t) => t.id === id) || null}
			/>
			<EditGroupModal
				open={modal === "edit-group"}
				onOpenChange={handleOpenChange}
				group={groupsData?.groups?.find((g) => g.id === id) || null}
			/>
			<EditPropertyModal
				open={modal === "edit-property"}
				onOpenChange={handleOpenChange}
				property={propertiesData?.properties?.find((p) => p.id === id) || null}
			/>
			<EditContactModal
				open={modal === "edit-contact"}
				onOpenChange={handleOpenChange}
				contact={contactData || null}
			/>

			{/* Delete Modals */}
			<DeleteTopicModal topics={topicsData?.topics || []} />
			<DeleteGroupModal
				open={modal === "delete-group"}
				onOpenChange={handleOpenChange}
				group={groupsData?.groups?.find((g) => g.id === id) || null}
			/>
			<DeletePropertyModal
				open={modal === "delete-property"}
				onOpenChange={handleOpenChange}
				property={propertiesData?.properties?.find((p) => p.id === id) || null}
			/>
			<DeleteContactModal
				open={modal === "delete-contact"}
				onOpenChange={handleOpenChange}
				contact={contactData || null}
			/>
		</>
	);
};
