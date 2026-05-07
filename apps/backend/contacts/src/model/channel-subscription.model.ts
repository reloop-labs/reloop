import { t } from "elysia";

export namespace ChannelSubscriptionModel {
	// Create Channel Subscription
	export const createChannelSubscriptionBody = t.Object(
		{
			contactId: t.String({ description: "Contact ID" }),
			channelId: t.String({ description: "Channel ID" }),
			status: t.Optional(
				t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
					default: "enrolled",
					description: "Subscription status",
				}),
			),
		},
		{
			examples: [
				{
					contactId: "con_123456789",
					channelId: "chn_987654321",
					status: "enrolled",
				},
			],
		},
	);

	export type CreateChannelSubscriptionBody =
		typeof createChannelSubscriptionBody.static;

	// Update Channel Subscription
	export const updateChannelSubscriptionBody = t.Object(
		{
			status: t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
				description: "Subscription status",
			}),
		},
		{
			examples: [
				{
					status: "unenrolled",
				},
			],
		},
	);

	export type UpdateChannelSubscriptionBody =
		typeof updateChannelSubscriptionBody.static;

	// Channel Subscription Response
	export const channelSubscriptionResponse = t.Object(
		{
			id: t.String({ description: "Unique subscription identifier" }),
			contactId: t.String({ description: "Contact ID" }),
			channelId: t.String({ description: "Channel ID" }),
			organizationId: t.String({ description: "Organization ID" }),
			status: t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
				description: "Subscription status",
			}),
			createdAt: t.Date(),
			updatedAt: t.Date(),
			deletedAt: t.Union([t.Date(), t.Null()]),
			contact: t.Optional(
				t.Object({
					id: t.String(),
					email: t.String(),
					status: t.String(),
					organizationId: t.String(),
					createdAt: t.Date(),
					updatedAt: t.Date(),
					deletedAt: t.Union([t.Date(), t.Null()]),
				}),
			),
		},
		{
			examples: [
				{
					id: "sub_123456789",
					contactId: "con_123456789",
					channelId: "chn_987654321",
					organizationId: "org_123456789",
					status: "enrolled",
					createdAt: "2026-03-27T10:00:00Z",
					updatedAt: "2026-03-27T10:00:00Z",
					deletedAt: null,
				},
			],
		},
	);

	export type ChannelSubscriptionResponse =
		typeof channelSubscriptionResponse.static;

	// Channel Subscription List Response
	export const channelSubscriptionListResponse = t.Object({
		subscriptions: t.Array(channelSubscriptionResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type ChannelSubscriptionListResponse =
		typeof channelSubscriptionListResponse.static;

	// Query
	export const channelSubscriptionQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		contactId: t.Optional(t.String({ description: "Filter by contact ID" })),
		channelId: t.Optional(t.String({ description: "Filter by channel ID" })),
		status: t.Optional(
			t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
				description: "Filter by subscription status",
			}),
		),
	});

	export type ChannelSubscriptionQuery = typeof channelSubscriptionQuery.static;

	// Delete Response
	export const deleteResponse = t.Object({
		success: t.Boolean(),
	});

	export type DeleteResponse = typeof deleteResponse.static;

	// Error Responses
	export const notFound = t.Object({
		message: t.Literal("Channel subscription not found"),
	});
	export type NotFound = typeof notFound.static;

	export const subscriptionAlreadyExists = t.Object({
		message: t.Literal("Contact is already subscribed to this channel"),
	});
	export type SubscriptionAlreadyExists =
		typeof subscriptionAlreadyExists.static;

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

	// Unsubscribe Model
	export const unsubscribeBody = t.Object({
		contactId: t.String({ description: "Contact ID to unsubscribe" }),
		channelId: t.String({ description: "Channel ID to unsubscribe from" }),
	});

	export type UnsubscribeBody = typeof unsubscribeBody.static;

	// Bulk Subscribe Contacts to Channel
	export const bulkSubscribeContactsBody = t.Object({
		channelId: t.String({ description: "Channel ID to subscribe contacts in" }),
		contactIds: t.Array(t.String(), {
			minItems: 1,
			maxItems: 1000,
			description: "Array of contact IDs to subscribe",
		}),
	});

	export type BulkSubscribeContactsBody =
		typeof bulkSubscribeContactsBody.static;

	export const bulkSubscribeResponse = t.Object({
		subscribed: t.Number({ description: "Number of contacts subscribed" }),
		skipped: t.Number({
			description: "Number of contacts skipped (already subscribed)",
		}),
		errors: t.Array(
			t.Object({
				contactId: t.String(),
				reason: t.String(),
			}),
		),
	});

	export type BulkSubscribeResponse = typeof bulkSubscribeResponse.static;
}
