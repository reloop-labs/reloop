"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

const AutoLoginPage = () => {
	const router = useRouter();
	const [otpSentEmail] = useQueryState(
		"otpSent",
		parseAsString.withDefault(""),
	);
	const [otpValue] = useQueryState("otp", parseAsString.withDefault(""));
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
				const response = await authClient.emailOtp.checkVerificationOtp({
					otp: otpValue,
					email: otpSentEmail,
					type: "sign-in",
				});

				if (response.data?.success) {
					const { data } = await authClient.signIn.emailOtp({
						email: otpSentEmail,
						otp: otpValue,
					});

					if (data?.user.id) {
						router.push("/");
					} else {
						setError("Failed to sign in. Please try manually.");
						setIsVerifying(false);
					}
				} else {
					setError("This link is invalid or has expired.");
					setIsVerifying(false);
				}
			} catch (err) {
				setError("An unexpected error occurred. Please try again.");
				setIsVerifying(false);
			}
		};

		verify();
	}, [otpSentEmail, otpValue, router]);

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
									Verification failed {error?.toLowerCase()}
								</h2>
							</div>
							<div>
								<Button.Root
									type="button"
									variant="neutral"
									className="h-11 w-full max-w-sm rounded-2xl!"
									onClick={() => router.push("/login")}
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
};

export default AutoLoginPage;
