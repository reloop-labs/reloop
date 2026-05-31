"use client";

import { useState } from "react";
import { Braces, ChevronLeft, Copy, Check, Search, Plus, Award, CheckCircle2, Send, ShieldAlert, Sparkles } from "lucide-react";
import * as Button from "@reloop/ui/button";
import { useEditorStore } from "./use-editor-store";
import { toast } from "sonner";
import { cn } from "@reloop/ui/cn";

interface PanelProps {
	onClose: () => void;
}

/* ------------------------------------------------------------------ */
/* Variables Panel Component                                         */
/* ------------------------------------------------------------------ */
export function VariablesPanel({ onClose }: PanelProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [customVars, setCustomVars] = useState<{ label: string; key: string }[]>([]);
	const [newLabel, setNewLabel] = useState("");
	const [newKey, setNewKey] = useState("");
	const [isAdding, setIsAdding] = useState(false);

	const defaultVars = [
		{ label: "Recipient First Name", key: "{{user.firstName}}" },
		{ label: "Recipient Last Name", key: "{{user.lastName}}" },
		{ label: "Recipient Email Address", key: "{{user.email}}" },
		{ label: "Company Name", key: "{{company.name}}" },
		{ label: "Unsubscribe Link", key: "{{unsubscribe_url}}" },
		{ label: "Current Calendar Year", key: "{{current_year}}" },
	];

	const allVars = [...defaultVars, ...customVars];

	const filteredVars = allVars.filter(
		(v) =>
			v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			v.key.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCopy = (key: string) => {
		navigator.clipboard.writeText(key);
		setCopiedKey(key);
		toast.success(`Copied placeholder: ${key}`);
		setTimeout(() => setCopiedKey(null), 2000);
	};

	const handleAddCustom = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newLabel || !newKey) {
			toast.error("Please enter both label and key");
			return;
		}

		let formattedKey = newKey.trim();
		if (!formattedKey.startsWith("{{")) formattedKey = "{{" + formattedKey;
		if (!formattedKey.endsWith("}}")) formattedKey = formattedKey + "}}";

		setCustomVars((prev) => [...prev, { label: newLabel, key: formattedKey }]);
		setNewLabel("");
		setNewKey("");
		setIsAdding(false);
		toast.success("Added custom variable");
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden py-4 pr-4 pl-14 shrink-0">
			<div className="flex flex-col h-full rounded-[18px] border border-stroke-soft-200 dark:border-stroke-soft-100/40 bg-bg-white-0 dark:bg-[#0a0a0a] overflow-hidden shadow-sm">
				{/* Header */}
				<div className="flex h-10 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a] shrink-0">
					<div className="flex items-center gap-1.5 p-0">
						<Braces size={14} className="text-text-strong-950 dark:text-white" />
						<span className="font-semibold text-text-strong-950 dark:text-white text-xs">
							Variables
						</span>
					</div>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={onClose}
						className="size-7 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
					>
						<ChevronLeft size={24} />
					</Button.Root>
				</div>

				{/* Search & Actions */}
				<div className="p-3 border-b border-stroke-soft-200 dark:border-stroke-soft-100/20 shrink-0 space-y-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 size-3.5 text-text-soft-400 dark:text-zinc-500" />
						<input
							type="text"
							placeholder="Search template variables..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-bg-weak-50 dark:bg-zinc-900 border border-stroke-soft-200 dark:border-stroke-soft-100/30 rounded-lg py-1.5 pl-8 pr-3 text-xs text-text-strong-950 dark:text-white placeholder-text-soft-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
						/>
					</div>
					{!isAdding ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xxsmall"
							onClick={() => setIsAdding(true)}
							className="w-full py-1.5 justify-center text-[11px] gap-1"
						>
							<Plus size={12} />
							Add Custom Variable
						</Button.Root>
					) : (
						<form onSubmit={handleAddCustom} className="p-2.5 rounded-lg border border-stroke-soft-200 dark:border-stroke-soft-100/20 bg-bg-weak-50 dark:bg-zinc-900/50 space-y-2">
							<div className="space-y-1">
								<label className="text-[10px] font-bold text-text-sub-600 dark:text-zinc-400">Label name</label>
								<input
									type="text"
									placeholder="e.g. Coupon Code"
									value={newLabel}
									onChange={(e) => setNewLabel(e.target.value)}
									className="w-full bg-white dark:bg-zinc-950 border border-stroke-soft-200 dark:border-stroke-soft-100/30 rounded px-2 py-1 text-xs text-text-strong-950 dark:text-white"
								/>
							</div>
							<div className="space-y-1">
								<label className="text-[10px] font-bold text-text-sub-600 dark:text-zinc-400">Variable tag</label>
								<input
									type="text"
									placeholder="e.g. coupon_code"
									value={newKey}
									onChange={(e) => setNewKey(e.target.value)}
									className="w-full bg-white dark:bg-zinc-950 border border-stroke-soft-200 dark:border-stroke-soft-100/30 rounded px-2 py-1 text-xs text-text-strong-950 dark:text-white font-mono"
								/>
							</div>
							<div className="flex gap-2 justify-end pt-1">
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={() => setIsAdding(false)}
									className="h-6 text-[10px]"
								>
									Cancel
								</Button.Root>
								<Button.Root
									type="submit"
									variant="neutral"
									mode="filled"
									size="xxsmall"
									className="h-6 text-[10px]"
								>
									Save
								</Button.Root>
							</div>
						</form>
					)}
				</div>

				{/* List */}
				<div className="flex-1 overflow-y-auto p-3 space-y-2.5 hide-scrollbar">
					{filteredVars.length === 0 ? (
						<div className="text-center py-8 text-text-soft-400 text-xs dark:text-zinc-500">
							No variables match your search
						</div>
					) : (
						filteredVars.map((v) => (
							<div
								key={v.key}
								onClick={() => handleCopy(v.key)}
								className="group flex flex-col p-2.5 rounded-lg border border-stroke-soft-100 dark:border-stroke-soft-100/10 hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:hover:bg-zinc-900/30 cursor-pointer transition-all"
							>
								<div className="flex items-center justify-between">
									<span className="font-semibold text-text-strong-950 dark:text-zinc-200 text-xs">
										{v.label}
									</span>
									<span className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
										{copiedKey === v.key ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
									</span>
								</div>
								<span className="mt-1 font-mono text-[11px] text-text-soft-400 dark:text-zinc-500">
									{v.key}
								</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Score Panel Component                                             */
/* ------------------------------------------------------------------ */
export function ScorePanel({ onClose }: PanelProps) {
	return (
		<div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden py-4 pr-4 pl-14 shrink-0">
			<div className="flex flex-col h-full rounded-[18px] border border-stroke-soft-200 dark:border-stroke-soft-100/40 bg-bg-white-0 dark:bg-[#0a0a0a] overflow-hidden shadow-sm">
				{/* Header */}
				<div className="flex h-10 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a] shrink-0">
					<div className="flex items-center gap-1.5 p-0">
						<Award size={14} className="text-text-strong-950 dark:text-white" />
						<span className="font-semibold text-text-strong-950 dark:text-white text-xs">
							Template Score
						</span>
					</div>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={onClose}
						className="size-7 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
					>
						<ChevronLeft size={24} />
					</Button.Root>
				</div>

				{/* Score Circle Card */}
				<div className="p-4 border-b border-stroke-soft-200 dark:border-stroke-soft-100/20 bg-bg-weak-50/50 dark:bg-[#0c0c0c] flex flex-col items-center shrink-0">
					<div className="relative flex items-center justify-center size-24 rounded-full border-4 border-emerald-500/20 dark:border-emerald-950 bg-white dark:bg-zinc-950 shadow-inner">
						<div className="absolute text-center">
							<span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">98</span>
							<span className="text-xs text-text-soft-400 dark:text-zinc-500">/100</span>
						</div>
					</div>
					<span className="mt-3 font-semibold text-text-strong-950 dark:text-white text-sm flex items-center gap-1.5">
						<Sparkles size={14} className="text-emerald-500" />
						Excellent Deliverability
					</span>
					<p className="mt-1 text-center text-[11px] text-text-soft-400 dark:text-zinc-500 max-w-[200px] leading-normal">
						Your HTML structure and text ratio look solid. Ready to send!
					</p>
				</div>

				{/* Audits Checklist */}
				<div className="flex-1 overflow-y-auto p-4 space-y-3.5 hide-scrollbar">
					<span className="font-bold text-[10px] text-text-sub-600 dark:text-zinc-400 tracking-wider uppercase">
						Optimization Audits
					</span>

					<div className="space-y-2.5">
						<div className="flex items-start gap-3">
							<CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
							<div>
								<h4 className="font-semibold text-text-strong-950 dark:text-zinc-200 text-xs">Subject Line Length</h4>
								<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">Subject length is 45 characters. (Optimal limit is 40-60 characters)</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
							<div>
								<h4 className="font-semibold text-text-strong-950 dark:text-zinc-200 text-xs">Spam Trigger Words</h4>
								<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">Zero spam trigger words identified in content headers or body paragraphs.</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
							<div>
								<h4 className="font-semibold text-text-strong-950 dark:text-zinc-200 text-xs">HTML Size Audit</h4>
								<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">Total template HTML weight is 18 KB. Safe from Gmail clipping (max 102 KB).</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
							<div>
								<h4 className="font-semibold text-text-strong-950 dark:text-zinc-200 text-xs">Link Verification</h4>
								<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">All links resolved successfully and point to valid HTTPS destinations.</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<ShieldAlert size={16} className="text-amber-500 mt-0.5 shrink-0" />
							<div>
								<h4 className="font-semibold text-text-strong-950 dark:text-zinc-200 text-xs">Alt Text Missing</h4>
								<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">One image is missing descriptive alt text. Consider adding it for screen readers.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Testing Panel Component                                           */
/* ------------------------------------------------------------------ */
export function TestPanel({ onClose }: PanelProps) {
	const [testEmail, setTestEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [lastSent, setLastSent] = useState<string | null>(null);

	const handleSendTest = (e: React.FormEvent) => {
		e.preventDefault();
		if (!testEmail) {
			toast.error("Please enter a valid email address");
			return;
		}

		setSending(true);
		// Simulate network latency
		setTimeout(() => {
			setSending(false);
			setLastSent(testEmail);
			toast.success(`Test email sent successfully to ${testEmail}`);
			setTestEmail("");
		}, 1200);
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden py-4 pr-4 pl-14 shrink-0">
			<div className="flex flex-col h-full rounded-[18px] border border-stroke-soft-200 dark:border-stroke-soft-100/40 bg-bg-white-0 dark:bg-[#0a0a0a] overflow-hidden shadow-sm">
				{/* Header */}
				<div className="flex h-10 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a] shrink-0">
					<div className="flex items-center gap-1.5 p-0">
						<Send size={14} className="text-text-strong-950 dark:text-white" />
						<span className="font-semibold text-text-strong-950 dark:text-white text-xs">
							Send Test Email
						</span>
					</div>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={onClose}
						className="size-7 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
					>
						<ChevronLeft size={24} />
					</Button.Root>
				</div>

				<div className="p-4 flex-1 flex flex-col justify-between hide-scrollbar">
					<div className="space-y-4">
						<p className="text-[11px] text-text-soft-400 dark:text-zinc-400 leading-normal">
							Verify exactly how this email template will render across different client mailboxes by sending a live test copy.
						</p>

						<form onSubmit={handleSendTest} className="space-y-3">
							<div className="space-y-1">
								<label className="text-[10px] font-bold text-text-sub-600 dark:text-zinc-400 tracking-wider uppercase">
									Recipient Address
								</label>
								<input
									type="email"
									required
									placeholder="e.g. name@domain.com"
									value={testEmail}
									onChange={(e) => setTestEmail(e.target.value)}
									className="w-full bg-bg-weak-50 dark:bg-zinc-900 border border-stroke-soft-200 dark:border-stroke-soft-100/30 rounded-lg px-3 py-2 text-xs text-text-strong-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
								/>
							</div>

							<Button.Root
								type="submit"
								variant="neutral"
								mode="filled"
								size="xsmall"
								disabled={sending}
								className="w-full py-2 justify-center gap-1.5"
							>
								<Send size={12} className={cn(sending && "animate-pulse")} />
								{sending ? "Sending..." : "Send Test Email"}
							</Button.Root>
						</form>
					</div>

					{/* Send Log History */}
					{lastSent && (
						<div className="border-t border-stroke-soft-200 dark:border-stroke-soft-100/20 pt-4 mt-auto">
							<span className="font-bold text-[10px] text-text-sub-600 dark:text-zinc-400 tracking-wider uppercase block mb-2">
								Recent Sends
							</span>
							<div className="flex items-center justify-between p-2.5 rounded-lg border border-stroke-soft-100 dark:border-stroke-soft-100/10 bg-bg-weak-50/50 dark:bg-zinc-900/20">
								<div className="flex flex-col">
									<span className="font-medium text-xs text-text-strong-950 dark:text-zinc-200 truncate max-w-[150px]">
										{lastSent}
									</span>
									<span className="text-[9px] text-emerald-500">
										Delivered successfully
									</span>
								</div>
								<span className="text-[9px] text-text-soft-400 dark:text-zinc-500">
									Just now
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
