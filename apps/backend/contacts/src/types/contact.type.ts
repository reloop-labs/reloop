import type { ContactModel } from "@be/contacts/model/contact.model";

export namespace ContactTypes {
	// Contact Types
	export type ContactBaseResponse =
		typeof ContactModel.contactBaseResponse.static;
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
	export type ContactExportQuery =
		typeof ContactModel.contactExportQuery.static;
	export type ContactExportEmailResponse =
		typeof ContactModel.contactExportEmailResponse.static;
	export type ContactExportJobResponse =
		typeof ContactModel.contactExportJobResponse.static;

	// Error Types
	export type ContactNotFound = typeof ContactModel.contactNotFound.static;
	export type ContactAlreadyExists =
		typeof ContactModel.contactAlreadyExists.static;
	export type InvalidEmail = typeof ContactModel.invalidEmail.static;
	export type Unauthorized = typeof ContactModel.unauthorized.static;
	export type ValidationError = typeof ContactModel.validationError.static;

	/** `system`: bounce, full mailbox or spam complaint. `manual`: added by a person. */
	export type SuppressionSource = "system" | "manual";

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
		channels?: {
			id: string;
			name: string;
			subscription: "opt_in" | "opt_out";
		}[];
		suppressionReason: "hard_bounce" | "spam_complaint" | "mailbox_full" | null;
		suppressedAt: Date | null;
		suppressionSource?: SuppressionSource | null;
		suppressionNote?: string | null;
	}

	export interface CreateContactRequest {
		email: string;
		firstName?: string;
		lastName?: string;
		status?: "subscribed" | "unsubscribed" | "blocked";
		properties?: Record<string, string | number>;
		groupIds?: string[];
		channels?: {
			channelId: string;
			subscription: "opt_in" | "opt_out";
		}[];
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
	}

	export interface ContactListQuery {
		cursor?: string;
		page?: number;
		limit?: number;
		search?: string;
		/** One status or a comma-separated list, e.g. "subscribed,blocked". */
		status?: string;
		channelId?: string;
		/** Only contacts on the suppression list. */
		suppressed?: boolean;
		organizationId?: string;
	}
}
