import { redirect } from "next/navigation";

interface ClickTrackingPageProps {
	params: Promise<{ emailLogId: string }>;
	searchParams: Promise<{ url?: string; sig?: string }>;
}

export default async function ClickTrackingPage({
	params,
	searchParams,
}: ClickTrackingPageProps) {
	const { emailLogId } = await params;
	const { url, sig } = await searchParams;

	let redirectUrl: string | null = null;

	if (url) {
		const cleanUrl = url.replace(/&amp;/gi, "&");
		const apiBaseUrl =
			process.env.NEXT_PUBLIC_API_URL || "https://local.reloop.sh/api";
		let trackingEndpoint = `${apiBaseUrl}/mail/v1/track/click/${emailLogId}?url=${encodeURIComponent(
			cleanUrl,
		)}`;
		if (sig) {
			trackingEndpoint += `&sig=${sig}`;
		}

		try {
			const res = await fetch(trackingEndpoint, {
				method: "GET",
				redirect: "manual",
			});

			const isRedirect = res.status >= 300 && res.status < 400;
			if (res.ok || isRedirect) {
				redirectUrl = res.headers.get("location") || cleanUrl;
			} else {
				console.error("Tracking verification failed with status:", res.status);
			}
		} catch (error) {
			console.error("Failed to track click event:", error);
		}
	}

	if (redirectUrl) {
		redirect(redirectUrl);
	} else {
		redirect("/");
	}
}
