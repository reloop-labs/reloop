"use client";

import {
	addContactToChannelXCodeSamples,
	addContactToGroupXCodeSamples,
	createChannelXCodeSamples,
	createContactXCodeSamples,
	createGroupXCodeSamples,
	createPropertyXCodeSamples,
	deleteChannelXCodeSamples,
	deleteContactXCodeSamples,
	deleteGroupXCodeSamples,
	deletePropertyXCodeSamples,
	getChannelXCodeSamples,
	getContactXCodeSamples,
	getGroupXCodeSamples,
	listChannelsXCodeSamples,
	listContactsXCodeSamples,
	listGroupsXCodeSamples,
	listPropertiesXCodeSamples,
	removeContactFromGroupXCodeSamples,
	updateChannelXCodeSamples,
	updateContactChannelXCodeSamples,
	updateContactXCodeSamples,
	updateGroupXCodeSamples,
	updatePropertyXCodeSamples,
} from "@reloop/code-samples/contacts";
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
	"contacts.channels.list": listChannelsXCodeSamples,
	"contacts.channels.get": getChannelXCodeSamples,
	"contacts.channels.update": updateChannelXCodeSamples,
	"contacts.channels.delete": deleteChannelXCodeSamples,
	"contacts.channels.addContact": addContactToChannelXCodeSamples,
	"contacts.channels.updateSubscription": updateContactChannelXCodeSamples,
} as const satisfies Record<string, LearnCodeSample[]>;

export type ContactsCodeSampleId = keyof typeof registry;

export function ContactsCodeSamples({ id }: { id: ContactsCodeSampleId }) {
	return <CodeSamples samples={registry[id]} />;
}
