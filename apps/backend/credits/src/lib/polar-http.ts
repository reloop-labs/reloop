import { creditsConfig } from "@reloop/credits/credits.config";
import type {
	PolarCheckout,
	PolarCustomer,
	PolarPortal,
	PolarProductRef,
} from "./polar";

const POLAR_API = {
	production: "https://api.polar.sh",
	sandbox: "https://sandbox-api.polar.sh",
} as const;

export class PolarHttpError extends Error {
	constructor(
		readonly status: number,
		readonly path: string,
		readonly body: string,
	) {
		super(`Polar ${status} ${path}: ${body.slice(0, 500)}`);
		this.name = "PolarHttpError";
	}
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function field(
	data: Record<string, unknown>,
	camel: string,
	snake: string,
): unknown {
	return data[camel] ?? data[snake];
}

export function parsePolarProductRefs(payload: unknown): PolarProductRef[] {
	const root = asRecord(payload);
	const items = root?.items;
	if (!Array.isArray(items)) return [];

	const products: PolarProductRef[] = [];
	for (const item of items) {
		const rec = asRecord(item);
		if (!rec) continue;
		const id = str(rec.id);
		const name = str(rec.name);
		if (!id || !name) continue;
		products.push({
			id,
			name,
			metadata: asRecord(rec.metadata) ?? {},
		});
	}
	return products;
}

export function parsePolarCustomer(payload: unknown): PolarCustomer {
	const rec = asRecord(payload);
	const id = rec ? str(rec.id) : undefined;
	if (!id) {
		throw new Error("Polar customer response did not include an id");
	}
	return {
		id,
		externalId: rec
			? (str(field(rec, "externalId", "external_id")) ?? null)
			: null,
		email: rec ? (str(rec.email) ?? null) : null,
	};
}

export function parsePolarCheckout(payload: unknown): PolarCheckout {
	const rec = asRecord(payload);
	const id = rec ? str(rec.id) : undefined;
	const url = rec ? str(rec.url) : undefined;
	if (!id || !url) {
		throw new Error("Polar checkout did not return a URL");
	}
	return { id, url };
}

export function parsePolarPortal(payload: unknown): PolarPortal {
	const rec = asRecord(payload);
	const url = rec
		? str(field(rec, "customerPortalUrl", "customer_portal_url"))
		: undefined;
	if (!url) {
		throw new Error("Polar customer session did not return a portal URL");
	}
	return { url };
}

function polarBaseUrl(): string {
	return POLAR_API[creditsConfig.POLAR_SERVER];
}

async function polarRequest(
	path: string,
	init?: RequestInit,
): Promise<{ status: number; json: unknown }> {
	const headers = new Headers(init?.headers);
	headers.set("authorization", `Bearer ${creditsConfig.POLAR_ACCESS_TOKEN}`);
	headers.set("accept", "application/json");
	if (init?.body && !headers.has("content-type")) {
		headers.set("content-type", "application/json");
	}

	const res = await fetch(`${polarBaseUrl()}${path}`, {
		...init,
		headers,
	});
	const text = await res.text();
	let json: unknown = null;
	if (text) {
		try {
			json = JSON.parse(text);
		} catch {
			json = text;
		}
	}
	return { status: res.status, json };
}

export async function polarJson(
	path: string,
	init?: RequestInit,
): Promise<unknown> {
	const { status, json } = await polarRequest(path, init);
	if (status >= 400) {
		const body =
			typeof json === "string" ? json : json == null ? "" : JSON.stringify(json);
		throw new PolarHttpError(status, path, body);
	}
	return json;
}

export async function polarJsonOrNotFound(
	path: string,
	init?: RequestInit,
): Promise<unknown | null> {
	const { status, json } = await polarRequest(path, init);
	if (status === 404) return null;
	if (status >= 400) {
		const body =
			typeof json === "string" ? json : json == null ? "" : JSON.stringify(json);
		throw new PolarHttpError(status, path, body);
	}
	return json;
}

export async function listPolarProducts(): Promise<PolarProductRef[]> {
	const products: PolarProductRef[] = [];
	let page = 1;
	while (true) {
		const query = new URLSearchParams({
			is_archived: "false",
			is_recurring: "true",
			limit: "100",
			page: String(page),
		});
		const payload = await polarJson(`/v1/products/?${query.toString()}`);
		const pageItems = parsePolarProductRefs(payload);
		products.push(...pageItems);

		const pagination = asRecord(asRecord(payload)?.pagination);
		const maxPage = Number(pagination?.max_page ?? pagination?.maxPage ?? page);
		if (pageItems.length === 0 || page >= maxPage) break;
		page += 1;
	}
	return products;
}

export async function getPolarCustomerByExternalId(
	externalId: string,
): Promise<PolarCustomer | null> {
	const payload = await polarJsonOrNotFound(
		`/v1/customers/external/${encodeURIComponent(externalId)}`,
	);
	return payload ? parsePolarCustomer(payload) : null;
}

export async function createPolarCustomer(input: {
	externalId: string;
	email: string;
	name: string;
}): Promise<PolarCustomer> {
	const payload = await polarJson("/v1/customers/", {
		method: "POST",
		body: JSON.stringify({
			email: input.email,
			name: input.name,
			external_id: input.externalId,
			type: "team",
			metadata: { organization_id: input.externalId },
		}),
	});
	return parsePolarCustomer(payload);
}

export async function createPolarCheckout(input: {
	productId: string;
	externalCustomerId: string;
	customerEmail?: string;
	successUrl: string;
	returnUrl?: string;
	metadata: Record<string, string>;
}): Promise<PolarCheckout> {
	const payload = await polarJson("/v1/checkouts/", {
		method: "POST",
		body: JSON.stringify({
			products: [input.productId],
			external_customer_id: input.externalCustomerId,
			customer_email: input.customerEmail,
			success_url: input.successUrl,
			return_url: input.returnUrl,
			metadata: input.metadata,
		}),
	});
	return parsePolarCheckout(payload);
}

export async function createPolarCustomerPortal(input: {
	customerId: string;
}): Promise<PolarPortal> {
	const payload = await polarJson("/v1/customer-sessions/", {
		method: "POST",
		body: JSON.stringify({ customer_id: input.customerId }),
	});
	return parsePolarPortal(payload);
}

export async function ingestPolarEmailEvents(input: {
	externalCustomerId: string;
	count: number;
}): Promise<void> {
	if (input.count <= 0) return;
	const events = Array.from({ length: input.count }, () => ({
		name: "email_sent",
		external_customer_id: input.externalCustomerId,
	}));
	await polarJson("/v1/events/ingest", {
		method: "POST",
		body: JSON.stringify({ events }),
	});
}
