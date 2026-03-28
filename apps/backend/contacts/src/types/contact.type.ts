import type { ContactModel } from "@be/contacts/model/contact.model";

export namespace ContactTypes {
	// Contact Types
	export type ContactResponse = typeof ContactModel.contactResponse.static;
	export type ContactListResponse =
		typeof ContactModel.contactListResponse.static;
	export type GroupContactListResponse =
		typeof ContactModel.groupContactListResponse.static;
	export type CreateContactBody = typeof ContactModel.createContactBody.static;
	export type CreateContactsBody =
		typeof ContactModel.createContactsBody.static;
	export type UpdateContactBody = typeof ContactModel.updateContactBody.static;
	export type ContactQuery = typeof ContactModel.contactQuery.static;

	// Error Types
	export type ContactNotFound = typeof ContactModel.contactNotFound.static;
	export type ContactAlreadyExists =
		typeof ContactModel.contactAlreadyExists.static;
	export type InvalidEmail = typeof ContactModel.invalidEmail.static;
	export type Unauthorized = typeof ContactModel.unauthorized.static;
	export type ValidationError = typeof ContactModel.validationError.static;

	// Internal Data Types
	export interface ContactData {
		id: string;
		email: string;
		firstName: string | null;
		lastName: string | null;
		status: "subscribed" | "unsubscribed" | "blocked";
		organizationId: string;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
		properties?: Record<string, string | number>;
		groups?: { id: string; name: string }[];
		topics?: { id: string; name: string; subscription: "opt_in" | "opt_out" }[];
	}

	export interface CreateContactRequest {
		email: string;
		firstName?: string;
		lastName?: string;
		status?: "subscribed" | "unsubscribed" | "blocked";
		properties?: Record<string, string | number>;
		groupIds?: string[];
		topics?: {
			topicId: string;
			subscription: "opt_in" | "opt_out";
		}[];
		object: "contact";
	}

	export interface CreateContactsRequest {
		emails: string[];
	}

	export interface UpdateContactRequest {
		email?: string;
		firstName?: string;
		lastName?: string;
		status?: "subscribed" | "unsubscribed" | "blocked";
		properties?: Record<string, string | number>;
		object: "contact";
	}

	export interface ContactListQuery {
		page?: number;
		limit?: number;
		search?: string;
		status?: "subscribed" | "unsubscribed" | "blocked";
		organizationId?: string;
	}
}
