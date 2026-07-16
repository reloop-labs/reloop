import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import {
	type Channel,
	type Contact,
	fetchContact,
	type Group,
	type Property,
} from "./hooks/use-contacts-query";
import { CreateChannelModal } from "./components/channels/create-channel-modal";
import { DeleteChannelModal } from "./components/channels/delete-channel";
import { EditChannelModal } from "./components/channels/edit-channel-modal";
import { AddContactToGroupModal } from "./components/contacts/add-contact-to-group";
import { AddContactModal } from "./components/contacts/add-contact-modal";
import { DeleteContactModal } from "./components/contacts/delete-contact-modal";
import { EditContactModal } from "./components/contacts/edit-contact-modal";
import { CreateGroupModal } from "./components/groups/create-group-modal";
import { DeleteGroupModal } from "./components/groups/delete-group";
import { AddPropertyModal } from "./components/properties/add-property-modal";
import { DeletePropertyModal } from "./components/properties/delete-property-modal";
import { EditPropertyModal } from "./components/properties/edit-property-modal";

export function ContactsModals() {
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	const [id, setId] = useQueryState("id", { history: "replace" });

	const { data: channelsData } = useQuery({
		queryKey: ["contacts", "channels", "for-modals"],
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/channels/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ channels: Channel[] }>;
		},
		enabled: !!modal?.includes("channel"),
	});

	const { data: groupsData } = useQuery({
		queryKey: ["contacts", "groups", "for-modals"],
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/groups/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ groups: Group[] }>;
		},
		enabled: !!modal?.includes("group"),
	});

	const { data: propertiesData } = useQuery({
		queryKey: ["contacts", "properties", "for-modals"],
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/properties/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ properties: Property[] }>;
		},
		enabled: !!modal?.includes("property"),
	});

	const { data: contactData } = useQuery({
		queryKey: ["contacts", "detail", id ?? ""],
		queryFn: () => fetchContact(id as string),
		enabled: !!modal?.includes("contact") && !!id,
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			void setModal(null);
			void setId(null);
		}
	};

	return (
		<>
			<AddContactModal
				open={modal === "add-contact"}
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
				contact={(contactData as Contact) || null}
			/>

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
				contact={(contactData as Contact) || null}
			/>
			<AddContactToGroupModal
				open={modal === "add-contact-to-group"}
				onOpenChange={handleOpenChange}
			/>
		</>
	);
}
