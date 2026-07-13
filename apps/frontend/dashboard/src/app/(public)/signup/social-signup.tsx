"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SocialSignup({
	onContinueWithEmail,
	inviteId,
}: {
	onContinueWithEmail: () => void;
	/** Organization Invitation id — preserved through OAuth callback. */
	inviteId?: string;
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

	const buildCallbackURL = () => {
		const params = new URLSearchParams();
		if (inviteId) params.set("inviteId", inviteId);
		const qs = params.toString();
		return qs ? `/signup?${qs}` : "/dashboard";
	};

	return (
		<>
			<div className="grid grid-cols-1 gap-2">
				<Button.Root
					disabled={loading.loading}
					variant="neutral"
					className="relative h-11 w-full rounded-2xl!"
					onClick={async () => {
						try {
							setLoading({ name: "google", loading: true });
							await authClient.signIn.social({
								provider: "google",
								callbackURL: buildCallbackURL(),
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
						<Spinner color="var(--text-strong-950)" size={16} />
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
						>
							<path
								fill="#4280EF"
								d="M14.117 7.661c0-.456-.045-.926-.118-1.368H7.63v2.604h3.648a3.07 3.07 0 0 1-1.353 2.044l2.177 1.692c1.28-1.192 2.015-2.927 2.015-4.972"
							/>
							<path
								fill="#34A353"
								d="M7.63 14.252c1.824 0 3.354-.604 4.472-1.633l-2.177-1.677c-.603.412-1.383.647-2.295.647-1.765 0-3.25-1.191-3.794-2.78L1.6 10.53a6.74 6.74 0 0 0 6.03 3.722"
							/>
							<path
								fill="#F6B704"
								d="M3.836 8.794a4.1 4.1 0 0 1 0-2.588L1.6 4.47a6.76 6.76 0 0 0 0 6.06z"
							/>
							<path
								fill="#E54335"
								d="M7.63 3.426A3.68 3.68 0 0 1 10.22 4.44L12.146 2.5A6.5 6.5 0 0 0 7.63.749a6.74 6.74 0 0 0-6.03 3.72l2.236 1.736c.544-1.603 2.03-2.78 3.794-2.78"
							/>
						</svg>
					)}
					Continue with Google
				</Button.Root>
				<Button.Root
					disabled={loading.loading}
					mode="lighter"
					variant="neutral"
					className="relative h-11 w-full rounded-2xl!"
					onClick={async () => {
						try {
							setLoading({ name: "github", loading: true });
							await authClient.signIn.social({
								provider: "github",
								callbackURL: buildCallbackURL(),
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
						<Spinner color="var(--text-strong-950)" size={16} />
					) : (
						<Icon name="github" className="h-5 w-5" />
					)}
					Continue with GitHub
				</Button.Root>
				<Button.Root
					disabled={loading.loading}
					mode="lighter"
					variant="neutral"
					className="relative h-11 w-full rounded-2xl!"
					onClick={onContinueWithEmail}
				>
					<Icon name="social-mail" className="h-[17.5px] w-[17.5px]" />
					Continue with Email
				</Button.Root>
			</div>
			<p className="pt-5 text-center font-medium text-[13px] text-text-sub-600">
				By creating an account, you agree to our <br />
				<a
					href="/terms"
					className={LinkButton.linkButtonVariants({
						variant: "black",
					}).root({ className: "text-xs!" })}
				>
					Terms of Service
				</a>{" "}
				and{" "}
				<a
					href="/privacy"
					className={LinkButton.linkButtonVariants({
						variant: "black",
					}).root({ className: "text-xs!" })}
				>
					Privacy Policy
				</a>
			</p>
			<p className="pt-3 text-center font-medium text-[13px] text-text-sub-600">
				Already have an account?{" "}
				<Link
					href={inviteId ? `/login?inviteId=${inviteId}` : "/login"}
					className={LinkButton.linkButtonVariants({
						variant: "black",
					}).root({ className: "text-[13px]!" })}
				>
					Login
				</Link>
			</p>
		</>
	);
}
