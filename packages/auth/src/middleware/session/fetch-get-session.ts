type SessionUser = {
	id: string;
	role?: string | null;
	email?: string | null;
	name?: string | null;
	image?: string | null;
	activeOrganizationId?: string | null;
};

type GetSessionBody = {
	user?: SessionUser | null;
} | null;

export type FetchedUser = {
	id: string;
	role: string | null;
	email?: string;
	name?: string;
	image?: string;
	activeOrganizationId: string | null;
};

export async function fetchGetSession(
	cookie: string,
	baseUrl: string,
): Promise<FetchedUser | null> {
	const sessionUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/v1/get-session`;
	let response: Response;
	try {
		response = await fetch(sessionUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Cookie: cookie,
			},
		});
	} catch {
		return null;
	}

	if (!response.ok) return null;

	let body: GetSessionBody;
	try {
		body = (await response.json()) as GetSessionBody;
	} catch {
		return null;
	}

	const user = body?.user;
	if (!user?.id) return null;

	return {
		id: user.id,
		role: user.role ?? null,
		email: user.email ?? undefined,
		name: user.name ?? undefined,
		image: user.image ?? undefined,
		activeOrganizationId: user.activeOrganizationId ?? null,
	};
}
