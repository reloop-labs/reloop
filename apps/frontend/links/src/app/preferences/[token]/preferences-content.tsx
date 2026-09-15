"use client";

import { PreferenceShell } from "@reloop/links/components/preference-shell";
import type { ChannelData } from "@reloop/links/lib/preferences-data";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useCallback, useState } from "react";

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
	const [checked, setChecked] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(
			channels.map((t) => [
				t.id,
				isSubscribed(t.status, t.defaultSubscription),
			]),
		),
	);

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
				const res = await fetch("/api/contacts/v1/preferences/update", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						token,
						channelId: channel.id,
						subscribe: targetSubscribed,
					}),
				});
				if (!res.ok) throw new Error(`Failed to update ${channel.name}`);
			});

			await Promise.all(updates);

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
					"/api/contacts/v1/preferences/unsubscribe-all",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token }),
					},
				);
				if (!res.ok) throw new Error("Failed");

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

	return (
		<PreferenceShell email={contact.email}>
			<div className="mb-8 text-center">
				<h1 className="font-bold text-2xl text-white leading-tight tracking-tight">
					Manage your preferences
				</h1>
				<p className="mt-3 text-[15px] text-white/50">
					Hi {contact.firstName || "there"} — choose what you want from{" "}
					<span className="font-medium text-white/80">{organization.name}</span>
				</p>
			</div>

			{channels.length > 0 ? (
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
			) : null}

			{channels.length > 0 ? (
				<FancyButton.Root
					type="button"
					onClick={handleUpdate}
					disabled={saveState === "saving"}
					variant={
						saveState === "saved"
							? "success"
							: saveState === "error"
								? "destructive"
								: "blue"
					}
					size="medium"
					className="w-full justify-center py-3 font-semibold"
				>
					{saveState === "saving" && (
						<FancyButton.Icon
							as={Icon}
							name="spinner"
							className="animate-spin"
						/>
					)}
					{saveState === "saved"
						? "✓ Updated Preferences"
						: saveState === "error"
							? "Failed to update"
							: "Update Preferences"}
				</FancyButton.Root>
			) : null}

			{channels.length > 0 ? (
				<div className="my-5 flex items-center gap-4">
					<div className="h-px flex-1 bg-white/10" />
					<span className="font-semibold text-[10px] text-white/30 uppercase tracking-widest">
						Or
					</span>
					<div className="h-px flex-1 bg-white/10" />
				</div>
			) : null}

			<FancyButton.Root
				type="button"
				onClick={handleUnsubscribeAll}
				disabled={unsubscribeAllState === "loading"}
				variant={unsubscribeAllState === "confirming" ? "destructive" : "basic"}
				size="medium"
				className={cn(
					"w-full justify-center py-3 font-semibold",
					unsubscribeAllState === "confirming" &&
						"border-red-500/30 bg-red-500/10 text-red-400",
				)}
			>
				{unsubscribeAllState === "confirming"
					? "Click again to confirm"
					: unsubscribeAllState === "loading"
						? "Unsubscribing..."
						: unsubscribeAllState === "done"
							? "✓ Unsubscribed from all"
							: "Unsubscribe All"}
			</FancyButton.Root>
		</PreferenceShell>
	);
}
