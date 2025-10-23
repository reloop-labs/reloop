import type { EventModel } from "./event.model";

export namespace EventTypes {
    export type EventResponse = typeof EventModel.eventResponse.static;
    export type EventListResponse = typeof EventModel.eventListResponse.static;
    export type EventQuery = typeof EventModel.eventQuery.static;
    export type EventNotFound = typeof EventModel.eventNotFound.static;
    export type Unauthorized = typeof EventModel.unauthorized.static;

    // Backend types with Date objects
    export interface EventData {
        id: string;
        name: string;
        description: string | null;
        category: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface EventListQuery {
        page?: number;
        limit?: number;
        category?: string;
        isActive?: boolean;
    }
}
