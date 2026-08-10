import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleLogo } from "#/features/auth/google-logo";

/** Public path for OAuth return (includes app basepath). */
function loginCallbackURL(inviteId?: string, redirectTo?: string) {
	if (inviteId) {
		return `/dashboard/login?inviteId=${encodeURIComponent(inviteId)}`;
	}
	if (redirectTo) {
		return `/dashboard/login?redirectTo=${encodeURIComponent(redirectTo)}`;
	}
	return "/dashboard/login";
}

export function SocialLogin({
	onContinueWithEmail,
	inviteId,
	redirectTo,
}: {
	onContinueWithEmail: () => void;
	inviteId?: string;
	redirectTo?: string;
}) {
	const [lastLoggedIn, setLastLoggedIn] = useState<string | undefined>(
		undefined,
	);

	useEffect(() => {
		setLastLoggedIn(authClient.getLastUsedLoginMethod() || undefined);

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

	const [loading, setLoading] = useState<{
		name: "google" | "github" | "email";
		loading: boolean;
	}>({ name: "email", loading: false });
	const [, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });

	const loginMethods = [
		{
			name: "google" as const,
			label: "Continue with Google",
			icon:
				loading.name === "google" && loading.loading ? (
					<Spinner color="currentColor" size={16} />
				) : (
					<GoogleLogo className="h-4 w-4 shrink-0" />
				),
			onClick: async () => {
				try {
					setLoading({ name: "google", loading: true });
					await authClient.signIn.social({
						provider: "google",
						callbackURL: loginCallbackURL(inviteId, redirectTo),
					});
				} catch {
					setLoading({ name: "google", loading: false });
					setError({
						name: "google",
						error: "Failed to login with Google",
					});
				}
			},
		},
		{
			name: "github" as const,
			label: "Continue with GitHub",
			icon:
				loading.name === "github" && loading.loading ? (
					<Spinner color="currentColor" size={16} />
				) : (
					<Icon name="github" className="h-4 w-4 shrink-0" />
				),
			onClick: async () => {
				try {
					setLoading({ name: "github", loading: true });
					await authClient.signIn.social({
						provider: "github",
						callbackURL: loginCallbackURL(inviteId, redirectTo),
					});
				} catch {
					setLoading({ name: "github", loading: false });
					setError({
						name: "github",
						error: "Failed to login with GitHub",
					});
				}
			},
		},
		{
			name: "email" as const,
			label: "Continue with Email",
			icon: <Icon name="social-mail" className="h-4 w-4 shrink-0" />,
			onClick: onContinueWithEmail,
		},
	];

	const sortedMethods = [...loginMethods].sort((a, b) => {
		if (a.name === lastLoggedIn) return -1;
		if (b.name === lastLoggedIn) return 1;
		return 0;
	});

	return (
		<>
			<div className="grid grid-cols-1 gap-2.5">
				{sortedMethods.map((method) => {
					const isLastUsed = lastLoggedIn === method.name;
					const isPrimary = lastLoggedIn ? isLastUsed : method.name === "email";

					if (isPrimary) {
						return (
							<FancyButton.Root
								key={method.name}
								disabled={loading.loading}
								variant="blue"
								size="medium"
								className="relative h-10 w-full justify-center gap-2.5 rounded-xl font-medium text-sm"
								onClick={method.onClick}
							>
								{method.icon}
								<span>{method.label}</span>
								{isLastUsed && (
									<span className="-top-2.5 absolute right-3 rounded-full bg-primary-base px-2 py-0.5 font-semibold text-[10px] text-static-white uppercase tracking-wider shadow-sm">
										Last used
									</span>
								)}
							</FancyButton.Root>
						);
					}

					return (
						<Button.Root
							key={method.name}
							disabled={loading.loading}
							variant="neutral"
							mode="stroke"
							className="relative flex h-10 w-full items-center justify-center gap-2.5 rounded-xl font-medium text-sm"
							onClick={method.onClick}
						>
							{method.icon}
							<span>{method.label}</span>
						</Button.Root>
					);
				})}
			</div>
			<p className="pt-5 text-center font-medium text-[13px] text-text-sub-600">
				Don&apos;t have an account?{" "}
				<Link
					href={"/signup"}
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
