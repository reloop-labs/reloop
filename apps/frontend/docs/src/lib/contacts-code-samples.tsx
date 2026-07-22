"use client";

import { createChannelXCodeSamples } from "../../../../backend/contacts/src/routes/channel/create-channel/create-channel.x-codeSamples";
import { deleteChannelXCodeSamples } from "../../../../backend/contacts/src/routes/channel/delete-channel/delete-channel.x-codeSamples";
import { updateChannelXCodeSamples } from "../../../../backend/contacts/src/routes/channel/update-channel/update-channel.x-codeSamples";
import { addContactToGroupXCodeSamples } from "../../../../backend/contacts/src/routes/contact/add-contact-to-group/add-contact-to-group.x-codeSamples";
import { createContactXCodeSamples } from "../../../../backend/contacts/src/routes/contact/create-contact/create-contact.x-codeSamples";
import { deleteContactXCodeSamples } from "../../../../backend/contacts/src/routes/contact/delete-contact/delete-contact.x-codeSamples";
import { getContactXCodeSamples } from "../../../../backend/contacts/src/routes/contact/get-contact/get-contact.x-codeSamples";
import { listContactsXCodeSamples } from "../../../../backend/contacts/src/routes/contact/list-contacts/list-contacts.x-codeSamples";
import { removeContactFromGroupXCodeSamples } from "../../../../backend/contacts/src/routes/contact/remove-contact-from-group/remove-contact-from-group.x-codeSamples";
import { updateContactXCodeSamples } from "../../../../backend/contacts/src/routes/contact/update-contact/update-contact.x-codeSamples";
import { createGroupXCodeSamples } from "../../../../backend/contacts/src/routes/group/create-group/create-group.x-codeSamples";
import { deleteGroupXCodeSamples } from "../../../../backend/contacts/src/routes/group/delete-group/delete-group.x-codeSamples";
import { getGroupXCodeSamples } from "../../../../backend/contacts/src/routes/group/get-group/get-group.x-codeSamples";
import { listGroupsXCodeSamples } from "../../../../backend/contacts/src/routes/group/list-groups/list-groups.x-codeSamples";
import { updateGroupXCodeSamples } from "../../../../backend/contacts/src/routes/group/update-group/update-group.x-codeSamples";
import { createPropertyXCodeSamples } from "../../../../backend/contacts/src/routes/property/create-property/create-property.x-codeSamples";
import { deletePropertyXCodeSamples } from "../../../../backend/contacts/src/routes/property/delete-property/delete-property.x-codeSamples";
import { listPropertiesXCodeSamples } from "../../../../backend/contacts/src/routes/property/list-properties/list-properties.x-codeSamples";
import { updatePropertyXCodeSamples } from "../../../../backend/contacts/src/routes/property/update-property/update-property.x-codeSamples";
import type { LearnCodeSample } from "../components/mdx/CodeSamples";
import { CodeSamples } from "../components/mdx/CodeSamples";

const registry = {
	"contacts.create": createContactXCodeSamples,
	"contacts.list": listContactsXCodeSamples,
	"contacts.get": getContactXCodeSamples,
	"contacts.update": updateContactXCodeSamples,
	"contacts.delete": deleteContactXCodeSamples,
	"contacts.properties.create": createPropertyXCodeSamples,
	"contacts.properties.list": listPropertiesXCodeSamples,
	"contacts.properties.update": updatePropertyXCodeSamples,
	"contacts.properties.delete": deletePropertyXCodeSamples,
	"contacts.groups.create": createGroupXCodeSamples,
	"contacts.groups.list": listGroupsXCodeSamples,
	"contacts.groups.get": getGroupXCodeSamples,
	"contacts.groups.update": updateGroupXCodeSamples,
	"contacts.groups.delete": deleteGroupXCodeSamples,
	"contacts.groups.addMember": addContactToGroupXCodeSamples,
	"contacts.groups.removeMember": removeContactFromGroupXCodeSamples,
	"contacts.channels.create": createChannelXCodeSamples,
	"contacts.channels.update": updateChannelXCodeSamples,
	"contacts.channels.delete": deleteChannelXCodeSamples,
} as const satisfies Record<string, LearnCodeSample[]>;

export type ContactsCodeSampleId = keyof typeof registry;

export function ContactsCodeSamples({ id }: { id: ContactsCodeSampleId }) {
	return <CodeSamples samples={registry[id]} />;
}
