"use client";

import { Icon } from "@reloop/ui/icon";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { EmailPillsInput, validateEmail } from "../email-pills-input";

export interface ForwardFormValues {
	to: string[];
	cc: string[];
	body: string;
}

interface ForwardComposerProps {
	/** Original message to forward */
	originalFrom: string;
	originalDate: string;
	originalSubject: string;
	originalBodyText?: string;
	/** Mailbox this message belongs to */
	fromEmail: string;
	/** Callback when Send clicked */
	onSend: (data: ForwardFormValues) => void;
	onClose: () => void;
	isSending?: boolean;
}

export const ForwardComposer = ({
	originalFrom,
	originalDate,
	originalSubject,
	originalBodyText,
	fromEmail,
	onSend,
	onClose,
	isSending,
}: ForwardComposerProps) => {
	const { control, handleSubmit, register, watch } = useForm<ForwardFormValues>(
		{
			defaultValues: {
				to: [],
				cc: [],
				body: "",
			},
		},
	);

	const toValue = watch("to") || [];
	const ccValue = watch("cc") || [];

	const hasInvalidTo = toValue.some((email) => !validateEmail(email));
	const hasInvalidCc = ccValue.some((email) => !validateEmail(email));
	const canSend =
		toValue.length > 0 && !hasInvalidTo && !hasInvalidCc && !isSending;

	const onSubmit = (data: ForwardFormValues) => {
		onSend(data);
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="mx-5 my-4 rounded-xl border border-mail-border bg-panel-light shadow-sm dark:bg-panel-dark"
		>
			{/* Header */}
			<div className="flex items-center justify-between border-mail-border border-b px-4 py-3 border-mail-border/30">
				<div className="flex items-center gap-2">
					{/* Forward icon */}
					<svg
						className="h-3.5 w-3.5 text-mail-foreground"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="15 17 20 12 15 7" />
						<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
					</svg>
					<span className="font-semibold text-label-sm text-mail-foreground text-mail-foreground">
						Forward
					</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)]"
				>
					<Icon name="cross" className="h-4 w-4" />
				</button>
			</div>

			{/* Fields */}
			<div className="flex flex-col gap-0 divide-y divide-stroke-inbox dark:divide-stroke-soft-100/30">
				{/* From */}
				<div className="flex items-center gap-2 px-4 py-2.5 text-label-sm">
					<span className="w-12 shrink-0 text-mail-muted">From:</span>
					<span className="text-mail-muted text-mail-muted">
						{fromEmail}
					</span>
				</div>

				{/* To */}
				<div className="flex items-start gap-2 px-4 py-1 text-label-sm">
					<span className="w-12 shrink-0 py-2 text-mail-muted">To:</span>
					<Controller
						name="to"
						control={control}
						render={({ field }) => (
							<EmailPillsInput
								emails={field.value}
								onChange={field.onChange}
								placeholder="recipient@example.com"
								disabled={isSending}
							/>
						)}
					/>
				</div>

				{/* CC */}
				<div className="flex items-start gap-2 px-4 py-1 text-label-sm">
					<span className="w-12 shrink-0 py-2 text-mail-muted">Cc:</span>
					<Controller
						name="cc"
						control={control}
						render={({ field }) => (
							<EmailPillsInput
								emails={field.value}
								onChange={field.onChange}
								placeholder="cc@example.com"
								disabled={isSending}
							/>
						)}
					/>
				</div>
			</div>

			{/* Body — optional note + quoted original */}
			<div className="px-4 py-3">
				<textarea
					{...register("body")}
					placeholder="Add a note (optional)…"
					rows={3}
					className="w-full resize-none bg-transparent text-label-sm text-mail-foreground placeholder-text-soft-400 outline-none text-mail-foreground"
				/>

				{/* Quoted original */}
				<div className="mt-2 rounded-lg border border-mail-border bg-offset-light/60 p-3 border-mail-border/20 bg-mail-accent/30">
					<p className="mb-1.5 font-medium text-[11px] text-mail-muted uppercase tracking-wider">
						Forwarded message
					</p>
					<div className="flex flex-col gap-0.5 text-label-xs text-mail-muted text-mail-muted">
						<span>
							<span className="font-semibold text-mail-muted">From:</span>{" "}
							{originalFrom}
						</span>
						<span>
							<span className="font-semibold text-mail-muted">Date:</span>{" "}
							{originalDate}
						</span>
						<span>
							<span className="font-semibold text-mail-muted">Subject:</span>{" "}
							{originalSubject}
						</span>
					</div>
					{originalBodyText && (
						<p className="mt-2 line-clamp-3 whitespace-pre-wrap text-label-xs text-mail-muted leading-relaxed text-mail-muted">
							{originalBodyText}
						</p>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between rounded-b-xl border-mail-border border-t bg-offset-light/30 px-4 py-2.5 border-mail-border/30 /20">
				<div className="flex items-center gap-2">
					<button
						type="submit"
						disabled={!canSend}
						className="flex items-center gap-1.5 rounded-lg bg-mail-primary px-4 py-1.5 font-semibold text-label-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
					>
						{isSending ? (
							<span>Sending…</span>
						) : (
							<>
								<span>Forward</span>
								<svg
									className="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="15 17 20 12 15 7" />
									<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
								</svg>
							</>
						)}
					</button>

					<button
						type="button"
						className="rounded-lg p-1.5 text-mail-muted hover:bg-offset-light hover:text-mail-foreground hover:bg-[var(--inbox-hover)]"
						title="Attach files"
						onClick={() => toast.info("Attachment uploading prototype")}
					>
						<svg
							className="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
						</svg>
					</button>
				</div>

				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-mail-muted hover:bg-red-50 hover:text-error-base hover:bg-red-950/20"
					title="Discard draft"
				>
					<svg
						className="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					</svg>
				</button>
			</div>
		</form>
	);
};
