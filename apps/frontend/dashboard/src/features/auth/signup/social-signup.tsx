import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";
import { GoogleLogo } from "#/features/auth/google-logo";
import { SignupForm } from "#/features/auth/signup/signup-form";

/** Public path for OAuth return (includes app basepath). */
function signupCallbackURL(inviteId?: string) {
	const params = new URLSearchParams();
	if (inviteId) params.set("inviteId", inviteId);
	const qs = params.toString();
	return qs ? `/dashboard/signup?${qs}` : "/dashboard/signup";
}

export function SocialSignup({
	inviteId,
	onEmailLoadingChange,
	onEmailCanSubmitChange,
}: {
	/** Organization Invitation id — preserved through OAuth callback. */
	inviteId?: string;
	onEmailLoadingChange?: (loading: boolean) => void;
	onEmailCanSubmitChange?: (canSubmit: boolean) => void;
}) {
	const [loading, setLoading] = useState<{
		name: "google" | "github" | "email";
		loading: boolean;
	}>({ name: "email", loading: false });

	useEffect(() => {
		const handlePageShow = (event: PageTransitionEvent) => {
			if (event.persisted) {
				setLoading({ name: "email", loading: false });
			}
		};
		window.addEventListener("pageshow", handlePageShow);
		return () => {
			window.removeEventListener("pageshow", handlePageShow);
		};
	}, []);
	const [, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });

	const socialBusy = loading.loading && loading.name !== "email";

	return (
		<>
			<div className="grid grid-cols-2 gap-2.5">
				<Button.Root
					disabled={loading.loading}
					variant="neutral"
					mode="stroke"
					className="relative flex h-10 w-full items-center justify-center gap-2 rounded-xl font-medium text-sm"
					onClick={async () => {
						try {
							setLoading({ name: "google", loading: true });
							await authClient.signIn.social({
								provider: "google",
								callbackURL: signupCallbackURL(inviteId),
							});
						} catch {
							setLoading({ name: "google", loading: false });
							setError({
								name: "google",
								error: "Failed to signup with Google",
							});
						}
					}}
				>
					{loading.name === "google" && loading.loading ? (
						<Spinner color="currentColor" size={16} />
					) : (
						<GoogleLogo className="h-4 w-4 shrink-0" />
					)}
					<span>Google</span>
				</Button.Root>
				<Button.Root
					disabled={loading.loading}
					variant="neutral"
					mode="stroke"
					className="relative flex h-10 w-full items-center justify-center gap-2 rounded-xl font-medium text-sm"
					onClick={async () => {
						try {
							setLoading({ name: "github", loading: true });
							await authClient.signIn.social({
								provider: "github",
								callbackURL: signupCallbackURL(inviteId),
							});
						} catch {
							setLoading({ name: "github", loading: false });
							setError({
								name: "github",
								error: "Failed to signup with GitHub",
							});
						}
					}}
				>
					{loading.name === "github" && loading.loading ? (
						<Spinner color="currentColor" size={16} />
					) : (
						<Icon name="github" className="h-4 w-4 shrink-0" />
					)}
					<span>GitHub</span>
				</Button.Root>
			</div>

			{/* OR divider between social and email */}
			<div className="flex w-full items-center gap-3 pb-1">
				<div className="h-px flex-1 border-stroke-soft-200 border-t border-dashed dark:border-stroke-soft-100/40" />
				<span className="shrink-0 font-medium text-[11px] text-text-soft-400 uppercase tracking-wide">
					or
				</span>
				<div className="h-px flex-1 border-stroke-soft-200 border-t border-dashed dark:border-stroke-soft-100/40" />
			</div>

			{/* Email field only — Create account is the shared page CTA */}
			<SignupForm
				disabled={socialBusy}
				onLoadingChange={(isLoading) => {
					setLoading({ name: "email", loading: isLoading });
					onEmailLoadingChange?.(isLoading);
				}}
				onCanSubmitChange={onEmailCanSubmitChange}
			/>
		</>
	);
}
