import type { Campaign, CreateCampaignInput } from "./campaign-types";

const BASE = "/api/campaigns/v1";

async function parseError(res: Response): Promise<string> {
	try {
		const body = (await res.json()) as { message?: string; why?: string };
		return body.why || body.message || `Request failed (${res.status})`;
	} catch {
		return `Request failed (${res.status})`;
	}
}

export async function listCampaigns(): Promise<Campaign[]> {
	const res = await fetch(`${BASE}/list?limit=100`, { credentials: "include" });
	if (!res.ok) throw new Error(await parseError(res));
	const body = (await res.json()) as { campaigns: Campaign[] };
	return body.campaigns ?? [];
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
): Promise<void> {
	const res = await fetch(`${BASE}/${id}/test`, {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ to }),
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
