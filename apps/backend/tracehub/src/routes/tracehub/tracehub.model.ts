import { t } from "elysia";

export namespace TraceHubModel {
	export const trackEventBody = t.Object({
		event: t.String({
			minLength: 1,
			description: "Event name (e.g., 'user_signed_up', 'page_viewed')",
		}),
		properties: t.Optional(
			t.Record(
				t.String(),
				t.Union([t.String(), t.Number(), t.Boolean(), t.Null()]),
				{
					description: "Event properties as key-value pairs",
				},
			),
		),
		distinct_id: t.Optional(
			t.String({
				description: "Distinct identifier for the user/entity",
			}),
		),
		user_id: t.Optional(
			t.String({
				description: "User identifier",
			}),
		),
		organization_id: t.Optional(
			t.String({
				description: "Organization identifier",
			}),
		),
	});

	export type TrackEventBody = typeof trackEventBody.static;

	export const trackEventResponse = t.Object({
		uuid: t.String({ description: "Unique event identifier" }),
		event: t.String({ description: "Event name" }),
		message: t.String({ description: "Success message" }),
	});

	export type TrackEventResponse = typeof trackEventResponse.static;

	export const errorResponse = t.Object({
		message: t.String({ description: "Error message" }),
	});

	export type ErrorResponse = typeof errorResponse.static;
}
