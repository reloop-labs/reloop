export type ContactStatus = "subscribed" | "unsubscribed" | "blocked";

export type ChannelSubscription = "opt_in" | "opt_out";

export type SuppressionReason = "hard_bounce" | "spam_complaint";

export type ContactProperties = Record<string, string | number>;

export type ContactGroupRef = { id: string; name: string };

export type ContactChannelRef = {
	id: string;
	name: string;
	subscription: ChannelSubscription;
};

export type Contact = {
	object: "contact";
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: ContactStatus;
	properties: ContactProperties;
	groups: ContactGroupRef[];
	channels: ContactChannelRef[];
	suppressionReason: SuppressionReason | null;
	suppressedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type MutatedContact = Contact & { event: string };

export type ContactChannelInput = {
	channelId: string;
	subscription: ChannelSubscription;
};

export type CreateContactInput = {
	email: string;
	firstName?: string;
	lastName?: string;
	status?: ContactStatus;
	properties?: ContactProperties;
	groupIds?: string[];
	channels?: ContactChannelInput[];
};

export type UpdateContactInput = {
	email?: string;
	firstName?: string;
	lastName?: string;
	status?: ContactStatus;
	properties?: ContactProperties;
};

export type ListContactsQuery = {
	page?: number;
	limit?: number;
	search?: string;
	status?: ContactStatus;
	channelId?: string;
};

export type ContactListResponse = {
	object: "contact";
	contacts: Contact[];
	total: number;
	page: number;
	limit: number;
	totalContacts: number;
	subscribedContacts: number;
	unsubscribedContacts: number;
	event: string;
};

export type DeleteContactResponse = {
	success: boolean;
	object: "contact";
	id: string;
	event: string;
};

export type SendEmailInput = {
	from: string;
	to: string | string[];
	subject: string;
	cc?: string | string[];
	bcc?: string | string[];
	text?: string;
	html?: string;
	reply_to?: string | string[];
	scheduled_at?: string;
	headers?: Record<string, string>;
	tags?: { name: string; value: string }[];
	template?: { id: string; variables?: Record<string, string | number> };
	channel_id?: string;
};

export type SendEmailResponse = {
	success: boolean;
	messageId: string;
	status: string;
	timestamp: string;
	id: string;
};
