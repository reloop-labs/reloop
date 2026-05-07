import { t } from "elysia";

export namespace ChannelModel {
	// Create Channel
	export const createChannelBody = t.Object(
		{
			name: t.String({
				minLength: 1,
				maxLength: 255,
				description: "Channel name",
			}),
			description: t.Optional(
				t.String({
					maxLength: 1000,
					description: "Channel description",
				}),
			),
			defaultSubscription: t.Optional(
				t.Union([t.Literal("opt_in"), t.Literal("opt_out")], {
					default: "opt_in",
					description: "Default subscription setting",
				}),
			),
			visibility: t.Optional(
				t.Union([t.Literal("private"), t.Literal("public")], {
					default: "private",
					description:
						"Visibility setting - whether the channel is visible to everyone or just the team",
				}),
			),
		},
		{
			examples: [
				{
					name: "Product Updates",
					description: "Get the latest news about our products",
					defaultSubscription: "opt_in",
					visibility: "public",
				},
			],
		},
	);

	export type CreateChannelBody = typeof createChannelBody.static;

	// Update Channel
	export const updateChannelBody = t.Object(
		{
			name: t.Optional(
				t.String({
					minLength: 1,
					maxLength: 255,
					description: "Channel name",
				}),
			),
			description: t.Optional(
				t.Union([
					t.String({
						maxLength: 1000,
						description: "Channel description",
					}),
					t.Null(),
				]),
			),
			visibility: t.Optional(
				t.Union([t.Literal("private"), t.Literal("public")], {
					description:
						"Visibility setting - whether the channel is visible to everyone or just the team",
				}),
			),
		},
		{
			examples: [
				{
					name: "Marketing News",
					description: "Internal marketing updates",
					visibility: "private",
				},
			],
		},
	);

	export type UpdateChannelBody = typeof updateChannelBody.static;

	// Channel Response
	export const channelBaseResponse = t.Object(
		{
			object: t.Literal("channel", { default: "channel" }),
			id: t.String({ description: "Unique channel identifier" }),
			name: t.String({ description: "Channel name" }),
			description: t.Union([t.String(), t.Null()], {
				description: "Channel description",
			}),
			defaultSubscription: t.Union(
				[t.Literal("opt_in"), t.Literal("opt_out")],
				{
					description: "Default subscription setting",
				},
			),
			visibility: t.Union([t.Literal("private"), t.Literal("public")], {
				description:
					"Visibility setting - whether the channel is visible to everyone or just the team",
			}),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		},
		{
			examples: [
				{
					object: "channel",
					id: "chn_123456789",
					name: "Product Updates",
					description: "Get the latest news about our products",
					defaultSubscription: "opt_in",
					visibility: "public",
					createdAt: "2026-03-27T10:00:00Z",
					updatedAt: "2026-03-27T10:00:00Z",
				},
			],
		},
	);

	export const channelResponse = t.Composite([
		channelBaseResponse,
		t.Object({
			event: t.String({ description: "Event ID for the mutation" }),
		}),
	]);

	export type ChannelResponse = typeof channelResponse.static;

	export const channelListItem = t.Composite([
		t.Omit(channelBaseResponse, ["object"]),
		t.Object({
			subscriberCount: t.Optional(
				t.Number({ description: "Number of subscribers" }),
			),
		}),
	]);
	export type ChannelListItem = typeof channelListItem.static;

	// Channel List Response
	export const channelListResponse = t.Object({
		object: t.Literal("channel", { default: "channel" }),
		channels: t.Array(channelListItem),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		event: t.String({ description: "Event ID for the list request" }),
	});

	export type ChannelListResponse = typeof channelListResponse.static;

	// Query
	export const channelQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 100 })),
	});

	export type ChannelQuery = typeof channelQuery.static;

	// Delete Response
	export const deleteResponse = t.Object({
		object: t.Literal("channel", { default: "channel" }),
		success: t.Boolean(),
		id: t.String({ description: "ID of the deleted channel" }),
		name: t.String({ description: "Name of the deleted channel" }),
		event: t.String({ description: "Event ID for the mutation" }),
	});

	export type DeleteResponse = typeof deleteResponse.static;

	// Error Responses
	export const channelNotFound = t.Object({
		message: t.Literal("Channel not found"),
	});
	export type ChannelNotFound = typeof channelNotFound.static;

	export const channelAlreadyExists = t.Object({
		message: t.Literal("Channel already exists"),
	});
	export type ChannelAlreadyExists = typeof channelAlreadyExists.static;

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
}
