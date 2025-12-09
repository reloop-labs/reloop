import type { ContactTypes } from "@be/audience/types/contact.type";

export function formatContactResponse(
	contact: ContactTypes.ContactData,
): ContactTypes.ContactResponse {
	return {
		id: contact.id,
		email: contact.email,
		firstName: contact.firstName,
		lastName: contact.lastName,
		organizationId: contact.organizationId,
		createdAt: contact.createdAt,
		updatedAt: contact.updatedAt,
		deletedAt: contact.deletedAt,
	};
}
