"use client";

import { ArrowRight } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

export function SetupStepSendEmail({
	step4Complete,
	step3Done,
	step2Done,
	testRecipient,
	isSendingTest,
	onSend,
}: {
	step4Complete: boolean;
	step3Done: boolean;
	step2Done: boolean;
	testRecipient: string;
	isSendingTest: boolean;
	onSend: () => void;
}) {
	useHotkeys(
		"mod+enter",
		(e) => {
			if (!step3Done || !step2Done || step4Complete || isSendingTest) return;
			e.preventDefault();
			onSend();
		},
		{ enableOnFormTags: true },
		[step3Done, step2Done, step4Complete, isSendingTest, onSend],
	);

	if (step4Complete) {
		return (
			<span className="mt-1 text-text-sub-600/60 text-xs dark:text-white/30">
				First email sent successfully!
			</span>
		);
	}

	if (!step3Done || !step2Done) return null;

	return (
		<>
			<span className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
				Verify sending works by sending a test email
			</span>
			<div className="mt-3.5 flex flex-col gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 px-3 py-1.5 text-text-sub-600 text-xs dark:border-white/[0.06] dark:bg-zinc-900/50 dark:text-white/60">
						{testRecipient || "your email"}
					</span>
					<button
						type="button"
						disabled={isSendingTest || !testRecipient}
						onClick={onSend}
						className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-text-strong-950 px-4 py-2 font-semibold text-white text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black"
					>
						{isSendingTest ? "Sending..." : "Send Email"}
						<ArrowRight className="h-3 w-3" />
					</button>
				</div>
			</div>
		</>
	);
}
