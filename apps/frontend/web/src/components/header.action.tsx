"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/components/button";
import Link from "next/link";

export const HeaderAction = () => {
	const { useSession } = authClient;
	const { data: session, isPending } = useSession();

	if (isPending) {
		return <></>;
	}

	if (session) {
		return (
			<a
				href="/dashboard"
				className={Button.buttonVariants({
					variant: "neutral",
					size: "xsmall",
				}).root()}
			>
				Dashboard
			</a>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Link
				href="/login"
				className={Button.buttonVariants({
					variant: "neutral",
					mode: "stroke",
					size: "xsmall",
				}).root()}
			>
				Login
			</Link>
			<Link
				href="/login"
				className={Button.buttonVariants({
					variant: "neutral",
					size: "xsmall",
				}).root()}
			>
				Get Started
			</Link>
		</div>
	);
};
