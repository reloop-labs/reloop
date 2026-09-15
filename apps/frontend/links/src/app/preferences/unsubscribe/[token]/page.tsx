import {
	PreferenceFallback,
	PreferenceInvalid,
} from "@reloop/links/components/preference-shell";
import { fetchPreferencesData } from "@reloop/links/lib/preferences-data";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { UnsubscribeContent } from "./unsubscribe-content";

export const metadata: Metadata = {
	title: "Unsubscribe",
	description: "Unsubscribe from this mailing list.",
	robots: { index: false, follow: false },
};

async function UnsubscribeBody({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	await connection();
	const { token } = await params;
	const data = await fetchPreferencesData(token);

	if (!data) {
		return (
			<PreferenceInvalid
				title="Link expired or invalid"
				description="This unsubscribe link has expired or is no longer valid. Please check your email for a newer link, or contact the sender for an updated one."
			/>
		);
	}

	return (
		<UnsubscribeContent
			token={token}
			contact={data.contact}
			organization={data.organization}
			preferencesHref={
				data.channels.length > 0 ? `/preferences/${token}` : null
			}
		/>
	);
}

export default function UnsubscribePage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	return (
		<Suspense fallback={<PreferenceFallback />}>
			<UnsubscribeBody params={params} />
		</Suspense>
	);
}
