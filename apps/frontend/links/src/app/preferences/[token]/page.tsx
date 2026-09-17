import {
	PreferenceFallback,
	PreferenceInvalid,
} from "@reloop/links/components/preference-shell";
import { fetchPreferencesData } from "@reloop/links/lib/preferences-data";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PreferencesContent } from "./preferences-content";

export const metadata: Metadata = {
	title: "Email Preferences",
	description: "Manage your email subscription preferences.",
	robots: { index: false, follow: false },
};

async function PreferencesBody({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	// cacheComponents/PPR otherwise prerenders this page without a real
	// token and caches the "expired" shell for every visitor.
	await connection();
	const { token } = await params;
	const data = await fetchPreferencesData(token);

	if (!data) {
		return (
			<PreferenceInvalid
				title="Link expired or invalid"
				description="This preferences link has expired or is no longer valid. Please check your email for a newer link, or contact the sender for an updated one."
			/>
		);
	}

	// No public channels: skip the empty preference center and unsubscribe
	// at the main list on the dedicated unsubscribe page.
	if (data.channels.length === 0) {
		redirect(`/preferences/unsubscribe/${token}`);
	}

	return (
		<PreferencesContent
			token={token}
			contact={data.contact}
			organization={data.organization}
			channels={data.channels}
		/>
	);
}

export default function PreferencesPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	return (
		<Suspense fallback={<PreferenceFallback />}>
			<PreferencesBody params={params} />
		</Suspense>
	);
}
