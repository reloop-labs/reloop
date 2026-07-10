"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { validateSignupInviteCode } from "./signup-invite";

export function SignupInviteGate({
	onValidated,
}: {
	onValidated: (result: { email: string; code: string }) => void;
}) {
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = code.trim();
		if (!trimmed) return;
		setLoading(true);
		try {
			const result = await validateSignupInviteCode(trimmed);
			if (!result.valid || !result.email || !result.code) {
				toast.error(result.message || "Invalid or expired invite code");
				return;
			}
			onValidated({ email: result.email, code: result.code });
		} catch {
			toast.error("Failed to validate invite code");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="space-y-1 pb-2 text-center">
				<h2 className="font-medium text-label-lg text-text-strong-950">
					You need an invite to join Reloop
				</h2>
				<p className="text-[13px] text-text-sub-600">
					Enter the invite code from your invitation email, or open the invite
					link you were sent.
				</p>
			</div>
			<form onSubmit={onSubmit} className="flex flex-col gap-3">
				<Input.Root className="rounded-2xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-12 font-medium"
							placeholder="rl_inv_…"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							autoComplete="off"
							spellCheck={false}
						/>
					</Input.Wrapper>
				</Input.Root>
				<Button.Root
					type="submit"
					disabled={loading || !code.trim()}
					className="h-11 w-full rounded-2xl!"
				>
					{loading && <Spinner size={16} color="currentColor" />}
					{loading ? "Checking…" : "Continue"}
				</Button.Root>
			</form>
			<p className="pt-2 text-center font-medium text-[13px] text-text-sub-600">
				Already have an account?{" "}
				<Link
					href="/login"
					className="text-text-strong-950 underline-offset-2 hover:underline"
				>
					Login
				</Link>
			</p>
		</div>
	);
}
