"use client";

import { authClient } from "@reloop/auth/client";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { useState } from "react";

export function SocialLogin({
	onContinueWithEmail,
}: {
	onContinueWithEmail: () => void;
}) {
	const lastLoggedIn = authClient.getLastUsedLoginMethod();
	const [loading, setLoading] = useState<{
		name: "google" | "github" | "email";
		loading: boolean;
	}>({ name: "email", loading: false });
	const [, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });

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
								callbackURL: "/dashboard",
							});
						} catch {
							setLoading({ name: "google", loading: false });
							setError({
								name: "google",
								error: "Failed to login with Google",
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
					{lastLoggedIn === "google" && (
						<p className="-top-[10px] -right-0 absolute rounded-full bg-primary-base px-2 py-0.5 font-medium text-background-base text-xs">
							Last used
						</p>
					)}
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
								callbackURL: "/dashboard",
							});
						} catch {
							setLoading({ name: "github", loading: false });
							setError({
								name: "github",
								error: "Failed to login with GitHub",
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
					{lastLoggedIn === "github" && (
						<div className="-translate-y-1/2 absolute top-1/2 right-3">
							<Badge.Root variant="lighter" color="gray">
								Last used
							</Badge.Root>
						</div>
					)}
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
					{lastLoggedIn === "email" && (
						<div className="-translate-y-1/2 absolute top-1/2 right-3">
							<Badge.Root variant="lighter" color="gray">
								Last used
							</Badge.Root>
						</div>
					)}
				</Button.Root>
			</div>
			<p className="pt-5 text-center font-medium text-[13px] text-text-sub-600">
				Don’t have an account?{" "}
				<Link
					href="/signup"
					className={LinkButton.linkButtonVariants({
						variant: "black",
					}).root({ className: "text-[13px]!" })}
				>
					Sign up
				</Link>
			</p>
		</>
	);
}
