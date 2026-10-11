import { createApiKey } from "./api-keys/create";
import { deleteApiKey } from "./api-keys/delete";
import { disableApiKey } from "./api-keys/disable";
import { enableApiKey } from "./api-keys/enable";
import { getApiKey } from "./api-keys/get";
import { listApiKeys } from "./api-keys/list";
import { rotateApiKey } from "./api-keys/rotate";
import { updateApiKey } from "./api-keys/update";
import { createChannel } from "./channels/create";
import { deleteChannel } from "./channels/delete";
import { getChannel } from "./channels/get";
import { listChannels } from "./channels/list";
import { setChannelSubscription } from "./channels/set-subscription";
import { updateChannel } from "./channels/update";
import { createContact } from "./contacts/create";
import { deleteContact } from "./contacts/delete";
import { getContact } from "./contacts/get";
import { listContacts } from "./contacts/list";
import { updateContact } from "./contacts/update";
import { createDomain } from "./domains/create";
import { deleteDomain } from "./domains/delete";
import { getDomain } from "./domains/get";
import { listDomains } from "./domains/list";
import { updateDomain } from "./domains/update";
import { verifyDomain } from "./domains/verify";
import { sendEmail } from "./email/send";
import { addContactToGroup } from "./groups/add-contact";
import { createGroup } from "./groups/create";
import { deleteGroup } from "./groups/delete";
import { getGroup } from "./groups/get";
import { listGroups } from "./groups/list";
import { listGroupContacts } from "./groups/list-contacts";
import { removeContactFromGroup } from "./groups/remove-contact";
import { updateGroup } from "./groups/update";

export const tools = [
	listContacts,
	getContact,
	createContact,
	updateContact,
	deleteContact,
	listGroups,
	getGroup,
	createGroup,
	updateGroup,
	deleteGroup,
	listGroupContacts,
	addContactToGroup,
	removeContactFromGroup,
	listChannels,
	getChannel,
	createChannel,
	updateChannel,
	deleteChannel,
	setChannelSubscription,
	sendEmail,
	listApiKeys,
	getApiKey,
	createApiKey,
	updateApiKey,
	rotateApiKey,
	enableApiKey,
	disableApiKey,
	deleteApiKey,
	listDomains,
	getDomain,
	createDomain,
	updateDomain,
	verifyDomain,
	deleteDomain,
] as const;
