"use client";

import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AgentMailbox } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";
import { EmailPillsInput, validateEmail } from "./email-pills-input";

interface ComposeModalProps {
	isOpen: boolean;
	onClose: () => void;
	mailbox: AgentMailbox;
}

interface ComposeFormValues {
	to: string[];
	subject: string;
	body: string;
	cc: string[];
	bcc: string[];
}

const formatBytes = (bytes: number, decimals = 1) => {
	if (!bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const ComposeModal = ({
	isOpen,
	onClose,
	mailbox,
}: ComposeModalProps) => {
	const { sendMessage } = useAgentInbox();

	const { control, handleSubmit, register, reset, watch } =
		useForm<ComposeFormValues>({
			defaultValues: {
				to: [],
				subject: "",
				body: "",
				cc: [],
				bcc: [],
			},
		});

	const to = watch("to") || [];

	// UI controls
	const [showCc, setShowCc] = useState(false);
	const [showBcc, setShowBcc] = useState(false);
	const [isSending, setIsSending] = useState(false);

	// Real attachment state tracking upload progress and URL/path metadata
	const [attachments, setAttachments] = useState<
		Array<{
			id: string;
			name: string;
			size: string;
			url: string;
			path: string;
			content_type: string;
			isUploading?: boolean;
		}>
	>([]);

	// Reset form when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			reset({
				to: [],
				subject: "",
				body: "",
				cc: [],
				bcc: [],
			});
			setShowCc(false);
			setShowBcc(false);
			setAttachments([]);
		}
	}, [isOpen, reset]);

	const uploadFile = useCallback(async (file: File) => {
		const tempId = Math.random().toString();
		const newAttachment = {
			id: tempId,
			name: file.name,
			size: formatBytes(file.size),
			url: "",
			path: "",
			content_type: file.type || "application/octet-stream",
			isUploading: true,
		};
		setAttachments((prev) => [...prev, newAttachment]);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch("/api/upload/v1/upload", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				throw new Error("Upload failed");
			}

			const data = await res.json();
			setAttachments((prev) =>
				prev.map((att) =>
					att.id === tempId
						? {
								...att,
								url: data.url,
								path: data.path,
								isUploading: false,
							}
						: att,
				),
			);
		} catch (_error) {
			toast.error(`Failed to upload ${file.name}`);
			setAttachments((prev) => prev.filter((att) => att.id !== tempId));
		}
	}, []);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			for (const file of acceptedFiles) {
				if (file.size > 10 * 1024 * 1024) {
					toast.error(`${file.name} is too large. Max size is 10MB.`);
					continue;
				}
				uploadFile(file);
			}
		},
		[uploadFile],
	);

	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		onDrop,
		noClick: true,
		noKeyboard: true,
	});

	const onSubmit = async (data: ComposeFormValues) => {
		if (data.to.length === 0) {
			toast.error("Please specify at least one recipient in the 'To' field.");
			return;
		}

		// Validation of all emails
		const hasInvalidTo = data.to.some((email) => !validateEmail(email));
		const hasInvalidCc = data.cc.some((email) => !validateEmail(email));
		const hasInvalidBcc = data.bcc.some((email) => !validateEmail(email));

		if (hasInvalidTo || hasInvalidCc || hasInvalidBcc) {
			toast.error("Please fix invalid email addresses before sending.");
			return;
		}

		if (attachments.some((att) => att.isUploading)) {
			toast.error("Please wait for all attachments to finish uploading.");
			return;
		}

		setIsSending(true);
		try {
			const toEmails = data.to;
			const ccEmails = data.cc.length > 0 ? data.cc : undefined;
			const bccEmails = data.bcc.length > 0 ? data.bcc : undefined;

			// Map attachments payload
			const attachmentsPayload = attachments
				.filter((att) => !att.isUploading && att.url)
				.map((att) => ({
					filename: att.name,
					path: att.url,
					content_type: att.content_type,
				}));

			await sendMessage({
				mailboxId: mailbox.id,
				to: toEmails,
				subject: data.subject || "(No Subject)",
				text: data.body,
				cc: ccEmails,
				bcc: bccEmails,
				attachments: attachmentsPayload,
			});

			toast.success("Email sent successfully!");
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to send email");
		} finally {
			setIsSending(false);
		}
	};

	const removeAttachment = (indexToRemove: number) => {
		setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={onClose}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-white p-0 shadow-2xl sm:max-w-[620px] dark:border-stroke-soft-100/40 dark:bg-neutral-900"
				showClose={false}
				onEscapeKeyDown={(e) => {
					if (isSending) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (isSending) e.preventDefault();
				}}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					{...getRootProps()}
					className="relative flex flex-col"
				>
					<input {...getInputProps()} />
					<AnimatePresence>
						{isDragActive && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/85 backdrop-blur-sm dark:bg-neutral-900/85"
							>
								<div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl border-2 border-[#18181b] border-dashed dark:border-white">
									<svg
										className="h-7 w-7 text-text-strong-950 dark:text-white"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
									</svg>
								</div>
								<p className="font-semibold text-base text-text-strong-950 dark:text-white">
									Drop files here to attach
								</p>
							</motion.div>
						)}
					</AnimatePresence>
					{/* Top bar Header */}
					<div className="flex items-center justify-between border-stroke-soft-100/60 border-b px-5 py-4 dark:border-neutral-800">
						<h2 className="font-semibold text-sm text-text-strong-950 dark:text-white">
							New email
						</h2>
						<div className="flex items-center gap-1">
							{/* Close Button */}
							<motion.button
								whileHover={{ scale: 1.08 }}
								whileTap={{ scale: 0.92 }}
								type="button"
								onClick={onClose}
								title="Close"
								className="flex h-7 w-7 items-center justify-center rounded-lg text-text-soft-400 transition-colors hover:bg-bg-weak-50 dark:hover:bg-neutral-800"
							>
								<Icon name="cross" className="h-3.5 w-3.5" />
							</motion.button>
						</div>
					</div>

					{/* Agent Provenance Row */}
					<div className="flex items-center border-stroke-soft-100/40 border-b bg-[#f4f6f0] px-5 py-2.5 dark:border-neutral-800/40 dark:bg-[#171b13]">
						<div className="flex items-center gap-2 font-medium text-[#727d6d] text-xs dark:text-[#9ea899]">
							<svg
								className="h-4 w-4 text-[#727d6d] dark:text-[#9ea899]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							<span>
								Sending as <strong className="font-semibold">human</strong> ·
								won't pass through the agent
							</span>
						</div>
					</div>

					{/* Field Inputs */}
					<div className="flex flex-col text-sm">
						{/* From Row */}
						<div className="flex items-center border-stroke-soft-100/50 border-b px-5 py-2.5 dark:border-neutral-800/60">
							<span className="w-16 select-none text-text-soft-400">From</span>
							<input
								type="text"
								value={mailbox.email}
								readOnly
								className="flex-1 cursor-default select-none bg-transparent text-text-strong-950 outline-none dark:text-white"
							/>
						</div>

						{/* To Row */}
						<div className="flex items-start border-stroke-soft-100/50 border-b px-5 py-1.5 dark:border-neutral-800/60">
							<span className="w-16 select-none py-2 text-text-soft-400">
								To
							</span>
							<Controller
								name="to"
								control={control}
								render={({ field }) => (
									<EmailPillsInput
										emails={field.value}
										onChange={field.onChange}
										placeholder="Recipient email address"
										disabled={isSending}
									/>
								)}
							/>
							<div className="flex select-none items-center gap-2.5 py-2 pl-2 font-mono text-text-soft-400 text-xs">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									type="button"
									onClick={() => setShowCc(!showCc)}
									className={`rounded px-1 py-0.5 transition-colors hover:text-text-strong-950 dark:hover:text-white ${
										showCc
											? "font-semibold text-text-strong-950 dark:text-white"
											: ""
									}`}
								>
									Cc
								</motion.button>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									type="button"
									onClick={() => setShowBcc(!showBcc)}
									className={`rounded px-1 py-0.5 transition-colors hover:text-text-strong-950 dark:hover:text-white ${
										showBcc
											? "font-semibold text-text-strong-950 dark:text-white"
											: ""
									}`}
								>
									Bcc
								</motion.button>
							</div>
						</div>

						{/* Cc Row (Conditional) */}
						<AnimatePresence initial={false}>
							{showCc && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: "easeInOut" }}
									className="overflow-hidden"
								>
									<div className="flex items-start border-stroke-soft-100/50 border-b px-5 py-1.5 dark:border-neutral-800/60">
										<span className="w-16 select-none py-2 text-text-soft-400">
											Cc
										</span>
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
								</motion.div>
							)}
						</AnimatePresence>

						{/* Bcc Row (Conditional) */}
						<AnimatePresence initial={false}>
							{showBcc && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: "easeInOut" }}
									className="overflow-hidden"
								>
									<div className="flex items-start border-stroke-soft-100/50 border-b px-5 py-1.5 dark:border-neutral-800/60">
										<span className="w-16 select-none py-2 text-text-soft-400">
											Bcc
										</span>
										<Controller
											name="bcc"
											control={control}
											render={({ field }) => (
												<EmailPillsInput
													emails={field.value}
													onChange={field.onChange}
													placeholder="bcc@example.com"
													disabled={isSending}
												/>
											)}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Subject Row */}
						<div className="flex items-center border-stroke-soft-100/50 border-b px-5 py-2.5 dark:border-neutral-800/60">
							<span className="w-16 select-none text-text-soft-400">
								Subject
							</span>
							<input
								type="text"
								placeholder="Add a subject"
								disabled={isSending}
								{...register("subject")}
								className="flex-1 bg-transparent text-text-strong-950 placeholder-text-soft-400/80 outline-none dark:text-white"
							/>
						</div>
					</div>

					{/* Textarea Body Editor Area */}
					<div className="flex min-h-[220px] flex-col px-5 py-4">
						<textarea
							placeholder="Write your message..."
							disabled={isSending}
							rows={8}
							{...register("body")}
							className="w-full flex-1 resize-none border-0 bg-transparent p-0 text-sm text-text-strong-950 leading-relaxed placeholder-text-soft-400/80 outline-none dark:text-neutral-200"
						/>

						{/* Attachments Section */}
						{attachments.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-2 border-stroke-soft-100/30 border-t pt-3 dark:border-neutral-800/40">
								<AnimatePresence>
									{attachments.map((file, idx) => (
										<motion.div
											key={file.id || file.name}
											initial={{ opacity: 0, scale: 0.9, y: 5 }}
											animate={{ opacity: 1, scale: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.9 }}
											transition={{ duration: 0.2 }}
											className={`inline-flex items-center gap-2 rounded border border-zinc-700/50 bg-zinc-800 px-2.5 py-1 font-mono text-xs text-zinc-100 shadow-sm dark:bg-zinc-950 ${file.isUploading ? "opacity-60" : ""}`}
										>
											{file.isUploading ? (
												<svg
													className="h-3.5 w-3.5 animate-spin text-zinc-400"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="3"
													/>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													/>
												</svg>
											) : (
												<svg
													className="h-3.5 w-3.5 text-zinc-400"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
												>
													<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
													<polyline points="14 2 14 8 20 8" />
												</svg>
											)}
											<span className="max-w-[180px] truncate">
												{file.name}
											</span>
											<span className="text-[10px] text-zinc-400/80">
												({file.size})
											</span>
											<button
												type="button"
												onClick={() => removeAttachment(idx)}
												title="Remove file"
												className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-700/40 hover:text-zinc-300"
											>
												&times;
											</button>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						)}
					</div>

					{/* Footer Actions */}
					<div className="flex items-center justify-between border-stroke-soft-100/60 border-t bg-bg-white-0 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
						<div className="flex items-center gap-3">
							{/* Send Button */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								type="submit"
								disabled={
									isSending ||
									to.length === 0 ||
									attachments.some((att) => att.isUploading)
								}
								className="flex items-center gap-2 rounded-xl bg-[#18181b] px-6 py-2.5 font-semibold text-sm text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
							>
								<svg
									className="mr-0.5 h-3.5 w-3.5 rotate-45 fill-current text-white dark:text-neutral-950"
									viewBox="0 0 24 24"
								>
									<line
										x1="22"
										y1="2"
										x2="11"
										y2="13"
										stroke="currentColor"
										strokeWidth="2.5"
									/>
									<polygon
										points="22 2 15 22 11 13 2 9 22 2"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinejoin="round"
									/>
								</svg>
								<span>{isSending ? "Sending..." : "Send"}</span>
							</motion.button>

							{/* Attach File Button */}
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								type="button"
								onClick={open}
								title="Attach files"
								disabled={isSending}
								className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 text-text-sub-600 transition-colors hover:bg-bg-weak-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
							>
								<svg
									className="h-4.5 w-4.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
								</svg>
							</motion.button>
						</div>

						{/* Discard Button */}
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							type="button"
							onClick={onClose}
							disabled={isSending}
							className="flex items-center gap-1.5 font-medium text-sm text-text-sub-600 transition-colors hover:text-red-600 disabled:opacity-40 dark:text-neutral-400 dark:hover:text-red-400"
						>
							<svg
								className="h-4.5 w-4.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
							</svg>
							<span>Discard</span>
						</motion.button>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
