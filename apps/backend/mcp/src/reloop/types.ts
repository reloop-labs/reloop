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

export type ApiKeyCreator = {
	id: string;
	name: string | null;
	image: string | null;
	email: string;
};

export type ApiKey = {
	object: "api_key";
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	lastRequest: string | null;
	expiresAt: string | null;
	permissions: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy?: ApiKeyCreator;
	event: string;
};

export type ApiKeyWithSecret = {
	object: "api_key";
	id: string;
	name: string | null;
	key: string;
	enabled: boolean;
	permissions: string | null;
	createdAt: string;
	updatedAt: string;
	event: string;
};

export type ListApiKeysQuery = {
	page?: number;
	limit?: number;
	enabled?: boolean;
	q?: string;
};

export type ApiKeyListResponse = {
	object: "api_key";
	apiKeys: ApiKey[];
	total: number;
	page: number;
	limit: number;
	event: string;
};

export type DeleteApiKeyResponse = {
	object: "api_key";
	id: string;
	message: string;
	event: string;
};

export type DomainStatus =
	| "pending"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export type DomainTls = "opportunistic" | "enforced";

export type DnsRecord = {
	id: string;
	recordType: string;
	recordTypeName: string;
	domain: string;
	name: string;
	value: string;
	ttl: string;
	priority: number | null;
	verificationError: string | null;
	purpose: "sending" | "receiving" | "tracking";
	status: DomainStatus;
	createdAt: string;
	updatedAt: string;
};

export type Domain = {
	object: "domain";
	id: string;
	domain: string;
	status: DomainStatus;
	isClickTrackingEnabled: boolean;
	isOpenTrackingEnabled: boolean;
	isSendingEmailEnabled: boolean;
	isReceivingEmailEnabled: boolean;
	tls: DomainTls;
	verificationFailedReason: string | null;
	dailyCap?: number | null;
	sentToday?: number;
	dnsRecords: DnsRecord[];
	lastVerifiedAt: string | null;
	createdAt: string;
	updatedAt: string;
	event?: string;
};

export type DomainSettingsInput = {
	click_tracking?: boolean;
	open_tracking?: boolean;
	sending_email?: boolean;
	receiving_email?: boolean;
	tls?: DomainTls;
};

export type CreateDomainInput = DomainSettingsInput & { domain: string };

export type ListDomainsQuery = {
	page?: number;
	limit?: number;
	q?: string;
	status?: DomainStatus;
};

export type DomainListResponse = {
	object: "domain";
	domains: Domain[];
	total: number;
	page: number;
	limit: number;
	event: string;
};

export type VerifyDomainResponse = {
	id: string;
	status: DomainStatus;
	event?: string;
};

export type ResourceCreator = {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
};

export type Group = {
	object?: "contact_group";
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	createdBy?: ResourceCreator;
	event?: string;
};

export type ListGroupsQuery = {
	page?: number;
	limit?: number;
	search?: string;
};

export type GroupListResponse = {
	object: "contact_group";
	groups: Group[];
	total: number;
	page: number;
	limit: number;
	event: string;
};

export type DeleteResourceResponse = {
	success: boolean;
	id: string;
	name: string;
	event: string;
};

export type GroupContact = {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: ContactStatus;
	properties: ContactProperties;
	createdAt: string;
	updatedAt: string;
};

export type ListGroupContactsQuery = {
	page?: number;
	limit?: number;
	search?: string;
	status?: ContactStatus;
};

export type GroupContactListResponse = {
	object: "contact_group";
	group: {
		id: string;
		name: string;
		createdAt: string;
		updatedAt: string;
		contacts: GroupContact[];
	};
	total: number;
	subscribedContacts: number;
	unsubscribedContacts: number;
	page: number;
	limit: number;
	event: string;
};

export type ContactSelector = { contact_id?: string; email?: string };

export type GroupMembershipResponse = {
	success: boolean;
	object: "contact";
	id: string;
	groupId?: string;
	groupName?: string | null;
	event: string;
};

export type ChannelVisibility = "private" | "public";

export type Channel = {
	object?: "channel";
	id: string;
	name: string;
	description: string | null;
	defaultSubscription: ChannelSubscription;
	visibility: ChannelVisibility;
	subscriberCount?: number;
	createdAt: string;
	updatedAt: string;
	event?: string;
};

export type ListChannelsQuery = { page?: number; limit?: number };

export type ChannelListResponse = {
	object: "channel";
	channels: Channel[];
	total: number;
	page: number;
	limit: number;
	event: string;
};

export type CreateChannelInput = {
	name: string;
	description?: string;
	defaultSubscription?: ChannelSubscription;
	visibility?: ChannelVisibility;
};

export type UpdateChannelInput = {
	name?: string;
	description?: string | null;
	defaultSubscription?: ChannelSubscription;
	visibility?: ChannelVisibility;
};

export type ChannelSubscriptionInput = ContactSelector & {
	subscription: ChannelSubscription;
};

export type ChannelSubscriptionResponse = {
	success: boolean;
	id?: string;
	status: "enrolled" | "unenrolled";
	channelId?: string;
	channelName?: string | null;
	subscription?: ChannelSubscription;
	event: string;
};
