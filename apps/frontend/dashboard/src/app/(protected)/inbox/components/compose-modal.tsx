"use client";

import { cn } from "@reloop/ui/cn";
import * as Modal from "@reloop/ui/modal";
import * as Popover from "@reloop/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import {
	Command,
	CornerDownLeft,
	Loader2,
	Paperclip,
	Plus,
	X as XIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

const attachmentIcon = (contentType: string) => {
	if (contentType.includes("pdf")) return "📄";
	if (contentType.includes("excel") || contentType.includes("spreadsheet"))
		return "📊";
	if (contentType.includes("word") || contentType.includes("wordprocessing"))
		return "📝";
	if (contentType.startsWith("image/")) return "🖼️";
	return "📎";
};

export const ComposeModal = ({
	isOpen,
	onClose,
	mailbox,
}: ComposeModalProps) => {
	const { sendMessage } = useAgentInbox();
	const bodyRef = useRef<HTMLTextAreaElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { control, handleSubmit, register, reset, watch, setFocus } =
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

	const [showCc, setShowCc] = useState(false);
	const [showBcc, setShowBcc] = useState(false);
	const [isSending, setIsSending] = useState(false);
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

	useEffect(() => {
		if (!isOpen) return;
		reset({ to: [], subject: "", body: "", cc: [], bcc: [] });
		setShowCc(false);
		setShowBcc(false);
		setAttachments([]);
		const t = window.setTimeout(() => setFocus("to"), 50);
		return () => window.clearTimeout(t);
	}, [isOpen, reset, setFocus]);

	const uploadFile = useCallback(async (file: File) => {
		const tempId = Math.random().toString();
		setAttachments((prev) => [
			...prev,
			{
				id: tempId,
				name: file.name,
				size: formatBytes(file.size),
				url: "",
				path: "",
				content_type: file.type || "application/octet-stream",
				isUploading: true,
			},
		]);

		try {
			const formData = new FormData();
			formData.append("file", file);
			const res = await fetch("/api/upload/v1/upload", {
				method: "POST",
				body: formData,
			});
			if (!res.ok) throw new Error("Upload failed");
			const data = (await res.json()) as { url: string; path: string };
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
		} catch {
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
				void uploadFile(file);
			}
		},
		[uploadFile],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		noClick: true,
		noKeyboard: true,
	});

	const onSubmit = async (data: ComposeFormValues) => {
		if (data.to.length === 0) {
			toast.error("Please specify at least one recipient.");
			return;
		}
		if (
			data.to.some((e) => !validateEmail(e)) ||
			data.cc.some((e) => !validateEmail(e)) ||
			data.bcc.some((e) => !validateEmail(e))
		) {
			toast.error("Please fix invalid email addresses before sending.");
			return;
		}
		if (attachments.some((att) => att.isUploading)) {
			toast.error("Please wait for attachments to finish uploading.");
			return;
		}

		setIsSending(true);
		try {
			await sendMessage({
				mailboxId: mailbox.id,
				to: data.to,
				subject: data.subject || "(No Subject)",
				text: data.body,
				cc: data.cc.length > 0 ? data.cc : undefined,
				bcc: data.bcc.length > 0 ? data.bcc : undefined,
				attachments: attachments
					.filter((att) => !att.isUploading && att.url)
					.map((att) => ({
						filename: att.name,
						path: att.url,
						content_type: att.content_type,
					})),
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

	const { ref: bodyRegisterRef, ...bodyRegister } = register("body");

	return (
		<Modal.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && !isSending) onClose();
			}}
		>
			<Modal.Content
				showClose={false}
				overlayClassName="bg-black/50 p-4"
				className="flex w-full max-w-[750px] flex-col items-center gap-1 border-none bg-transparent p-0 shadow-none"
				onEscapeKeyDown={(e) => {
					if (isSending) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (isSending) e.preventDefault();
				}}
			>
				<Modal.Title className="sr-only">Compose Email</Modal.Title>
				<Modal.Description className="sr-only">
					Create and send a new email message
				</Modal.Description>
				{/* Zero-style esc chip above the composer */}
				<div className="flex w-full justify-start">
					<button
						type="button"
						onClick={onClose}
						disabled={isSending}
						className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#F0F0F0] px-2 py-1 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:bg-[var(--inbox-muted-bg)] dark:hover:bg-[var(--inbox-control-hover)]"
					>
						<XIcon className="mt-0.5 h-3.5 w-3.5 text-mail-muted" />
						<span className="font-medium text-mail-muted text-sm dark:text-white">
							esc
						</span>
					</button>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					{...getRootProps()}
					className={cn(
						"relative mb-12 flex max-h-[min(500px,80dvh)] w-full flex-col overflow-hidden rounded-2xl border border-[#E7E7E7] bg-[#FAFAFA] shadow-sm dark:border-[#252525] dark:bg-[#202020]",
					)}
				>
					<input {...getInputProps()} />
					<input
						ref={fileInputRef}
						type="file"
						className="hidden"
						multiple
						accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
						onChange={(e) => {
							const files = e.target.files;
							if (files) void onDrop(Array.from(files));
							e.target.value = "";
						}}
					/>

					<AnimatePresence>
						{isDragActive && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#FAFAFA]/90 backdrop-blur-sm dark:bg-[#202020]/90"
							>
								<Paperclip className="h-7 w-7 text-mail-muted" />
								<p className="font-medium text-mail-foreground text-sm">
									Drop files here to attach
								</p>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl">
						{/* To / Cc / Bcc */}
						<div className="shrink-0 overflow-visible border-[#E7E7E7] border-b pb-2 dark:border-[#252525]">
							<div className="flex justify-between px-3 pt-3">
								<div className="flex w-full min-w-0 items-center gap-2">
									<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
										To:
									</p>
									<Controller
										name="to"
										control={control}
										render={({ field }) => (
											<EmailPillsInput
												emails={field.value}
												onChange={field.onChange}
												placeholder="Enter email address"
												disabled={isSending}
											/>
										)}
									/>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<button
										type="button"
										tabIndex={-1}
										onClick={() => setShowCc((v) => !v)}
										className={cn(
											"cursor-pointer rounded-sm px-1 py-0.5 font-medium text-[#8C8C8C] text-sm transition-colors hover:bg-gray-50 hover:text-[#A8A8A8] dark:hover:bg-[var(--inbox-control-hover)]",
											showCc && "text-mail-foreground",
										)}
									>
										Cc
									</button>
									<button
										type="button"
										tabIndex={-1}
										onClick={() => setShowBcc((v) => !v)}
										className={cn(
											"cursor-pointer rounded-sm px-1 py-0.5 font-medium text-[#8C8C8C] text-sm transition-colors hover:bg-gray-50 hover:text-[#A8A8A8] dark:hover:bg-[var(--inbox-control-hover)]",
											showBcc && "text-mail-foreground",
										)}
									>
										Bcc
									</button>
									<button
										type="button"
										tabIndex={-1}
										onClick={onClose}
										disabled={isSending}
										className="cursor-pointer rounded-sm px-1 py-0.5 text-[#8C8C8C] transition-colors hover:bg-gray-50 hover:text-[#A8A8A8] dark:hover:bg-[var(--inbox-control-hover)]"
										aria-label="Close"
									>
										<XIcon className="h-3.5 w-3.5 text-[#9A9A9A]" />
									</button>
								</div>
							</div>

							{(showCc || showBcc) && (
								<div className="flex flex-col gap-2 pt-2">
									{showCc && (
										<div className="flex items-center gap-2 px-3">
											<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
												Cc:
											</p>
											<Controller
												name="cc"
												control={control}
												render={({ field }) => (
													<EmailPillsInput
														emails={field.value}
														onChange={field.onChange}
														placeholder="Enter email for Cc"
														disabled={isSending}
													/>
												)}
											/>
										</div>
									)}
									{showBcc && (
										<div className="flex items-center gap-2 px-3">
											<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
												Bcc:
											</p>
											<Controller
												name="bcc"
												control={control}
												render={({ field }) => (
													<EmailPillsInput
														emails={field.value}
														onChange={field.onChange}
														placeholder="Enter email for Bcc"
														disabled={isSending}
													/>
												)}
											/>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Subject */}
						<div className="flex items-center gap-2 border-[#E7E7E7] border-b p-3 dark:border-[#252525]">
							<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
								Subject:
							</p>
							<input
								className="h-4 w-full bg-transparent font-normal text-black text-sm leading-normal outline-none placeholder:text-[#797979] dark:text-white/90"
								placeholder="Re: Design review feedback"
								disabled={isSending}
								{...register("subject")}
							/>
						</div>

						{/* Body */}
						<div
							className="flex-1 overflow-y-auto border-[#E7E7E7] border-t bg-white px-3 py-3 dark:border-[#252525] dark:bg-[#202020]"
							onClick={() => bodyRef.current?.focus()}
							onKeyDown={() => {}}
						>
							<textarea
								{...bodyRegister}
								ref={(el) => {
									bodyRegisterRef(el);
									bodyRef.current = el;
								}}
								placeholder="Start writing..."
								disabled={isSending}
								rows={8}
								className="min-h-[200px] w-full resize-none border-0 bg-transparent p-0 text-black text-sm leading-relaxed outline-none placeholder:text-[#797979] dark:text-white/90"
								onKeyDown={(e) => {
									if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
										e.preventDefault();
										void handleSubmit(onSubmit)();
									}
								}}
							/>
						</div>
					</div>

					{/* Bottom actions — Zero style */}
					<div className="inline-flex w-full shrink-0 items-end justify-between self-stretch rounded-b-2xl bg-white px-3 py-3 dark:bg-[#202020]">
						<div className="flex items-center justify-start gap-2">
							<button
								type="submit"
								disabled={
									isSending ||
									to.length === 0 ||
									attachments.some((att) => att.isUploading)
								}
								className="inline-flex h-8 items-center gap-2 rounded-md bg-black px-3 text-sm text-white transition-opacity disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-black"
							>
								<span>{isSending ? "Sending…" : "Send"}</span>
								<span className="hidden h-5 items-center gap-0.5 rounded-sm bg-white/10 px-1 sm:inline-flex dark:bg-black/10">
									<Command className="h-3.5 w-3.5" />
									<CornerDownLeft className="h-3.5 w-3.5" />
								</span>
							</button>

							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isSending}
								className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-[#E7E7E7] bg-transparent px-2 text-mail-foreground text-sm transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-[#2B2B2B] dark:hover:bg-[var(--inbox-control-hover)]"
							>
								<Plus className="h-3 w-3 text-[#9A9A9A]" />
								<span className="hidden px-0.5 md:inline">Add</span>
							</button>

							{attachments.length > 0 && (
								<Popover.Root>
									<Popover.Trigger asChild>
										<button
											type="button"
											className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#E7E7E7] bg-white/5 px-2 py-1 text-sm hover:bg-black/5 dark:border-[#2B2B2B] dark:hover:bg-white/10"
											aria-label={`View ${attachments.length} attached file${attachments.length === 1 ? "" : "s"}`}
										>
											<Paperclip className="h-3.5 w-3.5 text-[#9A9A9A]" />
											<span className="font-medium">{attachments.length}</span>
										</button>
									</Popover.Trigger>
									<Popover.Content
										align="start"
										sideOffset={6}
										showArrow={false}
										className="z-[100] w-[340px] rounded-lg border border-[#E7E7E7] bg-white p-0 shadow-lg dark:border-[#2B2B2B] dark:bg-[#202020]"
									>
										<div className="flex flex-col">
											<div className="border-[#E7E7E7] border-b p-3 dark:border-[#2B2B2B]">
												<h4 className="font-semibold text-black text-sm dark:text-white/90">
													Attachments
												</h4>
												<p className="text-mail-muted text-xs">
													{attachments.length}{" "}
													{attachments.length === 1 ? "file" : "files"}
												</p>
											</div>
											<div className="max-h-[250px] space-y-0.5 overflow-y-auto p-1.5">
												{attachments.map((file, idx) => {
													const nameParts = file.name.split(".");
													const extension =
														nameParts.length > 1 ? nameParts.pop() : undefined;
													const nameWithoutExt = nameParts.join(".");
													const truncatedName =
														nameWithoutExt.length > 22
															? `${nameWithoutExt.slice(0, 22)}…`
															: nameWithoutExt;
													return (
														<div
															key={file.id}
															className={cn(
																"group flex items-center justify-between gap-3 rounded-md px-1.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/10",
																file.isUploading && "opacity-60",
															)}
														>
															<div className="flex min-w-0 flex-1 items-center gap-3">
																<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#F0F0F0] dark:bg-[#2C2C2C]">
																	{file.isUploading ? (
																		<Loader2 className="h-3.5 w-3.5 animate-spin text-mail-muted" />
																	) : (
																		<span className="text-sm" aria-hidden>
																			{attachmentIcon(file.content_type)}
																		</span>
																	)}
																</div>
																<div className="flex min-w-0 flex-1 flex-col">
																	<p
																		className="flex items-baseline text-black text-sm dark:text-white/90"
																		title={file.name}
																	>
																		<span className="truncate">
																			{truncatedName}
																		</span>
																		{extension && (
																			<span className="ml-0.5 shrink-0 text-[#8C8C8C] text-[10px]">
																				.{extension}
																			</span>
																		)}
																	</p>
																	<p className="text-mail-muted text-xs">
																		{file.size}
																	</p>
																</div>
															</div>
															<button
																type="button"
																onClick={() => removeAttachment(idx)}
																className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
																aria-label={`Remove ${file.name}`}
															>
																<XIcon className="h-3.5 w-3.5 text-mail-muted" />
															</button>
														</div>
													);
												})}
											</div>
										</div>
									</Popover.Content>
								</Popover.Root>
							)}
						</div>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
