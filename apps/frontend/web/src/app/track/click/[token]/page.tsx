import { redirect } from "next/navigation";

interface ClickTrackingPageProps {
	params: Promise<{ token: string }>;
}

export default async function ClickTrackingPage({
	params,
}: ClickTrackingPageProps) {
	const { token } = await params;

	const apiBaseUrl =
		process.env.NEXT_PUBLIC_URL || "https://local.reloop.sh/api";
	const trackingEndpoint = `${apiBaseUrl}/mail/v1/track/click/${token}`;

	let redirectUrl: string | null = null;

	try {
		const res = await fetch(trackingEndpoint, {
			method: "GET",
			redirect: "manual",
		});

		const isRedirect = res.status >= 300 && res.status < 400;
		if (res.ok || isRedirect) {
			redirectUrl = res.headers.get("location") || null;
		} else {
			console.error("Tracking verification failed with status:", res.status);
		}
	} catch (error) {
		console.error("Failed to track click event:", error);
	}

	if (redirectUrl) {
		redirect(redirectUrl);
	} else {
		redirect("/");
	}
}
