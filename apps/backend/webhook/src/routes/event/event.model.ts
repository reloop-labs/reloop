import { t } from "elysia";

export namespace EventModel {
    export const eventIdParam = t.String({
        minLength: 1,
        description: "Event ID",
    });

    export const eventResponse = t.Object({
        id: t.String({ description: "Unique event identifier" }),
        name: t.String({ description: "Event name" }),
        description: t.Union([t.String(), t.Null()], {
            description: "Event description",
        }),
        category: t.String({ description: "Event category" }),
        isActive: t.Boolean({ description: "Whether the event is active" }),
        createdAt: t.String({ description: "Creation timestamp" }),
        updatedAt: t.String({ description: "Last update timestamp" }),
    });

    export type EventResponse = typeof eventResponse.static;

    export const eventListResponse = t.Object({
        events: t.Array(eventResponse),
        total: t.Number(),
        page: t.Number(),
        limit: t.Number(),
    });

    export type EventListResponse = typeof eventListResponse.static;

    export const eventQuery = t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
        category: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
    });

    export type EventQuery = typeof eventQuery.static;

    // Error responses
    export const eventNotFound = t.Object({
        message: t.Literal("Event not found"),
    });
    export type EventNotFound = typeof eventNotFound.static;

    export const unauthorized = t.Object({
        message: t.Literal("Unauthorized access"),
    });
    export type Unauthorized = typeof unauthorized.static;
}
