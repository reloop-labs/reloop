"use client";

import { cn } from "@reloop/ui/cn";
import { useState } from "react";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  defaultSubscription: "opt_in" | "opt_out";
  visibility: "private" | "public";
}

interface SubscriberPreviewProps {
  channel: Channel;
  /** Other public channels in the same org to show realistic context */
  siblingChannels?: Channel[];
  orgName?: string;
  contactEmail?: string;
}

function PreviewToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-blue-500" : "bg-[#e0e0e6] dark:bg-[#2a2d35]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function SubscriberPreview({
  channel,
  siblingChannels = [],
  orgName = "Your Organization",
  contactEmail = "subscriber@example.com",
}: SubscriberPreviewProps) {
  // Build the list of channels to show in the preview: current channel + siblings (public only)
  const allPreviewChannels = [
    channel,
    ...siblingChannels.filter((t) => t.id !== channel.id && t.visibility === "public"),
  ].slice(0, 5); // cap at 5 for the preview

  const initialStates = Object.fromEntries(
    allPreviewChannels.map((t) => [t.id, t.defaultSubscription === "opt_in"]),
  );
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(initialStates);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [saving, setSaving] = useState<string | null>(null);

  const handleToggle = (channelId: string, val: boolean) => {
    setSaving(channelId);
    setTimeout(() => {
      setToggleStates((prev) => ({ ...prev, [channelId]: val }));
      setSaving(null);
    }, 400);
  };

  const isDark = theme === "dark";

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-alpha-10">
            <svg
              className="h-3 w-3 text-text-sub-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="font-medium text-paragraph-sm text-text-strong-950">
            Subscriber Preview
          </span>
          <span className="rounded-md border border-stroke-soft-200 bg-neutral-alpha-10 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600">
            Interactive
          </span>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-0.5">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              theme === "light"
                ? "bg-neutral-alpha-10 text-text-strong-950"
                : "text-text-sub-600 hover:text-text-strong-950",
            )}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              theme === "dark"
                ? "bg-neutral-alpha-10 text-text-strong-950"
                : "text-text-sub-600 hover:text-text-strong-950",
            )}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            Dark
          </button>
        </div>
      </div>

      {/* Browser chrome mockup */}
      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 shadow-sm">
        {/* Browser bar */}
        <div className="flex items-center gap-3 border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          {/* URL bar */}
          <div className="flex flex-1 items-center gap-2 rounded-md border border-stroke-soft-200 bg-neutral-alpha-10 px-3 py-1.5">
            <svg
              className="h-3 w-3 flex-shrink-0 text-text-sub-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="font-mono text-[11px] text-text-sub-600">
              reloop.sh/preferences/
              <span className="text-text-strong-950">abc123…</span>
            </span>
          </div>
        </div>

        {/* Page preview */}
        <div
          className={cn(
            "min-h-[340px] transition-colors duration-300",
            isDark ? "bg-[#0d0f14]" : "bg-[#f8f9fb]",
          )}
        >
          {/* Preview inner header */}
          <div
            className={cn(
              "border-b px-6 py-3.5 transition-colors duration-300",
              isDark
                ? "border-white/8 bg-white/4"
                : "border-gray-200/80 bg-white/80",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md",
                    isDark ? "bg-white/10" : "bg-[#1a1d23]",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 fill-white"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </div>
                <span
                  className={cn(
                    "font-semibold text-xs",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  {orgName}
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px]",
                  isDark ? "text-white/40" : "text-gray-400",
                )}
              >
                {contactEmail}
              </span>
            </div>
          </div>

          {/* Preview body */}
          <div className="px-6 py-7">
            {/* Title */}
            <div className="mb-5">
              <h2
                className={cn(
                  "font-semibold text-base",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                Email Preferences
              </h2>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  isDark ? "text-white/50" : "text-gray-500",
                )}
              >
                Choose which emails you'd like to receive. Changes save automatically.
              </p>
            </div>

            {/* Channels list */}
            <div
              className={cn(
                "overflow-hidden rounded-xl border transition-colors duration-300",
                isDark ? "border-white/8 bg-white/4" : "border-gray-200 bg-white",
              )}
            >
              {allPreviewChannels.map((t, idx) => {
                const isChecked = toggleStates[t.id] ?? false;
                const isSaving = saving === t.id;
                const isCurrentChannel = t.id === channel.id;

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors duration-200",
                      idx !== allPreviewChannels.length - 1
                        ? isDark
                          ? "border-b border-white/6"
                          : "border-b border-gray-100"
                        : "",
                      isChecked
                        ? isDark
                          ? "bg-blue-500/5"
                          : "bg-blue-50/40"
                        : "",
                      // Highlight the current channel being viewed
                      isCurrentChannel
                        ? isDark
                          ? "ring-1 ring-inset ring-blue-500/20"
                          : "ring-1 ring-inset ring-blue-200"
                        : "",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "font-medium text-xs",
                            isDark ? "text-white/90" : "text-gray-900",
                          )}
                        >
                          {t.name}
                        </span>
                        {isCurrentChannel && (
                          <span
                            className={cn(
                              "rounded px-1 py-px font-medium text-[9px] uppercase tracking-wider",
                              isDark
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-blue-100 text-blue-600",
                            )}
                          >
                            This channel
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p
                          className={cn(
                            "mt-0.5 text-[11px] leading-4",
                            isDark ? "text-white/40" : "text-gray-500",
                          )}
                        >
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div className="relative flex-shrink-0">
                      {isSaving ? (
                        <div
                          className={cn(
                            "flex h-5 w-9 items-center justify-center rounded-full",
                            isDark ? "bg-white/10" : "bg-gray-100",
                          )}
                        >
                          <svg
                            className={cn(
                              "h-3 w-3 animate-spin",
                              isDark ? "text-white/40" : "text-gray-400",
                            )}
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
                        </div>
                      ) : (
                        <PreviewToggle
                          checked={isChecked}
                          onChange={(val) => handleToggle(t.id, val)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unsubscribe all footer */}
            <div className="mt-4 text-center">
              <span
                className={cn(
                  "cursor-pointer text-[11px] underline underline-offset-2 transition-colors",
                  isDark
                    ? "text-white/30 hover:text-white/60"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                Unsubscribe from all emails
              </span>
            </div>
          </div>
        </div>

        {/* Preview footer note */}
        <div className="flex items-center justify-between border-t border-stroke-soft-200 bg-bg-white-0 px-4 py-2.5">
          <p className="text-[10px] text-text-sub-600">
            {channel.visibility === "private" ? (
              <span className="flex items-center gap-1 text-warning-base">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                This channel is private — it won't appear on the preferences page
              </span>
            ) : (
              <span className="flex items-center gap-1 text-success-base">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                This channel is public — subscribers can see and manage it
              </span>
            )}
          </p>
          <span className="text-[10px] text-text-sub-600">
            {allPreviewChannels.filter((t) => toggleStates[t.id]).length} of{" "}
            {allPreviewChannels.length} subscribed
          </span>
        </div>
      </div>
    </div>
  );
}
