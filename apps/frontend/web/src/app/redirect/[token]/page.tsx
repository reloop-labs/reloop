"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectPage() {
	const { token } = useParams<{ token: string }>();
	const router = useRouter();

	useEffect(() => {
		async function track() {
			let destinationUrl: string | null = null;

			try {
				const json = Buffer.from(token, "base64url").toString("utf-8");
				const payload = JSON.parse(json) as { url?: string };
				if (payload.url) {
					destinationUrl = payload.url;
				}
			} catch {}

			const siteUrl = (process.env.NEXT_PUBLIC_URL || "https://local.reloop.sh").replace(/\/+$/, "");

			try {
				const res = await fetch(`${siteUrl}/api/mail/v1/track/click/${token}`, {
					method: "GET",
					redirect: "manual",
				});

				const isRedirect = res.status >= 300 && res.status < 400;
				if (res.ok || isRedirect) {
					const location = res.headers.get("location");
					if (location) destinationUrl = location;
				}
			} catch {}

			window.location.href = destinationUrl ?? "/";
		}

		track();
	}, [token, router]);

	return (
		<div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black">
			<svg
				className="h-8 w-8 animate-spin text-white/60"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				/>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				/>
			</svg>
			<p className="font-medium text-sm text-white/50 tracking-wide">
				Redirecting...
			</p>
		</div>
	);
}
