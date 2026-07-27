import type { CodeSample } from "../types";

import { createChannelXCodeSamples } from "./channel/create-channel/create-channel";
import { deleteChannelXCodeSamples } from "./channel/delete-channel/delete-channel";
import { getChannelXCodeSamples } from "./channel/get-channel/get-channel";
import { listChannelsXCodeSamples } from "./channel/list-channels/list-channels";
import { updateChannelXCodeSamples } from "./channel/update-channel/update-channel";
import { addContactToChannelXCodeSamples } from "./contact/add-contact-to-channel/add-contact-to-channel";
import { addContactToGroupXCodeSamples } from "./contact/add-contact-to-group/add-contact-to-group";
import { createContactXCodeSamples } from "./contact/create-contact/create-contact";
import { deleteContactXCodeSamples } from "./contact/delete-contact/delete-contact";
import { getContactXCodeSamples } from "./contact/get-contact/get-contact";
import { listContactsXCodeSamples } from "./contact/list-contacts/list-contacts";
import { removeContactFromGroupXCodeSamples } from "./contact/remove-contact-from-group/remove-contact-from-group";
import { updateContactChannelXCodeSamples } from "./contact/update-contact-channel/update-contact-channel";
import { updateContactXCodeSamples } from "./contact/update-contact/update-contact";
import { createGroupXCodeSamples } from "./group/create-group/create-group";
import { deleteGroupXCodeSamples } from "./group/delete-group/delete-group";
import { getGroupXCodeSamples } from "./group/get-group/get-group";
import { listGroupContactsXCodeSamples } from "./group/list-group-contacts/list-group-contacts";
import { listGroupsXCodeSamples } from "./group/list-groups/list-groups";
import { updateGroupXCodeSamples } from "./group/update-group/update-group";
import { createPropertyXCodeSamples } from "./property/create-property/create-property";
import { deletePropertyXCodeSamples } from "./property/delete-property/delete-property";
import { listPropertiesXCodeSamples } from "./property/list-properties/list-properties";
import { updatePropertyXCodeSamples } from "./property/update-property/update-property";

export { createChannelXCodeSamples };
export { deleteChannelXCodeSamples };
export { getChannelXCodeSamples };
export { listChannelsXCodeSamples };
export { updateChannelXCodeSamples };
export { addContactToChannelXCodeSamples };
export { addContactToGroupXCodeSamples };
export { createContactXCodeSamples };
export { deleteContactXCodeSamples };
export { getContactXCodeSamples };
export { listContactsXCodeSamples };
export { removeContactFromGroupXCodeSamples };
export { updateContactChannelXCodeSamples };
export { updateContactXCodeSamples };
export { createGroupXCodeSamples };
export { deleteGroupXCodeSamples };
export { getGroupXCodeSamples };
export { listGroupContactsXCodeSamples };
export { listGroupsXCodeSamples };
export { updateGroupXCodeSamples };
export { createPropertyXCodeSamples };
export { deletePropertyXCodeSamples };
export { listPropertiesXCodeSamples };
export { updatePropertyXCodeSamples };

export const contactsSamples = {
	createChannel: createChannelXCodeSamples,
	deleteChannel: deleteChannelXCodeSamples,
	getChannel: getChannelXCodeSamples,
	listChannels: listChannelsXCodeSamples,
	updateChannel: updateChannelXCodeSamples,
	addContactToChannel: addContactToChannelXCodeSamples,
	addContactToGroup: addContactToGroupXCodeSamples,
	createContact: createContactXCodeSamples,
	deleteContact: deleteContactXCodeSamples,
	getContact: getContactXCodeSamples,
	listContacts: listContactsXCodeSamples,
	removeContactFromGroup: removeContactFromGroupXCodeSamples,
	updateContactChannel: updateContactChannelXCodeSamples,
	updateContact: updateContactXCodeSamples,
	createGroup: createGroupXCodeSamples,
	deleteGroup: deleteGroupXCodeSamples,
	getGroup: getGroupXCodeSamples,
	listGroupContacts: listGroupContactsXCodeSamples,
	listGroups: listGroupsXCodeSamples,
	updateGroup: updateGroupXCodeSamples,
	createProperty: createPropertyXCodeSamples,
	deleteProperty: deletePropertyXCodeSamples,
	listProperties: listPropertiesXCodeSamples,
	updateProperty: updatePropertyXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type ContactsSampleKey = keyof typeof contactsSamples;
