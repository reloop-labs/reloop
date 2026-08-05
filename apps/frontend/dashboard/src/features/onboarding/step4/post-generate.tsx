import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { CopyCodeBlock } from "./copy-code-block";
import { DeveloperPlayground } from "./developer-playground";
import type { LanguageCode } from "./types";
import type { PlatformTestStatus } from "./use-generate-api-key";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

function inboxProvider(email: string | null): {
	label: string;
	href: string;
} | null {
	if (!email) return null;
	const domain = email.split("@")[1]?.toLowerCase() ?? "";
	if (
		domain === "gmail.com" ||
		domain === "googlemail.com" ||
		domain.endsWith(".gmail.com")
	) {
		return {
			label: "Open Gmail",
			href: "https://mail.google.com/mail/u/0/#search/from%3Areloop",
		};
	}
	if (
		domain === "outlook.com" ||
		domain === "hotmail.com" ||
		domain === "live.com" ||
		domain === "msn.com"
	) {
		return {
			label: "Open Outlook",
			href: "https://outlook.live.com/mail/",
		};
	}
	if (domain === "yahoo.com" || domain.endsWith(".yahoo.com")) {
		return {
			label: "Open Yahoo Mail",
			href: "https://mail.yahoo.com/",
		};
	}
	if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
		return {
			label: "Open iCloud Mail",
			href: "https://www.icloud.com/mail",
		};
	}
	return null;
}

export function PostGenerate({
	apiKey,
	choice,
	onChoiceChange,
	onDone,
	finishing = false,
	onSendTest,
	testStatus = "idle",
	testError = null,
	testTo = null,
	testFrom = null,
}: {
	apiKey: string;
	choice: LanguageCode;
	onChoiceChange: (choice: LanguageCode) => void;
	onDone: () => void;
	/** True while preparing session/orgs and navigating to the dashboard. */
	finishing?: boolean;
	onSendTest?: () => void;
	testStatus?: PlatformTestStatus;
	testError?: string | null;
	testTo?: string | null;
	testFrom?: string | null;
}) {
	const testSending = testStatus === "sending";
	const testSent = testStatus === "sent";
	const provider = inboxProvider(testTo);

	// Enter — send test email, or go to dashboard after a successful send.
	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (testSent && !finishing) onDone();
			else if (!testSent && !testSending && onSendTest) onSendTest();
		},
		{ enableOnFormTags: true, preventDefault: true },
		[onDone, onSendTest, finishing, testSent, testSending],
	);

	// ⌥S — skip the test send and open the dashboard.
	useHotkeys(
		"alt+s",
		(e) => {
			e.preventDefault();
			if (!finishing && !testSending && !testSent) onDone();
		},
		{ enableOnFormTags: true },
		[onDone, finishing, testSending, testSent],
	);

	return (
		<div className="w-full min-w-0 max-w-2xl space-y-7">
			{/* Header */}
			<div className="space-y-2">
				<div>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						API Key
					</h1>
					<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
						Your API key — copy it now, you won&apos;t see it again.
					</p>
				</div>

				<CopyCodeBlock
					code={apiKey}
					lang="bash"
					copyValue={apiKey}
					label="secret key"
					minHeight="auto"
				/>
			</div>

			<DeveloperPlayground
				apiKey={apiKey}
				choice={choice}
				onChoiceChange={onChoiceChange}
			/>

			{/* Step footer: send → banner → dashboard */}
			<div className="space-y-4 pb-4">
				{/* After send: check-your-inbox banner */}
				<AnimatePresence initial={false}>
					{testSent ? (
						<motion.div
							key="check-inbox-banner"
							initial={{ opacity: 0, y: 8, height: 0 }}
							animate={{ opacity: 1, y: 0, height: "auto" }}
							exit={{ opacity: 0, y: -4, height: 0 }}
							transition={{ type: "spring", duration: 0.35, bounce: 0 }}
							className="overflow-hidden"
						>
							<div className="flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex min-w-0 items-start gap-2.5">
									<Icon
										name="check-circle"
										className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
									/>
									<div className="min-w-0 space-y-0.5">
										<p className="font-medium text-green-950 text-sm">
											Email sent — check your inbox
										</p>
										<p className="text-green-900/85 text-paragraph-sm leading-relaxed">
											{testTo ? (
												<>
													We sent a message to{" "}
													<span className="font-medium font-mono">
														{testTo}
													</span>
													. Open your email provider (and spam, just in case)
													{testFrom ? (
														<>
															{" "}
															— from{" "}
															<span className="break-all font-mono">
																{testFrom}
															</span>
														</>
													) : null}
													.
												</>
											) : (
												<>
													Open your email provider (and spam, just in case) to
													confirm delivery.
												</>
											)}
										</p>
									</div>
								</div>
								{provider ? (
									<a
										href={provider.href}
										target="_blank"
										rel="noopener noreferrer"
										className={cn(
											"inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl",
											"border border-green-300 bg-white px-3 py-2",
											"font-medium text-green-900 text-sm",
											"transition-colors hover:bg-green-100/80",
										)}
									>
										<span>{provider.label}</span>
										<Icon name="arrow-up-right" className="h-3.5 w-3.5" />
									</a>
								) : null}
							</div>
						</motion.div>
					) : null}
				</AnimatePresence>

				{testStatus === "error" && testError ? (
					<p className="text-right text-paragraph-sm text-red-600" role="alert">
						{testError}
					</p>
				) : null}

				<div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
					{!testSent ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="lighter"
							size="small"
							onClick={onDone}
							disabled={finishing || testSending}
							className="shrink-0 gap-1.5 rounded-xl"
						>
							Skip
							<ActionKbd className="w-auto min-w-0 px-1">⌥S</ActionKbd>
						</Button.Root>
					) : (
						<div />
					)}
					<AnimatePresence mode="wait" initial={false}>
						{!testSent ? (
							<motion.div
								key="send-cta"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								className="ml-auto"
							>
								<FancyButton.Root
									variant="blue"
									size="small"
									className={cn(
										"min-w-[190px] justify-center overflow-visible whitespace-nowrap rounded-xl",
										testSending && "pointer-events-none opacity-90",
									)}
									onClick={onSendTest}
									disabled={!onSendTest || testSending || finishing}
									aria-busy={testSending}
								>
									{testSending ? (
										<span className="flex items-center justify-center gap-1.5">
											<Spinner size={14} color="currentColor" />
											<span>Sending email...</span>
										</span>
									) : (
										<span className="flex items-center justify-center gap-1.5">
											<Icon name="confetti" className="h-3.5 w-3.5 shrink-0" />
											<span>Send email</span>
											<ActionKbd className={actionKbdOnBlueClassName}>
												↵
											</ActionKbd>
										</span>
									)}
								</FancyButton.Root>
							</motion.div>
						) : (
							<motion.div
								key="dashboard-cta"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								className="ml-auto"
							>
								<FancyButton.Root
									variant="blue"
									size="small"
									className={cn(
										"min-w-[170px] justify-center overflow-visible whitespace-nowrap rounded-xl transition-all duration-200",
										finishing && "pointer-events-none opacity-90",
									)}
									onClick={onDone}
									disabled={finishing}
									aria-busy={finishing}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={finishing ? "finishing" : "done"}
											transition={{
												type: "spring",
												duration: 0.25,
												bounce: 0,
											}}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{finishing ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Opening dashboard...</span>
												</>
											) : (
												<>
													<Icon
														name="check-circle"
														className="h-3.5 w-3.5 shrink-0"
													/>
													<span>Go to Dashboard</span>
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
