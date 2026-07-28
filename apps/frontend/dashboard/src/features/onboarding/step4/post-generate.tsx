import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { CopyCodeBlock } from "./copy-code-block";
import { DeveloperPlayground } from "./developer-playground";
import type { PlatformTestStatus } from "./use-generate-api-key";
import type { IntegrationChoice } from "./types";

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
	choice: IntegrationChoice;
	onChoiceChange: (choice: IntegrationChoice) => void;
	onDone: () => void;
	/** True while preparing session/orgs and navigating to the dashboard. */
	finishing?: boolean;
	onSendTest?: () => void;
	testStatus?: PlatformTestStatus;
	testError?: string | null;
	testTo?: string | null;
	testFrom?: string | null;
}) {
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!finishing) onDone();
		},
		{ enableOnFormTags: true },
		[onDone, finishing],
	);

	const testSending = testStatus === "sending";
	const testSent = testStatus === "sent";

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

				{/* Secret Key Display Box */}
				<CopyCodeBlock
					code={apiKey}
					lang="bash"
					copyValue={apiKey}
					label="secret key"
					minHeight="auto"
				/>
			</div>

			{/* Platform test send — proves the key works without a verified domain */}
			<div className="space-y-3 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-4">
				<div className="space-y-1">
					<p className="font-medium text-sm text-text-strong-950">
						Send a test email to yourself
					</p>
					<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
						Uses your new API key and Reloop&apos;s platform domain so you can
						confirm delivery before verifying your own domain.
					</p>
				</div>

				{testSent ? (
					<div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-900">
						<Icon
							name="check-circle"
							className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
						/>
						<div className="min-w-0 space-y-0.5">
							<p className="font-medium">Test email sent</p>
							{testTo ? (
								<p className="text-green-800/90">
									Check <span className="font-mono">{testTo}</span>
									{testFrom ? (
										<>
											{" "}
											— from{" "}
											<span className="break-all font-mono">{testFrom}</span>
										</>
									) : null}
								</p>
							) : (
								<p className="text-green-800/90">Check your inbox.</p>
							)}
						</div>
					</div>
				) : null}

				{testStatus === "error" && testError ? (
					<p className="text-paragraph-sm text-red-600" role="alert">
						{testError}
					</p>
				) : null}

				{onSendTest ? (
					<FancyButton.Root
						variant="neutral"
						size="small"
						className={cn(
							"min-w-[180px] justify-center overflow-hidden rounded-xl whitespace-nowrap",
							(testSending || testSent || finishing) &&
								"pointer-events-none opacity-90",
						)}
						onClick={onSendTest}
						disabled={testSending || testSent || finishing}
						aria-busy={testSending}
					>
						{testSending ? (
							<span className="flex items-center justify-center gap-1.5">
								<Spinner size={14} color="currentColor" />
								<span>Sending...</span>
							</span>
						) : testSent ? (
							<span className="flex items-center justify-center gap-1.5">
								<Icon name="check-circle" className="h-3.5 w-3.5 shrink-0" />
								<span>Sent</span>
							</span>
						) : (
							<span className="flex items-center justify-center gap-1.5">
								<Icon name="mail" className="h-3.5 w-3.5 shrink-0" />
								<span>Send test email to me</span>
							</span>
						)}
					</FancyButton.Root>
				) : null}
			</div>

			<DeveloperPlayground
				apiKey={apiKey}
				choice={choice}
				onChoiceChange={onChoiceChange}
			/>

			<div className="flex items-center justify-end gap-3 pb-4">
				<FancyButton.Root
					variant="blue"
					size="small"
					className={cn(
						"min-w-[170px] justify-center overflow-hidden rounded-xl whitespace-nowrap transition-all duration-200",
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
							initial={{
								opacity: 0,
								y: -14,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								y: 14,
							}}
							className="flex items-center justify-center gap-1.5"
						>
							{finishing ? (
								<>
									<Spinner size={14} color="currentColor" />
									<span>Opening dashboard...</span>
								</>
							) : (
								<>
									<Icon name="check-circle" className="h-3.5 w-3.5 shrink-0" />
									<span>Go to Dashboard</span>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}
