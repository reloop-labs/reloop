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

	if (url && sig) {
		const apiBaseUrl =
			process.env.NEXT_PUBLIC_API_URL || "https://local.reloop.sh/api";
		const trackingEndpoint = `${apiBaseUrl}/mail/v1/track/click/${emailLogId}?url=${encodeURIComponent(
			url,
		)}&sig=${sig}`;

		try {
			// Notify backend to track the click event
			await fetch(trackingEndpoint, {
				method: "GET",
				redirect: "manual",
			});
		} catch (error) {
			console.error("Failed to track click event:", error);
		}

		// Redirect to target URL
		redirect(url);
	}

	redirect("/");
}
