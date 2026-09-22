async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(path, {
		headers: { "content-type": "application/json" },
		...init,
	});
	const text = await res.text();
	let data: unknown = null;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		throw new Error(
			res.ok
				? `Server returned non-JSON from ${path}`
				: `Request failed (${res.status}): ${text.slice(0, 160) || res.statusText}`,
		);
	}
	if (!res.ok) {
		const errMsg =
			data && typeof data === "object" && "error" in data
				? String((data as { error: unknown }).error)
				: `Request failed (${res.status})`;
		throw new Error(errMsg);
	}
	return data as T;
}

export type Product = {
	id: string;
	name: string;
	url: string;
};

export type PlanItem = {
	directoryId: string;
	directoryName: string;
	domainRating?: number;
	submitUrl: string;
	requiresAccount: boolean;
	linkType: string;
	approval?: string;
	verdict: "ready" | "fixable" | "out_of_reach";
	reasons: string[];
};

export type Submission = {
	directoryId: string;
	directoryName: string;
	status: string;
	at: string;
	url?: string;
	note?: string;
	error?: string;
};

export type RunSummary = {
	id?: string;
	productId?: string;
	status?: string;
	counts?: Record<string, number>;
	submissions?: Submission[];
	plan?: PlanItem[];
	product?: Product;
	latest?: null;
	runs?: RunSummary[];
};

export const api = {
	products: () => request<Product[]>("/products"),
	plan: (productId: string) =>
		request<{ product: Product; plan: PlanItem[] }>(`/plan/${productId}`),
	run: (body: { productId: string; dryRun?: boolean; only?: string[] }) =>
		request<RunSummary>("/runs", { method: "POST", body: JSON.stringify(body) }),
	status: () => request<RunSummary>("/runs/latest"),
	resume: () => request<RunSummary>("/resume", { method: "POST", body: "{}" }),
};
