import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { automationEndpoints } from "./endpoints";
import type {
	Automation,
	AutomationListResponse,
	CreateAutomationBody,
	EnrollContactBody,
	EnrollContactResponse,
	EnrollmentDetail,
	EnrollmentListResponse,
	ListEnrollmentsQuery,
	UpdateAutomationBody,
	WorkflowDeleteResponse,
} from "./types";

const AUTOMATION_CODES: ErrorCodeMap = {
	400: "invalid_automation",
	404: "automation_not_found",
};

const ENROLL_CODES: ErrorCodeMap = {
	400: "cannot_enroll",
	404: "not_found",
	409: "already_enrolled",
};

export class AutomationsApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(
		query: { page?: number; limit?: number } = {},
	): Promise<AutomationListResponse> {
		return this.#client.request<AutomationListResponse>({
			method: "GET",
			path: automationEndpoints.collection,
			query: { page: query.page, limit: query.limit },
			codes: AUTOMATION_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<Automation> {
		return this.#client.request<Automation>({
			method: "GET",
			path: automationEndpoints.byId(id),
			codes: AUTOMATION_CODES,
			idempotent: true,
		});
	}

	create(body: CreateAutomationBody): Promise<Automation> {
		return this.#client.request<Automation>({
			method: "POST",
			path: automationEndpoints.collection,
			body,
			codes: AUTOMATION_CODES,
			idempotent: false,
		});
	}

	update(id: string, body: UpdateAutomationBody): Promise<Automation> {
		return this.#client.request<Automation>({
			method: "PATCH",
			path: automationEndpoints.byId(id),
			body,
			codes: AUTOMATION_CODES,
			idempotent: true,
		});
	}

	activate(id: string): Promise<Automation> {
		return this.#client.request<Automation>({
			method: "POST",
			path: automationEndpoints.action(id, "activate"),
			codes: AUTOMATION_CODES,
			idempotent: true,
		});
	}

	pause(id: string): Promise<Automation> {
		return this.#client.request<Automation>({
			method: "POST",
			path: automationEndpoints.action(id, "pause"),
			codes: AUTOMATION_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<WorkflowDeleteResponse> {
		return this.#client.request<WorkflowDeleteResponse>({
			method: "DELETE",
			path: automationEndpoints.byId(id),
			codes: AUTOMATION_CODES,
			idempotent: true,
		});
	}

	enroll(id: string, body: EnrollContactBody): Promise<EnrollContactResponse> {
		return this.#client.request<EnrollContactResponse>({
			method: "POST",
			path: automationEndpoints.action(id, "enroll"),
			body,
			codes: ENROLL_CODES,
			idempotent: false,
		});
	}

	listEnrollments(
		id: string,
		query: ListEnrollmentsQuery = {},
	): Promise<EnrollmentListResponse> {
		return this.#client.request<EnrollmentListResponse>({
			method: "GET",
			path: automationEndpoints.enrollments(id),
			query: { page: query.page, limit: query.limit, status: query.status },
			codes: AUTOMATION_CODES,
			idempotent: true,
		});
	}

	retrieveEnrollment(
		id: string,
		enrollmentId: string,
	): Promise<EnrollmentDetail> {
		return this.#client.request<EnrollmentDetail>({
			method: "GET",
			path: automationEndpoints.enrollment(id, enrollmentId),
			codes: { 404: "not_found" },
			idempotent: true,
		});
	}
}
