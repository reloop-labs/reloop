"use client";
import type { AudienceStatus } from "@fe/dashboard/utils/audience";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { AddContactModal } from "./add-contact-modal";
import { AddContactToGroupModal } from "./add-contact-to-group";
import { AddContactToChannelModal } from "./add-contact-to-channel-modal";
import { AddPropertyModal } from "../properties/add-property-modal";
import { CreateGroupModal } from "../groups/create-group-modal";
import { CreateChannelModal } from "../channels/create-channel-modal";
import { DeleteContactModal } from "./delete-contact-modal";
import { DeleteGroupModal } from "../groups/delete-group";
import { DeletePropertyModal } from "../properties/delete-property-modal";
import { DeleteChannelModal } from "../channels/delete-channel";
import { EditContactModal } from "./edit-contact-modal";
import { EditPropertyModal } from "../properties/edit-property-modal";
import { EditChannelModal } from "../channels/edit-channel-modal";

interface Contact {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: AudienceStatus;
	organizationId: string;
	properties: Record<string, string | number>;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface Channel {
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
	channelId?: string;
}

export const ContactsModals = ({ channelId }: ContactsModalsProps) => {
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	const [id, setId] = useQueryState("id", { history: "replace" });

	const { data: channelsData } = useSWR<{ channels: Channel[] }>(
		modal?.includes("channel") ? "/api/contacts/v1/channels/list" : null,
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
				channelId={channelId}
			/>
			<AddContactToGroupModal
				open={modal === "add-contact-to-group"}
				onOpenChange={handleOpenChange}
			/>
			<AddContactToChannelModal
				open={modal === "add-contact-to-channel"}
				onOpenChange={handleOpenChange}
			/>
			<AddPropertyModal
				open={modal === "add-property"}
				onOpenChange={handleOpenChange}
			/>
			<CreateChannelModal
				open={modal === "create-channel"}
				onOpenChange={handleOpenChange}
			/>
			<CreateGroupModal
				open={modal === "create-group"}
				onOpenChange={handleOpenChange}
			/>

			{/* Edit Modals */}
			<EditChannelModal
				open={modal === "edit-channel"}
				onOpenChange={handleOpenChange}
				channel={channelsData?.channels?.find((t) => t.id === id) || null}
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
			<DeleteChannelModal channels={channelsData?.channels || []} />
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
