import type { Metadata } from "next";
import { Suspense } from "react";
import { PreferencesContent } from "./preferences-content";

interface ChannelData {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription: "opt_in" | "opt_out";
	status: "enrolled" | "unenrolled" | "none";
}

interface PreferencesData {
	contact: {
		email: string;
		firstName: string | null;
		lastName: string | null;
	};
	organization: {
		name: string;
	};
	channels: ChannelData[];
}

const API_BASE =
	process.env.INTERNAL_API_URL || "http://localhost:8014/api/contacts";

async function fetchPreferencesData(
	token: string,
): Promise<PreferencesData | null> {
	try {
		const res = await fetch(`${API_BASE}/v1/preferences/data/${token}`, {
			cache: "no-store",
		});
		if (!res.ok) return null;
		return res.json();
	} catch {
		return null;
	}
}

export const metadata: Metadata = {
	title: "Email Preferences",
	description: "Manage your email subscription preferences.",
	robots: { index: false, follow: false },
};

function PreferencesFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
			<div className="w-full max-w-[450px]">
				<div className="animate-pulse space-y-6">
					<div className="mx-auto h-20 w-20 rounded-full bg-white/5" />
					<div className="mx-auto h-8 w-64 rounded-lg bg-white/5" />
					<div className="mx-auto h-4 w-48 rounded bg-white/5" />
					<div className="space-y-2">
						<div className="h-14 rounded-2xl bg-white/5" />
						<div className="h-14 rounded-2xl bg-white/5" />
						<div className="h-14 rounded-2xl bg-white/5" />
					</div>
					<div className="h-14 rounded-2xl bg-white/10" />
				</div>
			</div>
		</div>
	);
}

function PreferencesInvalid() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
			<div className="w-full max-w-[600px]">
				<div className="rounded-[32px] bg-[#111113] p-10 text-center shadow-2xl ring-1 ring-white/10">
					<div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
						<svg
							className="h-8 w-8 text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
							/>
						</svg>
					</div>
					<h1 className="mb-4 font-bold text-2xl text-white tracking-tight">
						Link expired or invalid
					</h1>
					<p className="text-[15px] text-white/50 leading-relaxed">
						This preferences link has expired or is no longer valid. Please check
						your email for a newer link, or contact the sender for an updated
						one.
					</p>
				</div>
			</div>
		</div>
	);
}

async function PreferencesBody({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;
	const data = await fetchPreferencesData(token);

	if (!data) {
		return <PreferencesInvalid />;
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
		<Suspense fallback={<PreferencesFallback />}>
			<PreferencesBody params={params} />
		</Suspense>
	);
}
