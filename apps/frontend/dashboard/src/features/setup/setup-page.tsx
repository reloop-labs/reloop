"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard, AuthCardHeader } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell } from "#/features/auth/auth-shell";
import { SETUP_FORM_ID, SetupForm, type SetupUiState } from "./setup-form";
import { useSetupStatusQuery } from "./use-setup-status";

export function SetupPage() {
	const router = useRouter();
	const { data, isFetched } = useSetupStatusQuery();
	const [ui, setUi] = useState<SetupUiState>({
		canSubmit: false,
		isLoading: false,
		isSuccess: false,
	});

	const isSetupRequired = data?.required === true;
	const isUnavailable = isFetched && !isSetupRequired;

	useEffect(() => {
		if (!isUnavailable) return;
		router.replace("/login");
	}, [isUnavailable, router]);

	if (!isFetched || !isSetupRequired) {
		return <AuthSessionLoader />;
	}

	return (
		<AuthShell direction={1} hideLogo>
			<AuthCard footer="First run only. This page stops responding once setup completes.">
				<AuthCardHeader
					title="Set up your instance"
					description="Create the administrator account for this self-hosted Reloop."
				/>

				<SetupForm onUiStateChange={setUi} />

				<div className="mt-6">
					<FancyButton.Root
						type="submit"
						form={SETUP_FORM_ID}
						variant={ui.isSuccess ? "success" : "blue"}
						size="medium"
						disabled={!ui.canSubmit}
						className={`h-11 w-full justify-center gap-2 overflow-hidden rounded-xl font-medium text-sm transition-colors duration-200 ${
							ui.isSuccess ? "pointer-events-none cursor-default" : ""
						}`}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={
									ui.isSuccess
										? "success"
										: ui.isLoading
											? "creating"
											: "create-admin"
								}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="flex items-center justify-center gap-1.5"
							>
								{ui.isLoading && <Spinner size={14} color="currentColor" />}
								{ui.isSuccess && (
									<Icon name="check-circle" className="h-4 w-4 shrink-0" />
								)}
								<span>
									{ui.isSuccess
										? "Setup complete! Redirecting…"
										: ui.isLoading
											? "Creating your account…"
											: "Create admin account"}
								</span>
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>

					<p className="mt-3 text-center text-[12px] text-text-soft-400 leading-relaxed">
						The setup key is consumed once this account is created.
					</p>
				</div>
			</AuthCard>
		</AuthShell>
	);
}
