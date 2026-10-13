import { createApiKey } from "./api-keys/create";
import { deleteApiKey } from "./api-keys/delete";
import { disableApiKey } from "./api-keys/disable";
import { enableApiKey } from "./api-keys/enable";
import { getApiKey } from "./api-keys/get";
import { listApiKeys } from "./api-keys/list";
import { rotateApiKey } from "./api-keys/rotate";
import { updateApiKey } from "./api-keys/update";
import { checkBimi } from "./bimi/check";
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
import type { AnyToolDefinition } from "./define";
import { checkDomainAge } from "./domain-age/check";
import { checkDomainReputation } from "./domain-reputation/check";
import { createDomain } from "./domains/create";
import { deleteDomain } from "./domains/delete";
import { getDomain } from "./domains/get";
import { listDomains } from "./domains/list";
import { updateDomain } from "./domains/update";
import { verifyDomain } from "./domains/verify";
import { getEmail } from "./email/get";
import { listEmails } from "./email/list";
import { resendEmail } from "./email/resend";
import { sendEmail } from "./email/send";
import { getEmailStats } from "./email/stats";
import { addContactToGroup } from "./groups/add-contact";
import { createGroup } from "./groups/create";
import { deleteGroup } from "./groups/delete";
import { getGroup } from "./groups/get";
import { listGroups } from "./groups/list";
import { listGroupContacts } from "./groups/list-contacts";
import { removeContactFromGroup } from "./groups/remove-contact";
import { updateGroup } from "./groups/update";
import { cancelPendingMailboxSend } from "./inbox/cancel-pending";
import { deleteInboxMessage } from "./inbox/delete-message";
import { deleteInboxThread } from "./inbox/delete-thread";
import { forwardInboxMessage } from "./inbox/forward";
import { getMailbox } from "./inbox/get-mailbox";
import { getInboxMessage } from "./inbox/get-message";
import { getInboxThread } from "./inbox/get-thread";
import { listMailboxes } from "./inbox/list-mailboxes";
import { listInboxMessages } from "./inbox/list-messages";
import { listMailboxSentMessages } from "./inbox/list-sent";
import { listInboxThreads } from "./inbox/list-threads";
import { moveInboxThread } from "./inbox/move-thread";
import { replyToInboxMessage } from "./inbox/reply";
import { sendMailboxEmail } from "./inbox/send";
import { updateInboxMessage } from "./inbox/update-message";
import { updateInboxThread } from "./inbox/update-thread";
import { createProperty } from "./properties/create";
import { deleteProperty } from "./properties/delete";
import { listProperties } from "./properties/list";
import { updateProperty } from "./properties/update";
import { createSmtpProvider } from "./smtp-providers/create";
import { deleteSmtpProvider } from "./smtp-providers/delete";
import { listSmtpProviders } from "./smtp-providers/list";
import { testSmtpProvider } from "./smtp-providers/test";
import { updateSmtpProvider } from "./smtp-providers/update";
import { getReloopStatus } from "./status/get";
import { checkTempEmail } from "./temp-email/check";
import { createTemplate } from "./templates/create";
import { getTemplate } from "./templates/get";
import { listTemplates } from "./templates/list";
import { sendTestEmail } from "./templates/send-test";

export const tools: readonly AnyToolDefinition[] = [
	getReloopStatus,
	listContacts,
	getContact,
	createContact,
	updateContact,
	deleteContact,
	listProperties,
	createProperty,
	updateProperty,
	deleteProperty,
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
	listEmails,
	getEmail,
	getEmailStats,
	resendEmail,
	listTemplates,
	getTemplate,
	createTemplate,
	sendTestEmail,
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
	listSmtpProviders,
	createSmtpProvider,
	updateSmtpProvider,
	testSmtpProvider,
	deleteSmtpProvider,
	checkTempEmail,
	checkDomainReputation,
	checkDomainAge,
	checkBimi,
	listMailboxes,
	getMailbox,
	listInboxThreads,
	getInboxThread,
	updateInboxThread,
	moveInboxThread,
	deleteInboxThread,
	listInboxMessages,
	getInboxMessage,
	updateInboxMessage,
	deleteInboxMessage,
	replyToInboxMessage,
	forwardInboxMessage,
	sendMailboxEmail,
	cancelPendingMailboxSend,
	listMailboxSentMessages,
];
