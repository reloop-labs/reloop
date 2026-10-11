import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { smtpProviderEndpoints } from "./endpoints";
import type {
	CreateSmtpProviderInput,
	SmtpProvider,
	SmtpProviderListResponse,
	TestSmtpProviderResponse,
	UpdateSmtpProviderInput,
} from "./types";

const SMTP_PROVIDER_CODES: ErrorCodeMap = {
	404: "smtp_provider_not_found",
	402: "quota_exceeded",
};

export class SmtpProvidersApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(): Promise<SmtpProviderListResponse> {
		return this.#client.request<SmtpProviderListResponse>({
			method: "GET",
			path: smtpProviderEndpoints.list,
			codes: SMTP_PROVIDER_CODES,
			idempotent: true,
		});
	}

	create(input: CreateSmtpProviderInput): Promise<SmtpProvider> {
		return this.#client.request<SmtpProvider>({
			method: "POST",
			path: smtpProviderEndpoints.create,
			body: input,
			codes: SMTP_PROVIDER_CODES,
			idempotent: false,
		});
	}

	update(id: string, input: UpdateSmtpProviderInput): Promise<SmtpProvider> {
		return this.#client.request<SmtpProvider>({
			method: "PATCH",
			path: smtpProviderEndpoints.byId(id),
			body: input,
			codes: SMTP_PROVIDER_CODES,
			idempotent: true,
		});
	}

	test(id: string): Promise<TestSmtpProviderResponse> {
		return this.#client.request<TestSmtpProviderResponse>({
			method: "POST",
			path: smtpProviderEndpoints.test(id),
			codes: SMTP_PROVIDER_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<{ id: string; deleted: true }> {
		return this.#client.request<{ id: string; deleted: true }>({
			method: "DELETE",
			path: smtpProviderEndpoints.byId(id),
			codes: SMTP_PROVIDER_CODES,
			idempotent: true,
		});
	}
}
