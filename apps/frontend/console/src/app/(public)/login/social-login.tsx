"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";

export function SocialLogin({
	onContinueWithEmail,
}: {
	onContinueWithEmail: () => void;
}) {
	const [lastLoggedIn, setLastLoggedIn] = useState<string | undefined>(
		undefined,
	);

	useEffect(() => {
		setLastLoggedIn(authClient.getLastUsedLoginMethod() || undefined);
	}, []);

	const [loading, setLoading] = useState<{
		name: "google" | "github" | "email";
		loading: boolean;
	}>({ name: "email", loading: false });

	const loginMethods = [
		{
			name: "google" as const,
			label: "Continue with Google",
			defaultMode: "filled" as const,
			icon:
				loading.name === "google" && loading.loading ? (
					<Spinner color="var(--text-white-0)" size={16} />
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4"
						fill="none"
						aria-hidden
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
				),
			onClick: async () => {
				try {
					setLoading({ name: "google", loading: true });
					await authClient.signIn.social({
						provider: "google",
						callbackURL: "/console",
					});
				} catch {
					setLoading({ name: "google", loading: false });
				}
			},
		},
		{
			name: "github" as const,
			label: "Continue with GitHub",
			defaultMode: "lighter" as const,
			icon:
				loading.name === "github" && loading.loading ? (
					<Spinner color="var(--text-white-0)" size={16} />
				) : (
					<Icon name="github" className="h-5 w-5" />
				),
			onClick: async () => {
				try {
					setLoading({ name: "github", loading: true });
					await authClient.signIn.social({
						provider: "github",
						callbackURL: "/console",
					});
				} catch {
					setLoading({ name: "github", loading: false });
				}
			},
		},
		{
			defaultMode: "lighter" as const,
			name: "email" as const,
			label: "Continue with Email",
			icon: <Icon name="social-mail" className="h-[17.5px] w-[17.5px]" />,
			onClick: onContinueWithEmail,
		},
	];

	const sortedMethods = [...loginMethods].sort((a, b) => {
		if (a.name === lastLoggedIn) return -1;
		if (b.name === lastLoggedIn) return 1;
		return 0;
	});

	return (
		<div className="grid grid-cols-1 gap-2">
			{sortedMethods.map((method) => (
				<Button.Root
					key={method.name}
					disabled={loading.loading}
					variant="neutral"
					mode={
						lastLoggedIn
							? lastLoggedIn === method.name
								? "filled"
								: "lighter"
							: method.defaultMode
					}
					className="relative h-11 w-full rounded-2xl!"
					onClick={method.onClick}
				>
					{method.icon}
					{method.label}
				</Button.Root>
			))}
		</div>
	);
}
