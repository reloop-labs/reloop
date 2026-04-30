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
	},
		{
			examples: [
				{
					email: "john.doe@example.com",
					firstName: "John",
					lastName: "Doe",
					status: "subscribed",
					properties: {
						company: "Reloop",
						role: "Developer",
					},
				},
			],
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
	},
		{
			examples: [
				{
					email: "john.doe@example.com",
					firstName: "John",
					lastName: "Doe",
					status: "subscribed",
					properties: {
						company: "Reloop",
						role: "Developer",
					},
				},
			],
		});

	export type UpdateContactBody = typeof updateContactBody.static;

	export const contactBaseResponse = t.Object({
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
		groups: t.Array(
			t.Object({
				id: t.String({ description: "Group ID" }),
				name: t.String({ description: "Group name" }),
			}),
			{
				description: "Groups this contact belongs to",
				default: [],
			},
		),
		topics: t.Array(
			t.Object({
				id: t.String({ description: "Topic ID" }),
				name: t.String({ description: "Topic name" }),
				subscription: t.Union(
					[t.Literal("opt_in"), t.Literal("opt_out")],
					{ description: "Contact's subscription status for this topic" },
				),
			}),
			{
				description: "Topics this contact is enrolled in",
				default: [],
			},
		),
		suppressionReason: t.Union(
			[
				t.Literal("hard_bounce"),
				t.Literal("spam_complaint"),
				t.Null(),
			],
			{
				description: "Suppression reason, or null if not suppressed",
				default: null,
			},
		),
		suppressedAt: t.Union([t.Date(), t.Null()], {
			description: "When the contact was suppressed, or null",
			default: null,
		}),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	},
		{
			examples: [
				{
					object: "contact",
					id: "con_123456789",
					email: "john.doe@example.com",
					firstName: "John",
					lastName: "Doe",
					status: "subscribed",
					properties: {
						company: "Reloop",
						role: "Developer",
					},
					groups: [{ id: "grp_123", name: "Beta Testers" }],
					topics: [{ id: "tpc_123", name: "Newsletter", subscription: "opt_in" }],
					suppression: null,
					createdAt: "2026-03-23T10:00:00Z",
					updatedAt: "2026-03-23T10:00:00Z",
				},
			],
		});


	export const contactResponse = t.Composite([
		contactBaseResponse,
		t.Object({
			event: t.String({ description: "Event ID for the mutation" }),
		}),
	]);

	export type ContactResponse = typeof contactResponse.static;

	export const contactListItem = contactBaseResponse;
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
		event: t.String({ description: "Event ID for the list request" }),
	});

	export type ContactListResponse = typeof contactListResponse.static;

	// Lean contact item for group contact list (no groups/topics)
	export const groupContactItem = t.Object(
		{
			id: t.String({ description: "Unique contact identifier" }),
			email: t.String({ description: "Contact email address" }),
			firstName: t.Union([t.String(), t.Null()], { description: "Contact first name" }),
			lastName: t.Union([t.String(), t.Null()], { description: "Contact last name" }),
			status: t.Union(
				[
					t.Literal("subscribed"),
					t.Literal("unsubscribed"),
					t.Literal("blocked"),
				],
				{ description: "Contact subscription status" },
			),
			properties: t.Record(
				t.String({ pattern: "^[a-z_]+$" }),
				t.Union([t.String(), t.Number()]),
				{ description: "Contact properties as key-value pairs", default: {} },
			),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		},
		{
			examples: [
				{
					id: "con_123456789",
					email: "john.doe@example.com",
					firstName: "John",
					lastName: "Doe",
					status: "subscribed",
					properties: { company: "Reloop", role: "Developer" },
					createdAt: "2026-03-23T10:00:00Z",
					updatedAt: "2026-03-23T10:00:00Z",
				},
			],
		},
	);

	export type GroupContactItem = typeof groupContactItem.static;

	export const groupContactListResponse = t.Object({
		object: t.Literal("contact_group", { default: "contact_group" }),
		group: t.Object({
			id: t.String({ description: "Group ID" }),
			name: t.String({ description: "Group name" }),
			createdAt: t.Date(),
			updatedAt: t.Date(),
			contacts: t.Array(groupContactItem),
		}),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		event: t.String({ description: "Event ID for the list request" }),
	});

	export type GroupContactListResponse = typeof groupContactListResponse.static;

	export const contactQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 100 })),
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
	export const deleteResponse = t.Object(
		{
			success: t.Boolean({ default: true }),
			object: t.Literal("contact", { default: "contact" }),
			id: t.String({ description: "ID of the deleted contact" }),
			event: t.String({ description: "Event ID for the mutation" }),
		},
		{
			examples: [
				{
					success: true,
					object: "contact",
					id: "con_123456789",
				},
			],
		},
	);

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

	// Topic params
	export const topicParams = t.Object({
		topic_id: t.String({ description: "Topic ID" }),
	});

	// Group params
	export const groupParams = t.Object({
		group_id: t.String({ description: "Group ID" }),
	});

	// Add Contact to Topic (combined operation)
	export const addContactToTopicBody = t.Object({
		contact_id: t.Optional(t.String({ description: "Contact ID" })),
		email: t.Optional(
			t.String({
				pattern: emailPattern.source,
				description: "Contact email address",
			}),
		),
		subscription: t.Optional(
			t.Union([t.Literal("opt_in"), t.Literal("opt_out")], {
				description: "Subscription status for the topic",
				default: "opt_in",
			}),
		),
	});

	export type AddContactToTopicBody = typeof addContactToTopicBody.static;

	export const addContactToTopicResponse = t.Object({
		contact: contactResponse,
		subscriptionId: t.String({ description: "Created subscription ID" }),
		event: t.String({ description: "Event ID for the mutation" }),
	});

	export type AddContactToTopicResponse =
		typeof addContactToTopicResponse.static;

	// Group Management
	export const addContactToGroupBody = t.Object({
		contact_id: t.Optional(t.String({ description: "Contact ID" })),
		email: t.Optional(
			t.String({
				pattern: emailPattern.source,
				description: "Contact email address",
			}),
		),
	});

	export type AddContactToGroupBody = typeof addContactToGroupBody.static;

	export const addContactToGroupResponse = t.Object(
		{
			success: t.Boolean({ default: true }),
			object: t.Literal("contact", { default: "contact" }),
			id: t.String({ description: "ID of the contact added to the group" }),
			event: t.String({ description: "Event ID for the mutation" }),
		},
		{
			examples: [
				{
					success: true,
					object: "contact",
					id: "con_123456789",
				},
			],
		},
	);

	export type AddContactToGroupResponse = typeof addContactToGroupResponse.static;

	export const removeContactFromGroupBody = t.Object({
		contact_id: t.Optional(t.String({ description: "Contact ID" })),
		email: t.Optional(
			t.String({
				pattern: emailPattern.source,
				description: "Contact email address",
			}),
		),
	});

	export type RemoveContactFromGroupBody = typeof removeContactFromGroupBody.static;

	export const removeContactFromGroupResponse = t.Object(
		{
			success: t.Boolean({ default: true }),
			object: t.Literal("contact", { default: "contact" }),
			id: t.String({ description: "ID of the contact removed from the group" }),
			event: t.String({ description: "Event ID for the mutation" }),
		},
		{
			examples: [
				{
					success: true,
					object: "contact",
					id: "con_123456789",
				},
			],
		},
	);

	export type RemoveContactFromGroupResponse =
		typeof removeContactFromGroupResponse.static;

	// Update Topic Status
	export const updateContactTopicBody = t.Object({
		contact_id: t.Optional(t.String({ description: "Contact ID" })),
		email: t.Optional(
			t.String({
				pattern: emailPattern.source,
				description: "Contact email address",
			}),
		),
		subscription: t.Union([t.Literal("opt_in"), t.Literal("opt_out")], {
			description: "Status to update to",
		}),
	});

	export type UpdateContactTopicBody = typeof updateContactTopicBody.static;

	export const updateContactTopicResponse = t.Object({
		success: t.Boolean({ default: true }),
		status: t.String(),
		event: t.String({ description: "Event ID for the mutation" }),
	});

	export type UpdateContactTopicResponse =
		typeof updateContactTopicResponse.static;
}
