import { useRouter } from "next/navigation";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";

import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { sessionQueryOptions } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";
import { navigatePostAuth } from "#/utils/navigate-post-auth";
import { resolvePostAuthDestinationWithQuery } from "#/utils/post-auth-destination";

/**
 * Magic-link / auto-login landing page.
 *
 * OTP emails point at `/dashboard/verify?otpSent=…&otp=…` (see
 * `apps/backend/email/emails/otp.tsx`). This page signs in with the code
 * from the URL, refreshes the session cache, then routes post-auth.
 */
export function AutoLoginPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [otpSentEmail] = useQueryState(
		"otpSent",
		parseAsString.withDefault(""),
	);
	const [otpValue] = useQueryState("otp", parseAsString.withDefault(""));
	const [inviteId] = useQueryState("inviteId", parseAsString.withDefault(""));
	const [isVerifying, setIsVerifying] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const hasAttempted = useRef(false);

	useEffect(() => {
		const verify = async () => {
			if (hasAttempted.current) return;

			if (!otpSentEmail || !otpValue) {
				setIsVerifying(false);
				setError("Missing email or OTP in the link.");
				return;
			}

			hasAttempted.current = true;
			try {
				const { data, error: signInError } = await authClient.signIn.emailOtp({
					email: otpSentEmail,
					otp: otpValue,
				});

				if (data?.user.id) {
					// Same cache refresh path as manual OTP entry on /login.
					await queryClient.invalidateQueries({
						queryKey: queryKeys.auth.session(),
					});
					await queryClient.ensureQueryData(sessionQueryOptions());
					await queryClient.invalidateQueries({
						queryKey: queryKeys.auth.organizations(),
					});
					await queryClient.invalidateQueries({
						queryKey: queryKeys.auth.userInvitations(),
					});
					const destination = await resolvePostAuthDestinationWithQuery(
						queryClient,
						{ inviteId: inviteId || null },
					);
					await navigatePostAuth(router, destination);
					return;
				}

				setError(
					signInError?.message || "Failed to sign in. Please try manually.",
				);
				setIsVerifying(false);
			} catch {
				setError("An unexpected error occurred. Please try again.");
				setIsVerifying(false);
			}
		};

		void verify();
	}, [otpSentEmail, otpValue, inviteId, router, queryClient]);

	return (
		<div className="flex h-dvh flex-col items-center justify-center bg-bg-white-0 antialiased">
			<div className="w-full max-w-sm p-5 md:p-8">
				<div className="mt-8 text-center">
					{isVerifying ? (
						<div className="flex flex-col items-center gap-6">
							<Spinner size={32} color="var(--text-strong-950)" />
							<div className="space-y-2">
								<h2 className="font-medium text-label-lg text-text-strong-950">
									Verifying your account
								</h2>
								<p className="text-[13px] text-text-sub-600">
									Please wait while we complete your verification...
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							<div className="space-y-2">
								<Icon
									name="cross-circle"
									className="mx-auto h-10 w-10 text-error-base"
								/>
								<h2 className="text-balance font-semibold text-error-base text-label-lg">
									Verification failed{error ? ` ${error.toLowerCase()}` : ""}
								</h2>
							</div>
							<div>
								<Button.Root
									type="button"
									variant="neutral"
									className="h-11 w-full max-w-sm rounded-2xl!"
									onClick={() =>
										router.push(inviteId ? `/login?inviteId=${encodeURIComponent(inviteId)}` : "/login")
									}
								>
									Back to Login
								</Button.Root>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
