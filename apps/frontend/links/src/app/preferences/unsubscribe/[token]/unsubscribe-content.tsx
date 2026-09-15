"use client";

import { PreferenceShell } from "@reloop/links/components/preference-shell";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useCallback, useState } from "react";
import { unsubscribeContactAction } from "./actions";

interface Props {
	token: string;
	contact: {
		email: string;
		firstName: string | null;
		lastName: string | null;
		status?: string;
	};
	organization: {
		name: string;
	};
	preferencesHref: string | null;
	initialState: "done" | "error";
}

export function UnsubscribeContent({
	token,
	contact,
	organization,
	preferencesHref,
	initialState,
}: Props) {
	const [state, setState] = useState<"loading" | "done" | "error">(
		initialState,
	);

	const unsubscribe = useCallback(async () => {
		setState("loading");
		const ok = await unsubscribeContactAction(token);
		setState(ok ? "done" : "error");
	}, [token]);

	return (
		<PreferenceShell email={contact.email} emailLabel="For">
			<div className="mb-8 text-center">
				<h1 className="font-bold text-2xl text-white leading-tight tracking-tight">
					{state === "done"
						? "You've been unsubscribed"
						: state === "error"
							? "Couldn't unsubscribe"
							: "Unsubscribing…"}
				</h1>
				<p className="mt-3 text-[15px] text-white/50">
					{state === "done"
						? `You won't receive emails from ${organization.name} at ${contact.email}.`
						: state === "error"
							? "Something went wrong. You can try again."
							: `Removing ${contact.email} from ${organization.name}.`}
				</p>
			</div>

			{state === "loading" ? (
				<div className="flex justify-center py-4">
					<Icon name="spinner" className="h-6 w-6 animate-spin text-white/50" />
				</div>
			) : null}

			{state === "error" ? (
				<FancyButton.Root
					type="button"
					onClick={() => void unsubscribe()}
					variant="blue"
					size="medium"
					className="w-full justify-center py-3 font-semibold"
				>
					Try again
				</FancyButton.Root>
			) : null}

			{state === "done" && preferencesHref ? (
				<p className="mt-6 text-center text-[13px] text-white/40">
					Want to keep some topics?{" "}
					<a
						href={preferencesHref}
						className="text-white/70 underline underline-offset-4 hover:text-white"
					>
						Manage preferences
					</a>
				</p>
			) : null}
		</PreferenceShell>
	);
}
