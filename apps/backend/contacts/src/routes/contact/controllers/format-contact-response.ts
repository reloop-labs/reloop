import type { ContactTypes } from "@be/contacts/types/contact.type";

export function formatContactResponse(
	contact: ContactTypes.ContactData,
): ContactTypes.ContactResponse {
	return {
		object: "contact",
		id: contact.id,
		email: contact.email,
		firstName: contact.firstName,
		lastName: contact.lastName,
		status: contact.status,
		properties: contact.properties ?? {},
		groups: contact.groups ?? [],
		topics: contact.topics ?? [],
		createdAt: contact.createdAt,
		updatedAt: contact.updatedAt,
	};
}
