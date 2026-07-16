import { redirect } from "next/navigation";
import { Suspense } from "react";

interface RedirectPageProps {
	params: Promise<{ token: string }>;
}

async function RedirectBody({ params }: RedirectPageProps) {
	const { token } = await params;
	let destinationUrl: string | null = null;

	// Decode token to get destination URL (server-safe Buffer usage)
	try {
		const json = Buffer.from(token, "base64url").toString("utf-8");
		const payload = JSON.parse(json) as { url?: string };
		if (payload.url) {
			destinationUrl = payload.url;
		}
	} catch {
		// Token may only be valid after the tracking endpoint resolves it.
	}

	const siteUrl = (
		process.env.NEXT_PUBLIC_URL || "https://local.reloop.sh"
	).replace(/\/+$/, "");

	try {
		// Call tracking endpoint server-to-server
		const res = await fetch(`${siteUrl}/api/mail/v1/track/click/${token}`, {
			method: "GET",
			redirect: "manual",
			cache: "no-store",
		});

		const isRedirect = res.status >= 300 && res.status < 400;
		if (res.ok || isRedirect) {
			const location = res.headers.get("location");
			if (location) {
				destinationUrl = location;
			}
		}
	} catch {
		// Fall through to decoded URL or home.
	}

	redirect(destinationUrl ?? "/");
	return null;
}

export default function RedirectPage({ params }: RedirectPageProps) {
	return (
		<Suspense fallback={null}>
			<RedirectBody params={params} />
		</Suspense>
	);
}
