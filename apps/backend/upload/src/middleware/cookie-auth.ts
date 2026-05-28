import { uploadConfig } from "@be/upload/upload.config";

export async function validateSession(cookie: string | null) {
	const response = await fetch(
		`${uploadConfig.BASE_URL}/api/auth/v1/get-session`,
		{
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				Cookie: cookie || "",
			}),
		},
	);

	const session = (await response.json()) as {
		user?: {
			id: string;
		};
	};

	if (session?.user) {
		return {
			userId: session.user.id,
			authType: "auth" as const,
		};
	}

	return null;
}
