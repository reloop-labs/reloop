import { t } from "elysia";

export namespace ContactModel {
	// Email validation pattern
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// Contact status values
	export const statusValues = [
		"subscribed",
		"unsubscribed",
		"blocked",
	] as const;

	// Contact Models
	export const createContactBody = t.Object({
		email: t.String({
			pattern: emailPattern.source,
			description: "Contact email address",
		}),
		firstName: t.Optional(t.String({ description: "Contact first name" })),
		lastName: t.Optional(t.String({ description: "Contact last name" })),
		status: t.Optional(
			t.Union(
				[
					t.Literal("subscribed"),
					t.Literal("unsubscribed"),
					t.Literal("blocked"),
				],
				{
					description: "Contact subscription status",
					default: "subscribed",
				},
			),
		),
		properties: t.Optional(
			t.Record(
				t.String({ pattern: "^[a-z0-9_]+$" }),
				t.Union([t.String(), t.Number()]),
				{
					description: "Contact properties as key-value pairs",
				},
			),
		),
		groupIds: t.Optional(
			t.Array(t.String(), {
				description: "Array of group IDs to add the contact to",
			}),
		),
		topics: t.Optional(
			t.Array(
				t.Object({
					topicId: t.String({ description: "Topic identifier" }),
					subscription: t.Union(
						[t.Literal("opt_in"), t.Literal("opt_out")],
						{
							description: "Subscription status for the topic",
						},
					),
				}),
				{
					description: "Array of topics to enroll the contact in",
				},
			),
		),
	});

	export type CreateContactBody = typeof createContactBody.static;

	// Bulk create contacts (multiple emails)
	export const createContactsBody = t.Object({
		emails: t.Array(
			t.String({
				pattern: emailPattern.source,
				description: "Contact email address",
			}),
			{
				minItems: 1,
				description: "Array of email addresses to add as contacts",
			},
		),
	});

	export type CreateContactsBody = typeof createContactsBody.static;

	export const updateContactBody = t.Object({
		email: t.Optional(
			t.String({
				pattern: emailPattern.source,
				description: "Contact email address",
			}),
		),
		firstName: t.Optional(t.String({ description: "Contact first name" })),
		lastName: t.Optional(t.String({ description: "Contact last name" })),
		status: t.Optional(
			t.Union(
				[
					t.Literal("subscribed"),
					t.Literal("unsubscribed"),
					t.Literal("blocked"),
				],
				{
					description: "Contact subscription status",
				},
			),
		),
		properties: t.Optional(
			t.Record(
				t.String({ pattern: "^[a-z_]+$" }),
				t.Union([t.String(), t.Number()]),
				{
					description: "Contact properties as key-value pairs to update",
				},
			),
		),
	});

	export type UpdateContactBody = typeof updateContactBody.static;

	export const contactResponse = t.Object({
		object: t.Literal("contact", { default: "contact" }),
		id: t.String({ description: "Unique contact identifier" }),
		email: t.String({ description: "Contact email address" }),
		firstName: t.Union([t.String(), t.Null()], {
			description: "Contact first name",
		}),
		lastName: t.Union([t.String(), t.Null()], {
			description: "Contact last name",
		}),
		status: t.Union(
			[
				t.Literal("subscribed"),
				t.Literal("unsubscribed"),
				t.Literal("blocked"),
			],
			{
				description: "Contact subscription status",
			},
		),
		properties: t.Record(
			t.String({ pattern: "^[a-z_]+$" }),
			t.Union([t.String(), t.Number()]),
			{
				description: "Contact properties as key-value pairs",
				default: {},
			},
		),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	});

	export type ContactResponse = typeof contactResponse.static;

	export const contactListItem = t.Omit(contactResponse, ["object"]);
	export type ContactListItem = typeof contactListItem.static;

	export const contactListResponse = t.Object({
		object: t.Literal("contact", { default: "contact" }),
		contacts: t.Array(contactListItem),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		totalContacts: t.Number({
			description: "Total number of contacts in organization",
		}),
		subscribedContacts: t.Number({
			description: "Total number of subscribed contacts",
		}),
		unsubscribedContacts: t.Number({
			description: "Total number of unsubscribed contacts",
		}),
	});

	export type ContactListResponse = typeof contactListResponse.static;

	export const contactQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 1000, default: 100 })),
		search: t.Optional(t.String({ description: "Search by email" })),
		status: t.Optional(
			t.Union(
				[
					t.Literal("subscribed"),
					t.Literal("unsubscribed"),
					t.Literal("blocked"),
				],
				{
					description: "Filter by status",
				},
			),
		),
		organizationId: t.Optional(t.String()),
	});

	export type ContactQuery = typeof contactQuery.static;

	// Delete Response
	export const deleteResponse = t.Object({
		success: t.Boolean(),
	});

	export type DeleteResponse = typeof deleteResponse.static;

	// Error Responses
	export const contactNotFound = t.Object({
		message: t.Literal("Contact not found"),
	});
	export type ContactNotFound = typeof contactNotFound.static;

	export const contactAlreadyExists = t.Object({
		message: t.Literal("Contact already exists"),
	});
	export type ContactAlreadyExists = typeof contactAlreadyExists.static;

	export const invalidEmail = t.Object({
		message: t.Literal("Invalid email format"),
	});
	export type InvalidEmail = typeof invalidEmail.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const validationError = t.Object({
		message: t.String(),
		errors: t.Array(
			t.Object({
				field: t.String(),
				message: t.String(),
			}),
		),
	});
	export type ValidationError = typeof validationError.static;

	// Bulk Import Models
	export const bulkImportContactItem = t.Object({
		email: t.String({
			pattern: emailPattern.source,
			description: "Contact email address",
		}),
	});

	export const bulkImportContactsBody = t.Object({
		contacts: t.Array(bulkImportContactItem, {
			minItems: 1,
			maxItems: 1000,
			description: "Array of contacts to import",
		}),
	});

	export type BulkImportContactsBody = typeof bulkImportContactsBody.static;

	export const bulkImportResponse = t.Object({
		created: t.Number({ description: "Number of contacts created" }),
		skipped: t.Number({
			description: "Number of contacts skipped (already exist)",
		}),
		errors: t.Array(
			t.Object({
				email: t.String(),
				reason: t.String(),
			}),
		),
	});

	export type BulkImportResponse = typeof bulkImportResponse.static;

	// Add Contact to Topic (combined operation)
	export const addContactToTopicBody = t.Object({
		contactId: t.Optional(t.String({ description: "Contact ID" })),
		email: t.Optional(
			t.String({
				pattern: emailPattern.source,
				description: "Contact email address",
			}),
		),
		topicId: t.String({ description: "Topic ID to subscribe the contact to" }),
		subscription: t.Union([t.Literal("opt_in"), t.Literal("opt_out")], {
			description: "Subscription status for the topic",
		}),
	});

	export type AddContactToTopicBody = typeof addContactToTopicBody.static;

	export const addContactToTopicResponse = t.Object({
		contact: contactResponse,
		subscriptionId: t.String({ description: "Created subscription ID" }),
	});

	export type AddContactToTopicResponse =
		typeof addContactToTopicResponse.static;
}
