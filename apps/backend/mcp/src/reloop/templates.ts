import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { templateEndpoints } from "./endpoints";
import type {
	Template,
	TemplateListResponse,
	TestTemplateInput,
} from "./types";

const TEMPLATE_CODES: ErrorCodeMap = { 404: "template_not_found" };

export class TemplatesApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(
		query: { page?: number; limit?: number } = {},
	): Promise<TemplateListResponse> {
		return this.#client.request<TemplateListResponse>({
			method: "GET",
			path: templateEndpoints.list,
			query: { page: query.page, limit: query.limit },
			codes: TEMPLATE_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<Template> {
		return this.#client.request<Template>({
			method: "GET",
			path: templateEndpoints.byId(id),
			codes: TEMPLATE_CODES,
			idempotent: true,
		});
	}

	sendTest(
		id: string,
		input: TestTemplateInput,
	): Promise<{ success: boolean }> {
		return this.#client.request<{ success: boolean }>({
			method: "POST",
			path: templateEndpoints.test(id),
			body: input,
			codes: TEMPLATE_CODES,
			idempotent: false,
		});
	}
}
