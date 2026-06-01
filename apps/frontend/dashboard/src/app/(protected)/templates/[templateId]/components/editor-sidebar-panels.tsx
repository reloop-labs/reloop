"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import {
	Award,
	Braces,
	Check,
	CheckCircle2,
	ChevronLeft,
	Copy,
	Plus,
	Search,
	Send,
	ShieldAlert,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "./use-editor-store";

interface PanelProps {
	onClose: () => void;
}

/* ------------------------------------------------------------------ */
/* Variables Panel Component                                         */
/* ------------------------------------------------------------------ */
export function VariablesPanel({ onClose }: PanelProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [customVars, setCustomVars] = useState<
		{ label: string; key: string }[]
	>([]);
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
			v.key.toLowerCase().includes(searchQuery.toLowerCase()),
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
		<div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
			{/* Header */}
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a]">
				<div className="flex items-center gap-1.5 p-0">
					<Braces size={14} className="text-text-strong-950 dark:text-white" />
					<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
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
			<div className="shrink-0 space-y-2 border-stroke-soft-200 border-b p-3 dark:border-stroke-soft-100/20">
				<div className="relative">
					<Search className="absolute top-2.5 left-2.5 size-3.5 text-text-soft-400 dark:text-zinc-500" />
					<input
						type="text"
						placeholder="Search template variables..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 py-1.5 pr-3 pl-8 text-text-strong-950 text-xs placeholder-text-soft-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-stroke-soft-100/30 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
					/>
				</div>
				{!isAdding ? (
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xxsmall"
						onClick={() => setIsAdding(true)}
						className="w-full justify-center gap-1 py-1.5 text-[11px]"
					>
						<Plus size={12} />
						Add Custom Variable
					</Button.Root>
				) : (
					<form
						onSubmit={handleAddCustom}
						className="space-y-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-2.5 dark:border-stroke-soft-100/20 dark:bg-zinc-900/50"
					>
						<div className="space-y-1">
							<label className="font-bold text-[10px] text-text-sub-600 dark:text-zinc-400">
								Label name
							</label>
							<input
								type="text"
								placeholder="e.g. Coupon Code"
								value={newLabel}
								onChange={(e) => setNewLabel(e.target.value)}
								className="w-full rounded border border-stroke-soft-200 bg-white px-2 py-1 text-text-strong-950 text-xs dark:border-stroke-soft-100/30 dark:bg-zinc-950 dark:text-white"
							/>
						</div>
						<div className="space-y-1">
							<label className="font-bold text-[10px] text-text-sub-600 dark:text-zinc-400">
								Variable tag
							</label>
							<input
								type="text"
								placeholder="e.g. coupon_code"
								value={newKey}
								onChange={(e) => setNewKey(e.target.value)}
								className="w-full rounded border border-stroke-soft-200 bg-white px-2 py-1 font-mono text-text-strong-950 text-xs dark:border-stroke-soft-100/30 dark:bg-zinc-950 dark:text-white"
							/>
						</div>
						<div className="flex justify-end gap-2 pt-1">
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
			<div className="hide-scrollbar flex-1 space-y-2.5 overflow-y-auto p-3">
				{filteredVars.length === 0 ? (
					<div className="py-8 text-center text-text-soft-400 text-xs dark:text-zinc-500">
						No variables match your search
					</div>
				) : (
					filteredVars.map((v) => (
						<div
							key={v.key}
							onClick={() => handleCopy(v.key)}
							className="group flex cursor-pointer flex-col rounded-lg border border-stroke-soft-100 p-2.5 transition-all hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:border-stroke-soft-100/10 dark:hover:bg-zinc-900/30"
						>
							<div className="flex items-center justify-between">
								<span className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
									{v.label}
								</span>
								<span className="text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
									{copiedKey === v.key ? (
										<Check size={12} className="text-emerald-500" />
									) : (
										<Copy size={12} />
									)}
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
	);
}

/* ------------------------------------------------------------------ */
/* Score Panel Component                                             */
/* ------------------------------------------------------------------ */
export function ScorePanel({ onClose }: PanelProps) {
	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
			{/* Header */}
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a]">
				<div className="flex items-center gap-1.5 p-0">
					<Award size={14} className="text-text-strong-950 dark:text-white" />
					<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
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
			<div className="flex shrink-0 flex-col items-center border-stroke-soft-200 border-b bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/20 dark:bg-[#0c0c0c]">
				<div className="relative flex size-24 items-center justify-center rounded-full border-4 border-emerald-500/20 bg-white shadow-inner dark:border-emerald-950 dark:bg-zinc-950">
					<div className="absolute text-center">
						<span className="font-extrabold text-3xl text-emerald-600 dark:text-emerald-400">
							98
						</span>
						<span className="text-text-soft-400 text-xs dark:text-zinc-500">
							/100
						</span>
					</div>
				</div>
				<span className="mt-3 flex items-center gap-1.5 font-semibold text-sm text-text-strong-950 dark:text-white">
					<Sparkles size={14} className="text-emerald-500" />
					Excellent Deliverability
				</span>
				<p className="mt-1 max-w-[200px] text-center text-[11px] text-text-soft-400 leading-normal dark:text-zinc-500">
					Your HTML structure and text ratio look solid. Ready to send!
				</p>
			</div>

			{/* Audits Checklist */}
			<div className="hide-scrollbar flex-1 space-y-3.5 overflow-y-auto p-4">
				<span className="font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
					Optimization Audits
				</span>

				<div className="space-y-2.5">
					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Subject Line Length
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								Subject length is 45 characters. (Optimal limit is 40-60
								characters)
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Spam Trigger Words
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								Zero spam trigger words identified in content headers or body
								paragraphs.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								HTML Size Audit
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								Total template HTML weight is 18 KB. Safe from Gmail clipping
								(max 102 KB).
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Link Verification
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								All links resolved successfully and point to valid HTTPS
								destinations.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Alt Text Missing
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								One image is missing descriptive alt text. Consider adding it
								for screen readers.
							</p>
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
		<div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
			{/* Header */}
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a]">
				<div className="flex items-center gap-1.5 p-0">
					<Send size={14} className="text-text-strong-950 dark:text-white" />
					<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
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

			<div className="hide-scrollbar flex flex-1 flex-col justify-between p-4">
				<div className="space-y-4">
					<p className="text-[11px] text-text-soft-400 leading-normal dark:text-zinc-400">
						Verify exactly how this email template will render across different
						client mailboxes by sending a live test copy.
					</p>

					<form onSubmit={handleSendTest} className="space-y-3">
						<div className="space-y-1">
							<label className="font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
								Recipient Address
							</label>
							<input
								type="email"
								required
								placeholder="e.g. name@domain.com"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
								className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 text-text-strong-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-stroke-soft-100/30 dark:bg-zinc-900 dark:text-white"
							/>
						</div>

						<Button.Root
							type="submit"
							variant="neutral"
							mode="filled"
							size="xsmall"
							disabled={sending}
							className="w-full justify-center gap-1.5 py-2"
						>
							<Send size={12} className={cn(sending && "animate-pulse")} />
							{sending ? "Sending..." : "Send Test Email"}
						</Button.Root>
					</form>
				</div>

				{/* Send Log History */}
				{lastSent && (
					<div className="mt-auto border-stroke-soft-200 border-t pt-4 dark:border-stroke-soft-100/20">
						<span className="mb-2 block font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
							Recent Sends
						</span>
						<div className="flex items-center justify-between rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-2.5 dark:border-stroke-soft-100/10 dark:bg-zinc-900/20">
							<div className="flex flex-col">
								<span className="max-w-[150px] truncate font-medium text-text-strong-950 text-xs dark:text-zinc-200">
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
	);
}
