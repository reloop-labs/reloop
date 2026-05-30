"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { useEffect, useState } from "react";

export const HeaderAction = () => {
	const { useSession } = authClient;
	const { data: session, isPending } = useSession();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || isPending) {
		return null;
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
			<a
				href="/dashboard/login"
				className={Button.buttonVariants({
					variant: "neutral",
					mode: "stroke",
					size: "xsmall",
				}).root()}
			>
				Login
			</a>
			<a
				href="/dashboard/signup"
				className={Button.buttonVariants({
					variant: "neutral",
					size: "xsmall",
				}).root()}
			>
				Get Started
			</a>
		</div>
	);
};
