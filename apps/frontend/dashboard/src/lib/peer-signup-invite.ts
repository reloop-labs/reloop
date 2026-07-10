export type PeerSignupInvite = {
	id: string;
	code: string;
	email: string;
	status: "pending" | "used" | "revoked";
	expiresAt: string;
	createdAt: string;
	inviteLink: string;
};

export type PeerSignupInvitesResponse = {
	items: PeerSignupInvite[];
	used: number;
	limit: number;
	remaining: number;
};

async function parseError(res: Response) {
	try {
		const data = (await res.json()) as { message?: string };
		return data.message || res.statusText;
	} catch {
		return res.statusText || "Request failed";
	}
}

export async function fetchMySignupInvites(): Promise<PeerSignupInvitesResponse> {
	const res = await fetch("/api/auth/v1/signup-invite/mine", {
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	return res.json();
}

export async function createSignupInvite(email: string) {
	const res = await fetch("/api/auth/v1/signup-invite", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email }),
	});
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	return res.json() as Promise<{
		id: string;
		email: string;
		inviteLink: string;
		remaining: number;
	}>;
}

export async function revokeSignupInvite(inviteId: string) {
	const res = await fetch(`/api/auth/v1/signup-invite/${inviteId}/revoke`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	return res.json();
}
