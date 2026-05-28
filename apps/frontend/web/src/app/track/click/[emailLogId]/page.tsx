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

	let shouldRedirect = false;

	if (url) {
		const apiBaseUrl =
			process.env.NEXT_PUBLIC_API_URL || "https://local.reloop.sh/api";
		let trackingEndpoint = `${apiBaseUrl}/mail/v1/track/click/${emailLogId}?url=${encodeURIComponent(
			url,
		)}`;
		if (sig) {
			trackingEndpoint += `&sig=${sig}`;
		}

		try {
			// Notify backend to track the click event
			const res = await fetch(trackingEndpoint, {
				method: "GET",
				redirect: "manual",
			});
			if (res.ok) {
				shouldRedirect = true;
			} else {
				console.error("Tracking verification failed with status:", res.status);
			}
		} catch (error) {
			console.error("Failed to track click event:", error);
		}
	}

	if (shouldRedirect && url) {
		redirect(url);
	} else {
		redirect("/");
	}
}
