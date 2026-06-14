"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { useCallback, useEffect, useState } from "react";

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

function isSubscribed(
	status: ChannelData["status"],
	defaultSubscription: "opt_in" | "opt_out",
) {
	if (status === "enrolled") return true;
	if (status === "unenrolled") return false;
	// "none" — fall back to default
	return defaultSubscription === "opt_in";
}

function Checkbox({ checked }: { checked: boolean }) {
	return (
		<div
			className={cn(
				"flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all duration-150",
				checked ? "bg-white" : "border border-white/25 bg-transparent",
			)}
		>
			{checked && (
				<svg
					className="h-2.5 w-2.5 text-black"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={3}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			)}
		</div>
	);
}

export function PreferencesContent({
	token,
	contact,
	organization,
	channels,
}: Props) {
	// Local state for checkboxes
	const [checked, setChecked] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(
			channels.map((t) => [
				t.id,
				isSubscribed(t.status, t.defaultSubscription),
			]),
		),
	);

	// Baseline state to track what's currently saved on the server
	const [baseline, setBaseline] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(
			channels.map((t) => [
				t.id,
				isSubscribed(t.status, t.defaultSubscription),
			]),
		),
	);

	const [saveState, setSaveState] = useState<
		"idle" | "saving" | "saved" | "error"
	>("idle");
	const [unsubscribeAllState, setUnsubscribeAllState] = useState<
		"idle" | "confirming" | "loading" | "done"
	>("idle");

	const handleUpdate = useCallback(async () => {
		// Only update channels that have changed from the baseline
		const changedChannels = channels.filter(
			(c) => checked[c.id] !== baseline[c.id],
		);

		if (changedChannels.length === 0) {
			setSaveState("saved");
			setTimeout(() => setSaveState("idle"), 2000);
			return;
		}

		setSaveState("saving");
		try {
			const updates = changedChannels.map(async (channel) => {
				const targetSubscribed = checked[channel.id];
				const res = await fetch(
					`/api/contacts/v1/preferences/update/${token}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							channelId: channel.id,
							subscribe: targetSubscribed,
						}),
					},
				);
				if (!res.ok) throw new Error("Failed to update " + channel.name);
			});

			await Promise.all(updates);

			// Update baseline after successful save
			setBaseline({ ...checked });
			setSaveState("saved");
			setTimeout(() => setSaveState("idle"), 2000);
		} catch (error) {
			console.error(error);
			setSaveState("error");
			setTimeout(() => setSaveState("idle"), 3000);
		}
	}, [token, checked, channels, baseline]);

	const handleUnsubscribeAll = useCallback(async () => {
		if (unsubscribeAllState === "confirming") {
			setUnsubscribeAllState("loading");
			try {
				const res = await fetch(
					`/api/contacts/v1/preferences/unsubscribe-all/${token}`,
					{
						method: "POST",
					},
				);
				if (!res.ok) throw new Error("Failed");

				// Update local state and baseline
				const unsubscribedState = Object.fromEntries(
					channels.map((t) => [t.id, false]),
				);
				setChecked(unsubscribedState);
				setBaseline(unsubscribedState);
				setUnsubscribeAllState("done");
				setTimeout(() => setUnsubscribeAllState("idle"), 3000);
			} catch {
				setUnsubscribeAllState("idle");
			}
		} else {
			setUnsubscribeAllState("confirming");
			setTimeout(() => {
				setUnsubscribeAllState((s) => (s === "confirming" ? "idle" : s));
			}, 4000);
		}
	}, [token, unsubscribeAllState, channels]);

	const displayName = contact.firstName
		? `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`
		: contact.email;

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#0d0f14] px-4 py-12">
			<div className="w-full max-w-[450px]">
				{/* Phone-style dark card */}
				<div className="relative overflow-hidden">
					{/* Logo Section */}
					<div className="mb-8 flex justify-center">
						<Logo className="h-20" />
					</div>
					{/* Heading */}
					<div className="mb-8 text-center">
						<h1 className="font-bold text-2xl text-white leading-tight tracking-tight">
							Do you want to unsubscribe?
						</h1>
						<p className="mt-3 text-[15px] text-white/50">
							Hi {contact.firstName || "there"} — confirm preferences for{" "}
							<span className="font-medium text-white/80">
								{organization.name}
							</span>
						</p>
					</div>

					{/* Channels List */}
					{channels.length === 0 ? (
						<div className="mb-8 flex flex-col items-center gap-2 rounded-2xl border border-white/10 border-dashed py-10 text-center">
							<p className="text-sm text-white/30">
								No subscription options available.
							</p>
						</div>
					) : (
						<div className="mb-8 space-y-1">
							{channels.map((channel) => (
								<button
									key={channel.id}
									type="button"
									onClick={() =>
										setChecked((prev) => ({
											...prev,
											[channel.id]: !prev[channel.id],
										}))
									}
									className={cn(
										"flex w-full gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-200",
										"hover:bg-white/5 active:bg-white/10",
									)}
								>
									<Checkbox checked={checked[channel.id] ?? false} />
									<div className="-mt-0.5 min-w-0 flex-1">
										<p className="font-semibold text-[15px] text-white leading-5">
											{channel.name}
										</p>
										{channel.description && (
											<p className="mt-1 truncate text-white/40 text-xs">
												{channel.description}
											</p>
										)}
									</div>
								</button>
							))}
						</div>
					)}

					{/* Update Button */}
					<button
						type="button"
						onClick={handleUpdate}
						disabled={saveState === "saving"}
						className={cn(
							"flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-[15px] transition-all duration-200 active:scale-[0.98]",
							saveState === "saved"
								? "bg-green-500/20 text-green-400"
								: saveState === "error"
									? "bg-red-500/20 text-red-400"
									: "bg-white text-black hover:bg-white/90 disabled:opacity-50",
						)}
					>
						{saveState === "saving" && (
							<Icon name="spinner" className="h-4 w-4 animate-spin" />
						)}
						{saveState === "saved"
							? "✓ Updated!"
							: saveState === "error"
								? "Failed to update"
								: "Update Preferences"}
					</button>

					{/* Or Divider */}
					<div className="my-6 flex items-center gap-4">
						<div className="h-px flex-1 bg-white/10" />
						<span className="font-medium text-[11px] text-white/20 uppercase tracking-widest">
							Or
						</span>
						<div className="h-px flex-1 bg-white/10" />
					</div>

					{/* Unsubscribe All Button */}
					<button
						type="button"
						onClick={handleUnsubscribeAll}
						disabled={unsubscribeAllState === "loading"}
						className={cn(
							"w-full rounded-2xl border border-white/10 py-4 font-bold text-[15px] text-white/70 transition-all duration-200",
							"hover:bg-white/5 hover:text-white active:scale-[0.98] disabled:opacity-50",
							unsubscribeAllState === "confirming"
								? "border-red-500/30 bg-red-500/10 text-red-400"
								: "",
						)}
					>
						{unsubscribeAllState === "confirming"
							? "Click again to confirm"
							: unsubscribeAllState === "loading"
								? "Unsubscribing..."
								: unsubscribeAllState === "done"
									? "✓ Unsubscribed from all"
									: "Unsubscribe All"}
					</button>

					{/* Footer */}
					<div className="mt-10 flex flex-col items-center gap-4">
						<div className="flex items-center justify-center gap-2">
							<span className="text-[11px] text-white/25">Powered by</span>
							<div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/5 shadow-inner">
								<Logo className="h-3 w-3" />
							</div>
							<span className="font-semibold text-[11px] text-white/40 tracking-tight">
								Reloop
							</span>
						</div>
						<p className="text-center text-[11px] text-white/20 leading-relaxed">
							Managing preferences for
							<br />
							<span className="text-white/40">{contact.email}</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
