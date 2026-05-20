"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { ArrowUpRight, Laptop, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

interface TemplateVersion {
	id: string;
	templateId: string;
	version: number;
	subject: string | null;
	fromEmail: string | null;
	replyTo: string | null;
	previewText: string | null;
	description: string | null;
	name: string | null;
	isMajor: boolean;
	content: unknown[];
	variables: string[];
	renderedHtml: string | null;
	createdByUserId: string;
	createdAt: string;
	createdBy?: {
		id: string;
		name: string;
		email: string;
		image?: string;
	};
}

interface PreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	version: TemplateVersion;
	currentHtml: string;
	currentSubject: string;
	onRestore: (version: TemplateVersion) => void;
	isRestoring: boolean;
}

export function PreviewModal({
	isOpen,
	onClose,
	version,
	currentHtml,
	currentSubject,
	onRestore,
	isRestoring,
}: PreviewModalProps) {
	const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
		"desktop",
	);

	const viewportWidths = {
		desktop: "100%",
		tablet: "768px",
		mobile: "375px",
	};

	const displayLabel = version.isMajor
		? version.name || `v${version.version}`
		: version.name || `Draft ${version.version}`;

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="h-[90vh] max-w-[90vw] rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans transition-all"
				showClose={true}
			>
				<div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-100/50 bg-bg-white-0 dark:bg-zinc-950">
					{/* Modal Header */}
					<Modal.Header className="shrink-0 before:border-stroke-soft-200/50">
						<div className="flex flex-1 items-center justify-between">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Modal.Title className="font-bold text-sm">
										Previewing {displayLabel}
									</Modal.Title>
									{version.isMajor ? (
										<span className="rounded bg-emerald-50 px-2 py-0.5 font-bold font-mono text-[9px] text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
											Released
										</span>
									) : (
										<span className="rounded bg-zinc-100 px-2 py-0.5 font-bold font-mono text-[9px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
											Draft
										</span>
									)}
								</div>
								{version.description && (
									<p className="font-normal text-[11px] text-text-sub-600 dark:text-zinc-400">
										{version.description}
									</p>
								)}
							</div>

							{/* Actions */}
							<div className="mr-8 flex items-center gap-4">
								{/* Viewport controls */}
								<div className="flex items-center gap-1 rounded-lg bg-bg-weak-50 p-0.5 dark:bg-zinc-900">
									<Button.Root
										type="button"
										variant="neutral"
										mode={viewport === "desktop" ? "lighter" : "ghost"}
										size="xxsmall"
										onClick={() => setViewport("desktop")}
										className="size-7 rounded p-1"
									>
										<Laptop size={14} />
									</Button.Root>
									<Button.Root
										type="button"
										variant="neutral"
										mode={viewport === "tablet" ? "lighter" : "ghost"}
										size="xxsmall"
										onClick={() => setViewport("tablet")}
										className="size-7 rounded p-1"
									>
										<Tablet size={14} />
									</Button.Root>
									<Button.Root
										type="button"
										variant="neutral"
										mode={viewport === "mobile" ? "lighter" : "ghost"}
										size="xxsmall"
										onClick={() => setViewport("mobile")}
										className="size-7 rounded p-1"
									>
										<Smartphone size={14} />
									</Button.Root>
								</div>

								{/* Restore Button */}
								<Button.Root
									variant="primary"
									size="xsmall"
									onClick={() => {
										onRestore(version);
										onClose();
									}}
									disabled={isRestoring}
									className="gap-1.5"
								>
									<ArrowUpRight size={13} />
									Load in Editor
								</Button.Root>
							</div>
						</div>
					</Modal.Header>

					{/* Modal Body / Sandbox Viewport */}
					<Modal.Body className="flex flex-1 items-center justify-center overflow-hidden bg-neutral-100 p-6 dark:bg-zinc-900/30">
						<div
							style={{ width: viewportWidths[viewport] }}
							className="relative h-full overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-lg transition-all duration-300"
						>
							{version.renderedHtml ? (
								<iframe
									srcDoc={version.renderedHtml}
									title={`${displayLabel} Sandbox Preview`}
									className="absolute inset-0 size-full border-0"
									sandbox="allow-popups-to-escape-sandbox allow-same-origin"
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center text-text-soft-400 text-xs">
									No rendered HTML available for this version.
								</div>
							)}
						</div>
					</Modal.Body>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
