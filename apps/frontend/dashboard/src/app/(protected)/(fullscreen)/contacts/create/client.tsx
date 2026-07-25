"use client";

import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { useSessionQuery } from "#/features/auth/session-query";
import { CreateContactPage } from "#/features/contacts/create";

export function CreateContactRouteClient() {
	const { data: session, isPending } = useSessionQuery();

	if (isPending || !session) {
		return <AuthSessionLoader />;
	}

	return <CreateContactPage />;
}
