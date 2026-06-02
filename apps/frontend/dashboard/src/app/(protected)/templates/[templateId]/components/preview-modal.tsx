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
		const payload = version.variables.reduce((acc, cur) => {
			acc[cur] = `[value_${cur}]`;
			return acc;
		}, {} as Record<string, string>);
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

	const width = viewport === "desktop" ? "100%" : viewportWidths[viewport][orientation];
	const height = viewport === "desktop" ? "100%" : viewportHeights[viewport][orientation];

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="h-[92vh] max-w-[96vw] rounded-2xl border border-stroke-soft-100/50 p-0 font-sans transition-all overflow-hidden"
				showClose={true}
			>
				<div className="flex h-full w-full flex-col md:flex-row overflow-hidden bg-bg-white-0 dark:bg-zinc-950">
					{/* Left Sidebar: Version Details & Envelope Simulator */}
					<div className="w-full md:w-[380px] shrink-0 border-b md:border-b-0 md:border-r border-stroke-soft-100/50 bg-zinc-50/30 dark:bg-zinc-900/10 flex flex-col overflow-y-auto">
						{/* Header Metadata section */}
						<div className="p-5 border-b border-stroke-soft-100/50 space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 tracking-tight">
									{displayLabel}
								</h3>
								{version.isMajor ? (
									<span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 font-semibold text-[10px] text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
										Released
									</span>
								) : (
									<span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 font-semibold text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shadow-sm">
										Draft
									</span>
								)}
							</div>

							{/* Creator Info */}
							<div className="flex items-center gap-2.5">
								<Avatar.Root size="24" color="gray" className="shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-800">
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
								<div className="flex flex-col min-w-0">
									<span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
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
								<div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-100 dark:border-zinc-800/40 shadow-inner">
									<div className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-1 select-none">
										<Info size={11} />
										<span>Changelog / Details</span>
									</div>
									<p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal break-words">
										{version.description}
									</p>
								</div>
							)}
						</div>

						{/* Envelope Simulator section */}
						<div className="p-5 border-b border-stroke-soft-100/50 space-y-3">
							<span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 select-none">
								<Mail size={11} />
								<span>Envelope Headers</span>
							</span>

							<div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 shadow-sm space-y-2.5">
								{/* From */}
								<div className="flex items-start gap-2 text-[11px]">
									<span className="font-semibold text-zinc-400 dark:text-zinc-500 w-11 shrink-0 pt-0.5">
										From
									</span>
									<div className="min-w-0 flex-1">
										<span className="font-medium text-zinc-800 dark:text-zinc-200 break-all">
											{version.fromEmail || "sender@reloop.co"}
										</span>
									</div>
								</div>

								{/* Reply-To */}
								{version.replyTo && (
									<div className="flex items-start gap-2 text-[11px] border-t border-zinc-100 dark:border-zinc-900/50 pt-2">
										<span className="font-semibold text-zinc-400 dark:text-zinc-500 w-11 shrink-0 pt-0.5">
											Reply
										</span>
										<div className="min-w-0 flex-1">
											<span className="text-zinc-600 dark:text-zinc-400 break-all">
												{version.replyTo}
											</span>
										</div>
									</div>
								)}

								{/* To */}
								<div className="flex items-start gap-2 text-[11px] border-t border-zinc-100 dark:border-zinc-900/50 pt-2">
									<span className="font-semibold text-zinc-400 dark:text-zinc-500 w-11 shrink-0 pt-0.5">
										To
									</span>
									<div className="min-w-0 flex-1">
										<span className="text-zinc-500 dark:text-zinc-500">
											recipient@example.com
										</span>
									</div>
								</div>

								{/* Subject */}
								<div className="flex items-start gap-2 text-[11px] border-t border-zinc-100 dark:border-zinc-900/50 pt-2">
									<span className="font-semibold text-zinc-400 dark:text-zinc-500 w-11 shrink-0 pt-0.5">
										Subject
									</span>
									<div className="min-w-0 flex-1">
										<span className="font-bold text-zinc-900 dark:text-zinc-100 leading-snug break-words block">
											{displaySubject}
										</span>
									</div>
								</div>

								{/* Preview Text / Preheader */}
								<div className="flex items-start gap-2 text-[11px] border-t border-zinc-100 dark:border-zinc-900/50 pt-2">
									<span className="font-semibold text-zinc-400 dark:text-zinc-500 w-11 shrink-0 pt-0.5">
										Preview
									</span>
									<div className="min-w-0 flex-1">
										<span className="text-zinc-500 dark:text-zinc-400 italic break-words block leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/20 px-1.5 py-0.5 rounded font-mono text-[10px]">
											{version.previewText || "(None set)"}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Template Variables section */}
						<div className="p-5 flex-1 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 select-none">
									Template Variables ({version.variables?.length || 0})
								</span>
								{version.variables && version.variables.length > 0 && (
									<button
										type="button"
										onClick={handleCopyAllVariablesAsJSON}
										className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
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
											className="group/var relative flex items-center justify-between gap-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-2.5 py-1.5 border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] text-zinc-700 dark:text-zinc-300 font-mono transition-all duration-150 shadow-sm"
										>
											<span>{`{{ ${variable} }}`}</span>
											<button
												type="button"
												onClick={() => handleCopyVariable(variable)}
												className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 ml-1 transition-all active:scale-90"
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
								<div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-500">
									<Info size={14} className="mb-1" />
									<span className="text-[10px]">No template variables detected.</span>
								</div>
							)}
						</div>
					</div>

					{/* Right Content Area: Device Simulator */}
					<div className="flex-1 flex flex-col overflow-hidden bg-zinc-100/50 dark:bg-[#0c0c0e]">
						{/* Simulator Header / Toolbar */}
						<div className="shrink-0 h-16 border-b border-stroke-soft-100/50 px-6 flex items-center justify-between bg-white dark:bg-zinc-950 z-10 shadow-sm">
							{/* Device Selectors */}
							<div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200/30 dark:border-zinc-800/50 shadow-inner">
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
												"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ease-out select-none",
												isSelected
													? "bg-white text-zinc-900 shadow-md border border-zinc-200/10 dark:bg-zinc-800 dark:text-zinc-50"
													: "text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200"
											)}
										>
											<IconComp
												size={13}
												className={cn(
													"transition-transform duration-200",
													isSelected && "scale-110"
												)}
											/>
											<span className="hidden sm:inline">{device.label}</span>
										</button>
									);
								})}
							</div>

							{/* Center: Orientation Toggle (Only for mobile/tablet) */}
							{(viewport === "mobile" || viewport === "tablet") ? (
								<div className="flex items-center gap-2.5">
									<button
										type="button"
										onClick={() =>
											setOrientation((prev) =>
												prev === "portrait" ? "landscape" : "portrait",
											)
										}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all duration-150 active:scale-95 shadow-sm"
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

									<span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
										{viewportWidths[viewport][orientation]} ×{" "}
										{viewportHeights[viewport][orientation]}
									</span>
								</div>
							) : (
								<span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hidden md:inline select-none">
									Responsive Canvas
								</span>
							)}

							{/* Right Actions */}
							<div className="flex items-center gap-2 mr-12">
								{/* Refresh */}
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={handleRefresh}
									className="size-8 rounded-lg p-0 text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/60"
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
									className="h-8 px-2.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/60 gap-1.5"
									title="Copy Raw HTML"
								>
									{copiedHtml ? (
										<Check size={13} className="text-emerald-500" />
									) : (
										<Copy size={13} />
									)}
									<span className="text-xs font-semibold hidden md:inline">Copy HTML</span>
								</Button.Root>

								{/* Open in New Tab */}
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={handleOpenInNewTab}
									className="h-8 px-2.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/60 gap-1.5"
									title="Open in new browser tab"
								>
									<ExternalLink size={13} />
									<span className="text-xs font-semibold hidden md:inline">Open Tab</span>
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
									className="gap-1.5 ml-2 font-semibold shadow-sm text-xs py-1 px-3 h-8"
								>
									<ArrowUpRight size={13} />
									<span>Load Version</span>
								</Button.Root>
							</div>
						</div>

						{/* Mock Device Sandbox Area */}
						<div className="flex-1 overflow-auto p-6 md:p-10 flex items-center justify-center relative">
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
									"relative transition-all duration-300 flex flex-col",
									viewport === "desktop"
										? "w-full h-full rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl overflow-hidden"
										: viewport === "tablet"
											? "border-[12px] border-zinc-950 dark:border-zinc-800 bg-zinc-950 dark:bg-zinc-800 shadow-2xl overflow-hidden rounded-[32px] ring-1 ring-zinc-900/10 dark:ring-zinc-800/20"
											: "border-[10px] border-zinc-950 dark:border-zinc-800 bg-zinc-950 dark:bg-zinc-800 shadow-2xl overflow-hidden rounded-[42px] ring-1 ring-zinc-900/10 dark:ring-zinc-800/20"
								)}
							>
								{/* 1. Desktop Browser Chrome */}
								{viewport === "desktop" && (
									<div className="shrink-0 h-10 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 flex items-center gap-3 select-none">
										{/* Red/Yellow/Green Window Dots */}
										<div className="flex gap-1.5 shrink-0">
											<div className="size-2.5 rounded-full bg-[#ff5f56]" />
											<div className="size-2.5 rounded-full bg-[#ffbd2e]" />
											<div className="size-2.5 rounded-full bg-[#27c93f]" />
										</div>
										{/* address bar */}
										<div className="flex-1 max-w-lg mx-auto h-6 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center gap-1.5 px-3 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium shadow-inner">
											<Lock size={9} className="text-zinc-400" />
											<span className="truncate">
												reloop.co/templates/{templateId || "builder"}/preview/{version.id}
											</span>
										</div>
										{/* spacer */}
										<div className="w-12 shrink-0" />
									</div>
								)}

								{/* 2. Mobile Dynamic Island / Notch */}
								{viewport === "mobile" && orientation === "portrait" && (
									<div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-5 bg-zinc-950 rounded-full z-30 flex items-center justify-between px-2.5">
										<div className="size-1 rounded-full bg-zinc-900/80" />
										<div className="size-1.5 rounded-full bg-blue-950/70 border border-blue-900/20" />
									</div>
								)}

								{/* Home Indicator line (mobile portrait/landscape) */}
								{viewport === "mobile" && (
									<div
										className={cn(
											"absolute bg-zinc-850 dark:bg-zinc-450 rounded-full z-30",
											orientation === "portrait"
												? "bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1"
												: "bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1"
										)}
									/>
								)}

								{/* Core Frame Body */}
								<div
									className={cn(
										"flex-1 relative bg-white dark:bg-zinc-950",
										viewport === "desktop"
											? ""
											: viewport === "tablet"
												? "rounded-2xl overflow-hidden m-1"
												: orientation === "portrait"
													? "rounded-[32px] overflow-hidden mt-6 mb-4 mx-1"
													: "rounded-[32px] overflow-hidden my-1 mx-6"
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
										<div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs gap-2 select-none">
											<ShieldAlert size={20} className="text-zinc-300 dark:text-zinc-700" />
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

