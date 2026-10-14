import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { workflowEventEndpoints } from "./endpoints";
import type {
	CreateWorkflowEventBody,
	TrackWorkflowEventBody,
	TrackWorkflowEventResponse,
	UpdateWorkflowEventBody,
	WorkflowDeleteResponse,
	WorkflowEvent,
	WorkflowEventListResponse,
} from "./types";

const EVENT_CODES: ErrorCodeMap = {
	404: "event_not_found",
	409: "event_already_exists",
};

export class WorkflowEventsApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(
		query: { page?: number; limit?: number } = {},
	): Promise<WorkflowEventListResponse> {
		return this.#client.request<WorkflowEventListResponse>({
			method: "GET",
			path: workflowEventEndpoints.collection,
			query: { page: query.page, limit: query.limit },
			codes: EVENT_CODES,
			idempotent: true,
		});
	}

	/** Takes the event's ID or its key. */
	retrieve(idOrKey: string): Promise<WorkflowEvent> {
		return this.#client.request<WorkflowEvent>({
			method: "GET",
			path: workflowEventEndpoints.byId(idOrKey),
			codes: EVENT_CODES,
			idempotent: true,
		});
	}

	create(body: CreateWorkflowEventBody): Promise<WorkflowEvent> {
		return this.#client.request<WorkflowEvent>({
			method: "POST",
			path: workflowEventEndpoints.collection,
			body,
			codes: EVENT_CODES,
			idempotent: false,
		});
	}

	update(id: string, body: UpdateWorkflowEventBody): Promise<WorkflowEvent> {
		return this.#client.request<WorkflowEvent>({
			method: "PATCH",
			path: workflowEventEndpoints.byId(id),
			body,
			codes: EVENT_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<WorkflowDeleteResponse> {
		return this.#client.request<WorkflowDeleteResponse>({
			method: "DELETE",
			path: workflowEventEndpoints.byId(id),
			codes: EVENT_CODES,
			idempotent: true,
		});
	}

	track(body: TrackWorkflowEventBody): Promise<TrackWorkflowEventResponse> {
		return this.#client.request<TrackWorkflowEventResponse>({
			method: "POST",
			path: workflowEventEndpoints.track,
			body,
			codes: { 400: "invalid_event_properties", 404: "not_found" },
			idempotent: false,
		});
	}
}
