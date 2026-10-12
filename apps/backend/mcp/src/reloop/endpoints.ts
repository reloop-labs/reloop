const CONTACTS = "/api/contacts";

export const contactEndpoints = {
	list: `${CONTACTS}/list`,
	create: `${CONTACTS}/create`,
	retrieve: (id: string) => `${CONTACTS}/retrieve/${encodeURIComponent(id)}`,
	byId: (id: string) => `${CONTACTS}/${encodeURIComponent(id)}`,
	groupMembership: (groupId: string) =>
		`${CONTACTS}/group/${encodeURIComponent(groupId)}`,
	channelSubscription: (channelId: string) =>
		`${CONTACTS}/channel/${encodeURIComponent(channelId)}`,
} as const;

const PROPERTIES = `${CONTACTS}/v1/properties`;

export const propertyEndpoints = {
	list: `${PROPERTIES}/list`,
	create: `${PROPERTIES}/create`,
	byId: (id: string) => `${PROPERTIES}/${encodeURIComponent(id)}`,
} as const;

const GROUPS = `${CONTACTS}/v1/groups`;

export const groupEndpoints = {
	list: `${GROUPS}/list`,
	create: `${GROUPS}/create`,
	byId: (id: string) => `${GROUPS}/${encodeURIComponent(id)}`,
	contacts: (id: string) => `${GROUPS}/${encodeURIComponent(id)}/contacts`,
} as const;

const CHANNELS = `${CONTACTS}/v1/channels`;

export const channelEndpoints = {
	list: `${CHANNELS}/list`,
	create: `${CHANNELS}/create`,
	byId: (id: string) => `${CHANNELS}/${encodeURIComponent(id)}`,
} as const;

export const mailEndpoints = {
	send: "/api/mail/v1/send",
	resend: (id: string) => `/api/mail/v1/resend/${encodeURIComponent(id)}`,
} as const;

const EMAIL_LOGS = "/api/logs/v1/emails";

export const emailLogEndpoints = {
	list: EMAIL_LOGS,
	stats: `${EMAIL_LOGS}/stats`,
	byId: (id: string) => `${EMAIL_LOGS}/${encodeURIComponent(id)}`,
} as const;

const TEMPLATES = "/api/template/v1";

export const templateEndpoints = {
	list: `${TEMPLATES}/list`,
	byId: (id: string) => `${TEMPLATES}/${encodeURIComponent(id)}`,
	test: (id: string) => `${TEMPLATES}/${encodeURIComponent(id)}/test`,
} as const;

const API_KEYS = "/api/api-key/v1";

export const apiKeyEndpoints = {
	collection: `${API_KEYS}/`,
	byId: (id: string) => `${API_KEYS}/${encodeURIComponent(id)}`,
	rotate: (id: string) => `${API_KEYS}/rotate/${encodeURIComponent(id)}`,
	enable: (id: string) => `${API_KEYS}/enable/${encodeURIComponent(id)}`,
	disable: (id: string) => `${API_KEYS}/disable/${encodeURIComponent(id)}`,
} as const;

const DOMAINS = "/api/domain/v1";

export const domainEndpoints = {
	list: `${DOMAINS}/list`,
	create: `${DOMAINS}/create`,
	byId: (id: string) => `${DOMAINS}/${encodeURIComponent(id)}`,
	verify: (id: string) => `${DOMAINS}/verify/${encodeURIComponent(id)}`,
} as const;

const SMTP_PROVIDERS = `${DOMAINS}/smtp-providers`;

export const smtpProviderEndpoints = {
	list: SMTP_PROVIDERS,
	create: SMTP_PROVIDERS,
	byId: (id: string) => `${SMTP_PROVIDERS}/${encodeURIComponent(id)}`,
	test: (id: string) => `${SMTP_PROVIDERS}/${encodeURIComponent(id)}/test`,
} as const;

export const tempEmailEndpoints = {
	check: "/api/tools/v1/temp-email-checker",
} as const;

export const domainAgeEndpoints = {
	check: "/api/tools/v1/domain-age",
} as const;

export const domainReputationEndpoints = {
	check: "/api/tools/v1/domain-reputation",
} as const;
