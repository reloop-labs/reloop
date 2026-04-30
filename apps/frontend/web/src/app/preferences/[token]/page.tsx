import type { Metadata } from "next";
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

const API_BASE = process.env.INTERNAL_API_URL || "http://localhost:8014/api/contacts";

async function fetchPreferencesData(token: string): Promise<PreferencesData | null> {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const data = await fetchPreferencesData(token);
  const orgName = data?.organization?.name ?? "Reloop";
  return {
    title: `Email Preferences · ${orgName}`,
    description: `Manage your email subscription preferences for ${orgName}.`,
    robots: { index: false, follow: false },
  };
}

export default async function PreferencesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await fetchPreferencesData(token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
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
          <h1 className="mb-3 font-semibold text-xl text-text-strong-950">
            Link expired or invalid
          </h1>
          <p className="text-text-sub-600 text-sm leading-6">
            This preferences link has expired or is no longer valid. Please check your
            email for a newer link, or contact the sender to request an updated one.
          </p>
        </div>
      </div>
    );
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
