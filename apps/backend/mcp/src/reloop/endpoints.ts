const CONTACTS = "/api/contacts";

export const contactEndpoints = {
	list: `${CONTACTS}/list`,
	create: `${CONTACTS}/create`,
	retrieve: (id: string) => `${CONTACTS}/retrieve/${encodeURIComponent(id)}`,
	byId: (id: string) => `${CONTACTS}/${encodeURIComponent(id)}`,
} as const;

export const mailEndpoints = { send: "/api/mail/v1/send" } as const;
