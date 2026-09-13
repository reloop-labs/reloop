export type CustomEventProperty = {
	id: string;
	name: string;
	propertyType: "string" | "number" | "boolean";
	required: boolean;
	defaultValue: string | null;
	description: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CustomEvent = {
	id: string;
	organizationId: string;
	name: string;
	key: string;
	description: string | null;
	properties: CustomEventProperty[];
	createdAt: string;
	updatedAt: string;
};

export type CustomEventListResponse = {
	events: CustomEvent[];
	total: number;
	page: number;
	limit: number;
};

async function parseJson<T>(res: Response): Promise<T> {
	const data = (await res.json().catch(() => ({}))) as T & {
		message?: string;
		why?: string;
	};
	if (!res.ok) {
		throw new Error(
			data.why || data.message || `Request failed (${res.status})`,
		);
	}
	return data;
}

export async function listCustomEvents(
	limit = 100,
): Promise<CustomEventListResponse> {
	const res = await fetch(`/api/workflow/v1/events?limit=${limit}`, {
		credentials: "include",
	});
	return parseJson(res);
}

export type CustomEventPropertyInput = {
	name: string;
	propertyType?: "string" | "number" | "boolean";
	required?: boolean;
	defaultValue?: string | null;
	description?: string | null;
};

export async function createCustomEvent(input: {
	name: string;
	key?: string;
	description?: string;
	properties?: CustomEventPropertyInput[];
}): Promise<CustomEvent> {
	const res = await fetch("/api/workflow/v1/events", {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(input),
	});
	return parseJson(res);
}

export async function getCustomEvent(
	eventIdOrKey: string,
): Promise<CustomEvent> {
	const res = await fetch(
		`/api/workflow/v1/events/${encodeURIComponent(eventIdOrKey)}`,
		{ credentials: "include" },
	);
	return parseJson(res);
}

export async function updateCustomEvent(
	eventId: string,
	input: {
		name?: string;
		description?: string | null;
		properties?: CustomEventPropertyInput[];
	},
): Promise<CustomEvent> {
	const res = await fetch(
		`/api/workflow/v1/events/${encodeURIComponent(eventId)}`,
		{
			method: "PATCH",
			credentials: "include",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(input),
		},
	);
	return parseJson(res);
}

export async function deleteCustomEvent(
	eventId: string,
): Promise<{ success: boolean; id: string }> {
	const res = await fetch(
		`/api/workflow/v1/events/${encodeURIComponent(eventId)}`,
		{
			method: "DELETE",
			credentials: "include",
		},
	);
	return parseJson(res);
}
