"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Modal from "@reloop/ui/modal";
import { motion } from "framer-motion";
import {
	ArrowUpRight,
	Check,
	Copy,
	ExternalLink,
	Info,
	Laptop,
	Lock,
	Mail,
	RotateCcw,
	ShieldAlert,
	Smartphone,
	Tablet,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

function formatRelativeTime(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "just now";
	if (minutes < 60) {
		return minutes === 1 ? "1m ago" : `${minutes}m ago`;
	}
	if (hours < 24) {
		return hours === 1 ? "1h ago" : `${hours}h ago`;
	}
	if (days === 1) {
		return "yesterday";
	}
	if (days < 7) {
		return `${days}d ago`;
	}

	const day = date.getDate();
	const month = date.toLocaleDateString("en-US", { month: "short" });
	const year = date.getFullYear();
	const currentYear = now.getFullYear();

	if (year === currentYear) {
		return `${day} ${month}`;
	}
	return `${day} ${month}, ${year}`;
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
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;

	const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
		"desktop",
	);
	const [orientation, setOrientation] = useState<"portrait" | "landscape">(
		"portrait",
	);

	const [copiedHtml, setCopiedHtml] = useState(false);
	const [copiedVar, setCopiedVar] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const viewportWidths = {
		desktop: { portrait: "100%", landscape: "100%" },
		tablet: { portrait: "768px", landscape: "1024px" },
		mobile: { portrait: "375px", landscape: "720px" },
	};

	const viewportHeights = {
		desktop: { portrait: "100%", landscape: "100%" },
		tablet: { portrait: "90%", landscape: "500px" },
		mobile: { portrait: "660px", landscape: "375px" },
	};

	const displayLabel = version.isMajor
		? version.name || `v${version.version}.0`
		: version.name || `Draft ${version.version}`;

	const displaySubject = version.subject || currentSubject || "(No Subject)";
	const displayHtml = version.renderedHtml || currentHtml;

	const handleCopyHtml = () => {
		if (!displayHtml) return;
		navigator.clipboard.writeText(displayHtml);
		setCopiedHtml(true);
		toast.success("HTML copied to clipboard!");
		setTimeout(() => setCopiedHtml(false), 2000);
	};

	const handleCopyVariable = (variable: string) => {
		const varSyntax = `{{${variable}}}`;
		navigator.clipboard.writeText(varSyntax);
		setCopiedVar(variable);
		toast.success(`Copied ${varSyntax}`);
		setTimeout(() => setCopiedVar(null), 2000);
	};

	const handleCopyAllVariablesAsJSON = () => {
		if (!version.variables || version.variables.length === 0) return;
		const payload = version.variables.reduce(
			(acc, cur) => {
				acc[cur] = `[value_${cur}]`;
				return acc;
			},
			{} as Record<string, string>,
		);
		navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
		toast.success("Variables copied as mock JSON payload!");
	};

	const handleOpenInNewTab = () => {
		if (!displayHtml) return;
		const blob = new Blob([displayHtml], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		window.open(url, "_blank");
	};

	const handleRefresh = () => {
		setIsRefreshing(true);
		setRefreshKey((prev) => prev + 1);
		setTimeout(() => setIsRefreshing(false), 600);
	};

	const width =
		viewport === "desktop" ? "100%" : viewportWidths[viewport][orientation];
	const height =
		viewport === "desktop" ? "100%" : viewportHeights[viewport][orientation];

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="h-[92vh] max-w-[96vw] overflow-hidden rounded-2xl border border-stroke-soft-100/50 p-0 font-sans transition-all"
				showClose={true}
			>
				<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 md:flex-row dark:bg-zinc-950">
					{/* Left Sidebar: Version Details & Envelope Simulator */}
					<div className="flex w-full shrink-0 flex-col overflow-y-auto border-stroke-soft-100/50 border-b bg-zinc-50/30 md:w-[380px] md:border-r md:border-b-0 dark:bg-zinc-900/10">
						{/* Header Metadata section */}
						<div className="space-y-4 border-stroke-soft-100/50 border-b p-5">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-base text-zinc-900 tracking-tight dark:text-zinc-50">
									{displayLabel}
								</h3>
								{version.isMajor ? (
									<span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 font-semibold text-[10px] text-emerald-600 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400">
										Released
									</span>
								) : (
									<span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 font-semibold text-[10px] text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
										Draft
									</span>
								)}
							</div>

							{/* Creator Info */}
							<div className="flex items-center gap-2.5">
								<Avatar.Root
									size="24"
									color="gray"
									className="shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-800"
								>
									{version.createdBy?.image && (
										<Avatar.Image
											src={version.createdBy.image}
											alt={version.createdBy.name || "Developer"}
										/>
									)}
									<Avatar.Image asChild>
										<span
											className={cn(
												"flex h-full w-full items-center justify-center font-bold text-[9px] text-white",
												getAvatarGradient(
													version.createdBy?.email || "developer@reloop.co",
												),
											)}
										>
											{getAvatarInitial(
												version.createdBy?.name || null,
												version.createdBy?.email || "developer@reloop.co",
											)}
										</span>
									</Avatar.Image>
								</Avatar.Root>
								<div className="flex min-w-0 flex-col">
									<span className="truncate font-semibold text-xs text-zinc-800 dark:text-zinc-200">
										{version.createdBy?.name ||
											version.createdBy?.email ||
											"Developer"}
									</span>
									<span className="text-[10px] text-zinc-400 dark:text-zinc-500">
										Created {formatRelativeTime(version.createdAt)}
									</span>
								</div>
							</div>

							{/* Version Changelog / Description */}
							{version.description && (
								<div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 shadow-inner dark:border-zinc-800/40 dark:bg-zinc-900/50">
									<div className="mb-1 flex select-none items-center gap-1.5 font-bold text-[9px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
										<Info size={11} />
										<span>Changelog / Details</span>
									</div>
									<p className="break-words font-normal text-[11px] text-zinc-600 leading-relaxed dark:text-zinc-300">
										{version.description}
									</p>
								</div>
							)}
						</div>

						{/* Envelope Simulator section */}
						<div className="space-y-3 border-stroke-soft-100/50 border-b p-5">
							<span className="flex select-none items-center gap-1.5 font-bold text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
								<Mail size={11} />
								<span>Envelope Headers</span>
							</span>

							<div className="space-y-2.5 rounded-xl border border-zinc-200/60 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
								{/* From */}
								<div className="flex items-start gap-2 text-[11px]">
									<span className="w-11 shrink-0 pt-0.5 font-semibold text-zinc-400 dark:text-zinc-500">
										From
									</span>
									<div className="min-w-0 flex-1">
										<span className="break-all font-medium text-zinc-800 dark:text-zinc-200">
											{version.fromEmail || "sender@reloop.co"}
										</span>
									</div>
								</div>

								{/* Reply-To */}
								{version.replyTo && (
									<div className="flex items-start gap-2 border-zinc-100 border-t pt-2 text-[11px] dark:border-zinc-900/50">
										<span className="w-11 shrink-0 pt-0.5 font-semibold text-zinc-400 dark:text-zinc-500">
											Reply
										</span>
										<div className="min-w-0 flex-1">
											<span className="break-all text-zinc-600 dark:text-zinc-400">
												{version.replyTo}
											</span>
										</div>
									</div>
								)}

								{/* To */}
								<div className="flex items-start gap-2 border-zinc-100 border-t pt-2 text-[11px] dark:border-zinc-900/50">
									<span className="w-11 shrink-0 pt-0.5 font-semibold text-zinc-400 dark:text-zinc-500">
										To
									</span>
									<div className="min-w-0 flex-1">
										<span className="text-zinc-500 dark:text-zinc-500">
											recipient@example.com
										</span>
									</div>
								</div>

								{/* Subject */}
								<div className="flex items-start gap-2 border-zinc-100 border-t pt-2 text-[11px] dark:border-zinc-900/50">
									<span className="w-11 shrink-0 pt-0.5 font-semibold text-zinc-400 dark:text-zinc-500">
										Subject
									</span>
									<div className="min-w-0 flex-1">
										<span className="block break-words font-bold text-zinc-900 leading-snug dark:text-zinc-100">
											{displaySubject}
										</span>
									</div>
								</div>

								{/* Preview Text / Preheader */}
								<div className="flex items-start gap-2 border-zinc-100 border-t pt-2 text-[11px] dark:border-zinc-900/50">
									<span className="w-11 shrink-0 pt-0.5 font-semibold text-zinc-400 dark:text-zinc-500">
										Preview
									</span>
									<div className="min-w-0 flex-1">
										<span className="block break-words rounded bg-zinc-50/50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 italic leading-relaxed dark:bg-zinc-900/20 dark:text-zinc-400">
											{version.previewText || "(None set)"}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Template Variables section */}
						<div className="flex-1 space-y-3 p-5">
							<div className="flex items-center justify-between">
								<span className="select-none font-bold text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
									Template Variables ({version.variables?.length || 0})
								</span>
								{version.variables && version.variables.length > 0 && (
									<button
										type="button"
										onClick={handleCopyAllVariablesAsJSON}
										className="flex items-center gap-1 font-semibold text-[10px] text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
									>
										<Copy size={10} />
										<span>Copy JSON</span>
									</button>
								)}
							</div>

							{version.variables && version.variables.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{version.variables.map((variable) => (
										<div
											key={variable}
											className="group/var relative flex items-center justify-between gap-1.5 rounded-lg border border-zinc-200/50 bg-zinc-100 px-2.5 py-1.5 font-mono text-[10px] text-zinc-700 shadow-sm transition-all duration-150 hover:bg-zinc-200/80 dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
										>
											<span>{`{{ ${variable} }}`}</span>
											<button
												type="button"
												onClick={() => handleCopyVariable(variable)}
												className="ml-1 text-zinc-400 transition-all hover:text-zinc-700 active:scale-90 dark:text-zinc-500 dark:hover:text-zinc-300"
												title="Copy variable syntax"
											>
												{copiedVar === variable ? (
													<Check size={11} className="text-emerald-500" />
												) : (
													<Copy size={10} />
												)}
											</button>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 border-dashed bg-zinc-50/50 p-6 text-center text-zinc-400 dark:border-zinc-800/60 dark:bg-zinc-900/20 dark:text-zinc-500">
									<Info size={14} className="mb-1" />
									<span className="text-[10px]">
										No template variables detected.
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Right Content Area: Device Simulator */}
					<div className="flex flex-1 flex-col overflow-hidden bg-zinc-100/50 dark:bg-[#0c0c0e]">
						{/* Simulator Header / Toolbar */}
						<div className="z-10 flex h-16 shrink-0 items-center justify-between border-stroke-soft-100/50 border-b bg-white px-6 shadow-sm dark:bg-zinc-950">
							{/* Device Selectors */}
							<div className="flex items-center gap-1 rounded-xl border border-zinc-200/30 bg-zinc-100 p-0.5 shadow-inner dark:border-zinc-800/50 dark:bg-zinc-900">
								{[
									{ id: "desktop", label: "Desktop", icon: Laptop },
									{ id: "tablet", label: "Tablet", icon: Tablet },
									{ id: "mobile", label: "Mobile", icon: Smartphone },
								].map((device) => {
									const IconComp = device.icon;
									const isSelected = viewport === device.id;
									return (
										<button
											key={device.id}
											type="button"
											onClick={() => {
												setViewport(device.id as any);
												// set orientation to portrait by default on switch
												setOrientation("portrait");
											}}
											className={cn(
												"flex select-none items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-xs transition-all duration-200 ease-out",
												isSelected
													? "border border-zinc-200/10 bg-white text-zinc-900 shadow-md dark:bg-zinc-800 dark:text-zinc-50"
													: "text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200",
											)}
										>
											<IconComp
												size={13}
												className={cn(
													"transition-transform duration-200",
													isSelected && "scale-110",
												)}
											/>
											<span className="hidden sm:inline">{device.label}</span>
										</button>
									);
								})}
							</div>

							{/* Center: Orientation Toggle (Only for mobile/tablet) */}
							{viewport === "mobile" || viewport === "tablet" ? (
								<div className="flex items-center gap-2.5">
									<button
										type="button"
										onClick={() =>
											setOrientation((prev) =>
												prev === "portrait" ? "landscape" : "portrait",
											)
										}
										className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-xs text-zinc-700 shadow-sm transition-all duration-150 hover:border-zinc-300 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700"
									>
										<RotateCcw
											size={12}
											className={cn(
												"transition-transform duration-300",
												orientation === "landscape" && "rotate-90",
											)}
										/>
										<span>
											{orientation === "portrait" ? "Portrait" : "Landscape"}
										</span>
									</button>

									<span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
										{viewportWidths[viewport][orientation]} ×{" "}
										{viewportHeights[viewport][orientation]}
									</span>
								</div>
							) : (
								<span className="hidden select-none font-mono text-[10px] text-zinc-400 md:inline dark:text-zinc-500">
									Responsive Canvas
								</span>
							)}

							{/* Right Actions */}
							<div className="mr-12 flex items-center gap-2">
								{/* Refresh */}
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={handleRefresh}
									className="size-8 rounded-lg border border-zinc-200/20 p-0 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-900"
									title="Refresh Iframe"
								>
									<RotateCcw
										size={13}
										className={cn(
											"transition-all duration-300",
											isRefreshing && "animate-spin",
										)}
									/>
								</Button.Root>

								{/* Copy HTML */}
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={handleCopyHtml}
									className="h-8 gap-1.5 rounded-lg border border-zinc-200/20 px-2.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-900"
									title="Copy Raw HTML"
								>
									{copiedHtml ? (
										<Check size={13} className="text-emerald-500" />
									) : (
										<Copy size={13} />
									)}
									<span className="hidden font-semibold text-xs md:inline">
										Copy HTML
									</span>
								</Button.Root>

								{/* Open in New Tab */}
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={handleOpenInNewTab}
									className="h-8 gap-1.5 rounded-lg border border-zinc-200/20 px-2.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-900"
									title="Open in new browser tab"
								>
									<ExternalLink size={13} />
									<span className="hidden font-semibold text-xs md:inline">
										Open Tab
									</span>
								</Button.Root>

								{/* Restore in Editor */}
								<Button.Root
									variant="primary"
									size="xsmall"
									onClick={() => {
										onRestore(version);
										onClose();
									}}
									disabled={isRestoring}
									className="ml-2 h-8 gap-1.5 px-3 py-1 font-semibold text-xs shadow-sm"
								>
									<ArrowUpRight size={13} />
									<span>Load Version</span>
								</Button.Root>
							</div>
						</div>

						{/* Mock Device Sandbox Area */}
						<div className="relative flex flex-1 items-center justify-center overflow-auto p-6 md:p-10">
							<motion.div
								layout
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ type: "spring", stiffness: 350, damping: 30 }}
								style={{
									width: width,
									height: height,
								}}
								className={cn(
									"relative flex flex-col transition-all duration-300",
									viewport === "desktop"
										? "h-full w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
										: viewport === "tablet"
											? "overflow-hidden rounded-[32px] border-[12px] border-zinc-950 bg-zinc-950 shadow-2xl ring-1 ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-800 dark:ring-zinc-800/20"
											: "overflow-hidden rounded-[42px] border-[10px] border-zinc-950 bg-zinc-950 shadow-2xl ring-1 ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-800 dark:ring-zinc-800/20",
								)}
							>
								{/* 1. Desktop Browser Chrome */}
								{viewport === "desktop" && (
									<div className="flex h-10 shrink-0 select-none items-center gap-3 border-zinc-200/80 border-b bg-zinc-50 px-4 dark:border-zinc-800/80 dark:bg-zinc-900">
										{/* Red/Yellow/Green Window Dots */}
										<div className="flex shrink-0 gap-1.5">
											<div className="size-2.5 rounded-full bg-[#ff5f56]" />
											<div className="size-2.5 rounded-full bg-[#ffbd2e]" />
											<div className="size-2.5 rounded-full bg-[#27c93f]" />
										</div>
										{/* address bar */}
										<div className="mx-auto flex h-6 max-w-lg flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 font-medium text-[10px] text-zinc-400 shadow-inner dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-500">
											<Lock size={9} className="text-zinc-400" />
											<span className="truncate">
												reloop.co/templates/{templateId || "builder"}/preview/
												{version.id}
											</span>
										</div>
										{/* spacer */}
										<div className="w-12 shrink-0" />
									</div>
								)}

								{/* 2. Mobile Dynamic Island / Notch */}
								{viewport === "mobile" && orientation === "portrait" && (
									<div className="-translate-x-1/2 absolute top-2 left-1/2 z-30 flex h-5 w-[100px] items-center justify-between rounded-full bg-zinc-950 px-2.5">
										<div className="size-1 rounded-full bg-zinc-900/80" />
										<div className="size-1.5 rounded-full border border-blue-900/20 bg-blue-950/70" />
									</div>
								)}

								{/* Home Indicator line (mobile portrait/landscape) */}
								{viewport === "mobile" && (
									<div
										className={cn(
											"absolute z-30 rounded-full bg-zinc-850 dark:bg-zinc-450",
											orientation === "portrait"
												? "-translate-x-1/2 bottom-1.5 left-1/2 h-1 w-28"
												: "-translate-x-1/2 bottom-1.5 left-1/2 h-1 w-28",
										)}
									/>
								)}

								{/* Core Frame Body */}
								<div
									className={cn(
										"relative flex-1 bg-white dark:bg-zinc-950",
										viewport === "desktop"
											? ""
											: viewport === "tablet"
												? "m-1 overflow-hidden rounded-2xl"
												: orientation === "portrait"
													? "mx-1 mt-6 mb-4 overflow-hidden rounded-[32px]"
													: "mx-6 my-1 overflow-hidden rounded-[32px]",
									)}
								>
									{displayHtml ? (
										<iframe
											key={refreshKey}
											srcDoc={displayHtml}
											title={`${displayLabel} Sandbox Preview`}
											className="absolute inset-0 size-full border-0 bg-white"
											sandbox="allow-popups-to-escape-sandbox allow-same-origin"
										/>
									) : (
										<div className="absolute inset-0 flex select-none flex-col items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
											<ShieldAlert
												size={20}
												className="text-zinc-300 dark:text-zinc-700"
											/>
											<span>No rendered HTML available for this version.</span>
										</div>
									)}
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
