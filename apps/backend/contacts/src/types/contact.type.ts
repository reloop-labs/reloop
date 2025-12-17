import type { ContactModel } from "@be/contacts/model/contact.model";

export namespace ContactTypes {
  // Contact Types
  export type ContactResponse = typeof ContactModel.contactResponse.static;
  export type ContactListResponse = typeof ContactModel.contactListResponse.static;
  export type CreateContactBody = typeof ContactModel.createContactBody.static;
  export type CreateContactsBody = typeof ContactModel.createContactsBody.static;
  export type UpdateContactBody = typeof ContactModel.updateContactBody.static;
  export type ContactQuery = typeof ContactModel.contactQuery.static;

  // Search Types
  export type SearchContactsQuery = typeof ContactModel.searchContactsQuery.static;

  // Error Types
  export type ContactNotFound = typeof ContactModel.contactNotFound.static;
  export type ContactAlreadyExists = typeof ContactModel.contactAlreadyExists.static;
  export type InvalidEmail = typeof ContactModel.invalidEmail.static;
  export type Unauthorized = typeof ContactModel.unauthorized.static;
  export type ValidationError = typeof ContactModel.validationError.static;

  // Internal Data Types
  export interface ContactData {
    id: string;
    email: string;
    status: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }

  export interface CreateContactRequest {
    email: string;
  }

  export interface CreateContactsRequest {
    emails: string[];
  }

  export interface UpdateContactRequest {
    email?: string;
    status?: "subscribed" | "unsubscribed";
    properties?: { propertyId: string; value: string }[];
  }

  export interface ContactListQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: "subscribed" | "unsubscribed";
    organizationId?: string;
  }

  export interface SearchContactsRequest {
    query: string;
    page?: number;
    limit?: number;
    status?: "subscribed" | "unsubscribed";
    organizationId?: string;
  }
}
