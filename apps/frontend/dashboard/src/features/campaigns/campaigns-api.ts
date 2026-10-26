import type {
	Campaign,
	CreateCampaignInput,
	UpdateCampaignInput,
} from "./campaign-types";

const BASE = "/api/campaigns/v1";

async function parseError(res: Response): Promise<string> {
	try {
		const body = (await res.json()) as { message?: string; why?: string };
		return body.why || body.message || `Request failed (${res.status})`;
	} catch {
		return `Request failed (${res.status})`;
	}
}

export interface CampaignListParams {
	page: number;
	limit: number;
	search: string;
	/** Selected statuses; empty means all. */
	statuses: string[];
}

export interface CampaignListResponse {
	campaigns: Campaign[];
	total: number;
	page: number;
	limit: number;
}

export async function listCampaigns(
	params: CampaignListParams,
): Promise<CampaignListResponse> {
	const sp = new URLSearchParams();
	sp.set("page", String(params.page));
	sp.set("limit", String(params.limit));
	if (params.search.trim()) sp.set("search", params.search.trim());
	if (params.statuses.length > 0) sp.set("status", params.statuses.join(","));
	const res = await fetch(`${BASE}/list?${sp.toString()}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as CampaignListResponse;
}

export async function getCampaignById(id: string): Promise<Campaign> {
	const res = await fetch(`${BASE}/${id}`, { credentials: "include" });
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export async function createCampaignRequest(
	input: CreateCampaignInput,
): Promise<Campaign> {
	const res = await fetch(`${BASE}/create`, {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export async function updateCampaignRequest(
	id: string,
	input: UpdateCampaignInput,
): Promise<Campaign> {
	const res = await fetch(`${BASE}/${id}`, {
		method: "PATCH",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export async function sendCampaignRequest(id: string): Promise<Campaign> {
	const res = await fetch(`${BASE}/${id}/send`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export async function scheduleCampaignRequest(
	id: string,
	scheduledAt: string,
): Promise<Campaign> {
	const res = await fetch(`${BASE}/${id}/schedule`, {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ scheduledAt }),
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export async function unscheduleCampaignRequest(id: string): Promise<Campaign> {
	const res = await fetch(`${BASE}/${id}/unschedule`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export async function duplicateCampaignRequest(id: string): Promise<Campaign> {
	const res = await fetch(`${BASE}/${id}/duplicate`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export async function deleteCampaignRequest(id: string): Promise<void> {
	const res = await fetch(`${BASE}/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) throw new Error(await parseError(res));
}

export async function testCampaignRequest(
	id: string,
	to: string,
	variables?: Record<string, string>,
): Promise<void> {
	const res = await fetch(`${BASE}/${id}/test`, {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ to, variables }),
	});
	if (!res.ok) throw new Error(await parseError(res));
}

export async function cancelCampaignRequest(id: string): Promise<Campaign> {
	const res = await fetch(`${BASE}/${id}/cancel`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) throw new Error(await parseError(res));
	return (await res.json()) as Campaign;
}

export type DeliverabilityCategory =
	| "unsubscribed"
	| "bounced"
	| "suppressed"
	| "blocked"
	| "complained"
	| "clicked";

export interface CampaignRecipient {
	id: string;
	email: string;
	contactId?: string;
	contactName?: string;
	status: string;
	skipReason?: string;
	emailLogId?: string;
	error?: string;
	category?: DeliverabilityCategory;
	openedAt?: string;
	clickedAt?: string;
	clickCount?: number;
	uniqueClickCount?: number;
	updatedAt?: string;
}

export interface CampaignClickedLink {
	url: string;
	clickCount: number;
	uniqueClickCount: number;
}

export interface CampaignRecipientsResponse {
	recipients: CampaignRecipient[];
	links?: CampaignClickedLink[];
	total: number;
	page: number;
	limit: number;
	counts?: {
		unsubscribed: number;
		bounced: number;
		suppressed: number;
		complained: number;
		clicked: number;
		clickedTotal: number;
		all: number;
	};
}

export async function listCampaignRecipients(
	id: string,
	params?: {
		page?: number;
		limit?: number;
		status?: string;
		category?: string;
		search?: string;
	},
): Promise<CampaignRecipientsResponse> {
	const sp = new URLSearchParams();
	if (params?.page) sp.set("page", String(params.page));
	if (params?.limit) sp.set("limit", String(params.limit));
	if (params?.status) sp.set("status", params.status);
	if (params?.category) sp.set("category", params.category);
	if (params?.search) sp.set("search", params.search);
	const query = sp.toString() ? `?${sp.toString()}` : "";
	const res = await fetch(`${BASE}/${id}/recipients${query}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(await parseError(res));
	return await res.json();
}
