"use client";

import { useCallback, useState } from "react";

interface ChannelData {
  id: string;
  name: string;
  description: string | null;
  defaultSubscription: "opt_in" | "opt_out";
  status: "enrolled" | "unenrolled" | "none";
}

interface Props {
  token: string;
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

type SaveState = "idle" | "saving" | "saved" | "error";

function isSubscribed(status: ChannelData["status"], defaultSubscription: "opt_in" | "opt_out") {
  if (status === "enrolled") return true;
  if (status === "unenrolled") return false;
  // "none" — fall back to default
  return defaultSubscription === "opt_in";
}

function Toggle({
  checked,
  onChange,
  saving,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  saving: boolean;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={saving}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <svg
        className="h-4 w-4 animate-spin text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Saving"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    );
  }
  if (state === "saved") {
    return (
      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Saved">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (state === "error") {
    return (
      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Error">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return null;
}

export function PreferencesContent({ token, contact, organization, channels }: Props) {
  const [channelStates, setChannelStates] = useState<
    Record<string, { subscribed: boolean; saveState: SaveState }>
  >(() =>
    Object.fromEntries(
      channels.map((t) => [
        t.id,
        {
          subscribed: isSubscribed(t.status, t.defaultSubscription),
          saveState: "idle" as SaveState,
        },
      ]),
    ),
  );

  const [unsubscribeAllState, setUnsubscribeAllState] = useState<
    "idle" | "confirming" | "loading" | "done"
  >("idle");

  const handleToggle = useCallback(
    async (channelId: string, subscribed: boolean) => {
      // Optimistic update
      setChannelStates((prev) => ({
        ...prev,
        [channelId]: { subscribed, saveState: "saving" },
      }));

      try {
        const res = await fetch(`/api/contacts/v1/preferences/update/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId, subscribe: subscribed }),
        });

        if (!res.ok) throw new Error("Failed to update");

        setChannelStates((prev) => ({
          ...prev,
          [channelId]: { subscribed, saveState: "saved" },
        }));

        // Reset to idle after 2s
        setTimeout(() => {
          setChannelStates((prev) => ({
            ...prev,
            [channelId]: { ...prev[channelId], saveState: "idle" },
          }));
        }, 2000);
      } catch {
        // Revert on error
        setChannelStates((prev) => ({
          ...prev,
          [channelId]: { subscribed: !subscribed, saveState: "error" },
        }));
        setTimeout(() => {
          setChannelStates((prev) => ({
            ...prev,
            [channelId]: { ...prev[channelId], saveState: "idle" },
          }));
        }, 3000);
      }
    },
    [token],
  );

  const handleUnsubscribeAll = useCallback(async () => {
    if (unsubscribeAllState === "confirming") {
      setUnsubscribeAllState("loading");
      try {
        const res = await fetch(`/api/contacts/v1/preferences/unsubscribe-all/${token}`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Failed");

        // Mark all as unsubscribed
        setChannelStates((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, state]) => [
              id,
              { ...state, subscribed: false, saveState: "saved" as SaveState },
            ]),
          ),
        );
        setUnsubscribeAllState("done");
      } catch {
        setUnsubscribeAllState("idle");
      }
    } else {
      setUnsubscribeAllState("confirming");
      setTimeout(() => {
        setUnsubscribeAllState((s) => (s === "confirming" ? "idle" : s));
      }, 4000);
    }
  }, [token, unsubscribeAllState]);

  const displayName =
    contact.firstName
      ? `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`
      : contact.email;

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0d0f14]">
      {/* Header */}
      <div className="border-b border-gray-200/80 bg-white/80 backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            {/* Reloop logo mark */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a1d23] dark:bg-white/10">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-text-strong-950">
              {organization.name}
            </span>
          </div>
          <span className="text-text-sub-600 text-xs">{contact.email}</span>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-semibold text-2xl text-text-strong-950">
            Email Preferences
          </h1>
          <p className="mt-1.5 text-sm text-text-sub-600 leading-6">
            Hi {displayName} — choose which emails you want to receive from{" "}
            <span className="font-medium text-text-strong-950">{organization.name}</span>.
            Your changes save automatically.
          </p>
        </div>

        {/* Channels */}
        {channels.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center dark:border-white/8 dark:bg-white/4">
            <p className="text-text-sub-600 text-sm">
              No subscription options are currently available.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/8 dark:bg-white/4">
            {channels.map((channel, idx) => {
              const state = channelStates[channel.id];
              const subscribed = state?.subscribed ?? false;
              const saveState = state?.saveState ?? "idle";

              return (
                <div
                  key={channel.id}
                  className={[
                    "flex items-center gap-4 px-5 py-4 transition-colors",
                    idx !== channels.length - 1
                      ? "border-b border-gray-100 dark:border-white/6"
                      : "",
                    subscribed
                      ? "bg-blue-50/40 dark:bg-blue-500/5"
                      : "",
                  ].join(" ")}
                >
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-text-strong-950">
                        {channel.name}
                      </span>
                      <SaveIndicator state={saveState} />
                    </div>
                    {channel.description && (
                      <p className="mt-0.5 text-text-sub-600 text-xs leading-5">
                        {channel.description}
                      </p>
                    )}
                  </div>

                  {/* Toggle */}
                  <div className="flex-shrink-0">
                    <Toggle
                      id={`channel-${channel.id}`}
                      checked={subscribed}
                      onChange={(val) => handleToggle(channel.id, val)}
                      saving={saveState === "saving"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Unsubscribe all */}
        {channels.length > 0 && (
          <div className="mt-8 text-center">
            {unsubscribeAllState === "done" ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ You've been unsubscribed from all channels.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleUnsubscribeAll}
                disabled={unsubscribeAllState === "loading"}
                className={[
                  "text-sm transition-colors",
                  unsubscribeAllState === "confirming"
                    ? "font-medium text-red-600 dark:text-red-400"
                    : "text-text-sub-600 underline underline-offset-2 hover:text-text-strong-950 dark:hover:text-white",
                  unsubscribeAllState === "loading" ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {unsubscribeAllState === "confirming"
                  ? "Click again to confirm — unsubscribe from all"
                  : unsubscribeAllState === "loading"
                    ? "Unsubscribing…"
                    : "Unsubscribe from all emails"}
              </button>
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="mt-10 text-center text-text-sub-600 text-xs leading-5">
          You're managing preferences for{" "}
          <span className="font-medium">{contact.email}</span>.{" "}
          {/* Future: add a "not you?" link */}
          Powered by{" "}
          <a
            href="https://reloop.sh"
            className="font-medium text-text-strong-950 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Reloop
          </a>
          .
        </p>
      </main>
    </div>
  );
}
