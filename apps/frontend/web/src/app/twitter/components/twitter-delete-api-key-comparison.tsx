"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { X } from "lucide-react";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex h-4 min-w-4 items-center justify-center rounded-[5px] border border-stroke-soft-200 bg-bg-weak-50 px-1 text-[10px] leading-none text-text-sub-600 shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
				className,
			)}
		>
			{children}
		</span>
	);
}

/* -------------------------------------------------------------------------- */
/* OLD — faithful to screenshot + delete-api-key-modal.tsx before redesign    */
/* -------------------------------------------------------------------------- */
function DeleteApiKeyOld() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
			{/* Header */}
			<div>
				<h2 className="font-semibold text-[26px] text-text-strong-950 tracking-tight dark:text-white">
					Delete API key
				</h2>
				<p className="mt-1 text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
					Are you sure you want to delete this API key? This action cannot be undone.
				</p>
			</div>

			{/* Red warning */}
			<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs leading-relaxed dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
				<span className="font-bold text-red-800 dark:text-red-200">Warning:</span>{" "}
				Deleting this API key will permanently remove it along with all its permissions. Any services using
				this API key will stop working immediately.
			</div>

			{/* Prefix card */}
			<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
				<div>
					<p className="font-normal text-text-sub-600 text-xs dark:text-white/60">API key prefix</p>
					<div className="mt-1 flex items-center">
						<span className="font-medium font-mono text-sm text-text-strong-950 dark:text-white">
							rl_prod_ILz6E6_-b
						</span>
					</div>
				</div>
			</div>

			{/* Confirmation */}
			<div className="mt-4 space-y-2">
				<Label.Root className="flex flex-wrap items-center gap-1.5 text-sm">
					<span>Type</span>
					<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-white/[0.06] dark:text-white">
						Onboarding Key
						<span className="inline-flex h-4 w-4 items-center justify-center">
							<Icon name="copy" className="h-3 w-3 text-text-sub-600 dark:text-white/60" />
						</span>
					</span>
					<span>to confirm</span>
				</Label.Root>
				<Input.Root size="medium">
					<Input.Wrapper>
						<Input.Input placeholder="Onboarding Key" defaultValue="Onboarding Key" />
					</Input.Wrapper>
				</Input.Root>
			</div>

			{/* Footer */}
			<div className="mt-6 flex items-center justify-end gap-3">
				<Button.Root type="button" variant="neutral" mode="stroke" size="small" className="gap-1.5">
					Cancel
					<Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="destructive" size="small" className="min-w-[134px] justify-center">
					Delete API key
					<Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* NEW — matches current dashboard delete-api-key-modal.tsx                   */
/* -------------------------------------------------------------------------- */
function DeleteApiKeyNew() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
			<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
				{/* Header — title only, like Create Campaign */}
				<div className="flex items-start justify-between gap-4 px-6">
					<div className="flex items-center gap-2">
						<Icon name="trash" className="size-4 text-text-sub-600 dark:text-white/60" />
						<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
							Delete API key
						</h2>
					</div>
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 dark:bg-transparent dark:text-white/60">
						<X className="size-3.5" strokeWidth={2.25} />
					</span>
				</div>

				<div className="space-y-4 px-6 pb-6">
					{/* Lightweight paragraph — prefix inlined, no red box */}
					<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
						This will permanently delete{" "}
						<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono font-medium text-text-strong-950 text-xs dark:bg-white/[0.06] dark:text-white">
							rl_prod_ILz6E6_-b
						</span>{" "}
						<span className="font-medium text-text-strong-950 dark:text-white">Onboarding Key</span>. Services
						using this key will stop working immediately.{" "}
						<span className="font-medium text-text-strong-950 dark:text-white">This cannot be undone.</span>
					</p>

					{/* Confirmation */}
					<div className="space-y-2">
						<Label.Root className="flex flex-wrap items-center gap-1.5 text-sm">
							<span>Type</span>
							<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-white/[0.06] dark:text-white">
								Onboarding Key
								<span className="inline-flex h-4 w-4 items-center justify-center">
									<Icon name="copy" className="h-3 w-3 text-text-sub-600 dark:text-white/60" />
								</span>
							</span>
							<span>to confirm</span>
						</Label.Root>
						<Input.Root size="medium">
							<Input.Wrapper>
								<Input.Input placeholder="Onboarding Key" defaultValue="Onboarding Key" />
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
			</div>

			{/* Footer outside inner card — like CreateCampaignModal */}
			<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
				<Button.Root type="button" variant="neutral" mode="ghost" size="small" className="gap-1.5">
					Cancel
					<Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="destructive" size="small" className="min-w-[134px] justify-center">
					Delete API key
					<Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

function Annotation({
	side,
	top,
	label,
	sublabel,
	color = "red",
}: {
	side: "left" | "right";
	top: string;
	label: string;
	sublabel?: string;
	color?: "red" | "green" | "zinc";
}) {
	const lineColor = color === "red" ? "bg-red-400" : color === "green" ? "bg-emerald-500" : "bg-zinc-300";
	const dotColor = color === "red" ? "bg-red-400" : color === "green" ? "bg-emerald-500" : "bg-zinc-400";
	const textColor = color === "red" ? "text-red-600 dark:text-red-400" : color === "green" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500";
	return (
		<div
			className={cn(
				"absolute hidden items-center gap-2 xl:flex",
				side === "left" ? "-left-[188px] flex-row" : "-right-[188px] flex-row-reverse",
			)}
			style={{ top }}
		>
			<div className={cn("flex flex-col", side === "left" ? "items-end text-right" : "items-start text-left")}>
				<span className={cn("whitespace-nowrap text-xs font-medium leading-none", textColor)}>{label}</span>
				{sublabel ? (
					<span className="whitespace-nowrap text-[11px] leading-none text-text-soft-400 dark:text-white/40">
						{sublabel}
					</span>
				) : null}
			</div>
			<div className={cn("h-px w-10 shrink-0", lineColor)} />
			<div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColor)} />
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* CREATE API KEY — OLD vs NEW                                                */
/* -------------------------------------------------------------------------- */
function CreateApiKeyOld() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
			<h2 className="font-semibold text-[26px] text-text-strong-950 tracking-tight dark:text-white">Create API key</h2>
			<div className="mt-5 space-y-2">
				<Label.Root htmlFor="name-old" className="text-sm">
					Name <Label.Asterisk />
				</Label.Root>
				<Input.Root size="medium">
					<Input.Wrapper>
						<Input.Input id="name-old" placeholder="e.g., Production Server, My App" defaultValue="" />
					</Input.Wrapper>
				</Input.Root>
				<p className="text-paragraph-xs text-text-sub-600 dark:text-white/60">Provide a descriptive name to help you identify this key later.</p>
			</div>
			<div className="mt-6 flex items-center justify-end gap-3">
				<Button.Root type="button" variant="neutral" mode="stroke" size="small" className="gap-1.5">
					Cancel <Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="blue" size="small" className="min-w-[158px] justify-center">
					Create API key <Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

function CreateApiKeyNew() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
			<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
				<div className="flex items-start justify-between gap-4 px-6">
					<div className="flex items-center gap-2">
						<Icon name="key-new" className="size-4 text-text-sub-600 dark:text-white/60" />
						<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">Create API key</h2>
					</div>
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 dark:bg-transparent dark:text-white/60">
						<X className="size-3.5" strokeWidth={2.25} />
					</span>
				</div>
				<div className="space-y-1.5 px-6 pb-6">
					<Label.Root htmlFor="name-new" className="font-medium text-text-strong-950 text-xs dark:text-white">
						API key name <Label.Asterisk />
					</Label.Root>
					<Input.Root size="medium">
						<Input.Wrapper>
							<Input.Input id="name-new" placeholder="e.g. Production Server" defaultValue="" autoFocus={false} />
						</Input.Wrapper>
					</Input.Root>
					<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">Used to identify this key in your dashboard.</p>
				</div>
			</div>
			<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
				<Button.Root type="button" variant="neutral" mode="ghost" size="small" className="gap-1.5">
					Cancel <Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="blue" size="small" className="min-w-[158px] justify-center">
					Create API key <Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* API KEY DISPLAY — OLD vs NEW (success state after creation)                */
/* -------------------------------------------------------------------------- */
function SecretCodeBlock() {
	return (
		<div className="group relative overflow-hidden rounded-[18px] border border-stroke-soft-100 bg-[#fafafa] dark:border-white/10 dark:bg-[#0c0c0e]">
			<div className="flex items-center justify-between gap-3 px-4 py-2.5">
				<span className="font-mono text-[11px] text-text-sub-500 dark:text-white/55">secret key</span>
				<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white">
					<Icon name="copy" className="size-4" />
				</span>
			</div>
			<div className="mx-0.5 mb-0.5 overflow-hidden rounded-2xl border border-stroke-soft-100/70 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950">
				<span className="font-mono text-sm text-text-strong-950 dark:text-white">rl_live_7k9x2mPq8vT4wN5aB8cD1eF2gH</span>
			</div>
		</div>
	);
}

function ApiKeyDisplayOld() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
			<h2 className="font-semibold text-[26px] text-text-strong-950 tracking-tight dark:text-white">API key created</h2>
			<div className="mt-5">
				<SecretCodeBlock />
			</div>
			<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
				<span className="font-semibold">Important:</span> Copy and save your secret key now. You won&apos;t be able to see it again.
			</div>
			<div className="mt-6 flex items-center justify-end gap-3">
				<Button.Root type="button" variant="neutral" mode="stroke" size="small" className="gap-1.5">
					Cancel <Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="blue" size="small" className="min-w-[158px] justify-center">
					Copy API key <Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

function ApiKeyDisplayNew() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
			<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
				<div className="flex items-start justify-between gap-4 px-6">
					<div className="flex items-center gap-2">
						<Icon name="check-circle" className="size-4 text-emerald-600 dark:text-emerald-400" />
						<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">API key created</h2>
					</div>
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 dark:bg-transparent dark:text-white/60">
						<X className="size-3.5" strokeWidth={2.25} />
					</span>
				</div>
				<div className="space-y-4 px-6 pb-6">
					<SecretCodeBlock />
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800 text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
						<span className="font-semibold">Important:</span> Copy and save your secret key now — you won&apos;t be able to see it again.
					</div>
				</div>
			</div>
			<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
				<Button.Root type="button" variant="neutral" mode="ghost" size="small" className="gap-1.5">
					Cancel <Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="blue" size="small" className="min-w-[158px] justify-center">
					Copy API key <Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* ROTATE API KEY — OLD vs NEW                                                */
/* -------------------------------------------------------------------------- */
function RotateApiKeyOld() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
			<h2 className="font-semibold text-[26px] text-text-strong-950 tracking-tight dark:text-white">Rotate API key</h2>
			<p className="mt-2 text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
				Generating a new secret key will instantly revoke the existing key. Any applications using the old key will lose
				access until updated.
			</p>
			<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
				<div>
					<p className="font-normal text-text-sub-600 text-xs dark:text-white/60">API key name</p>
					<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950 dark:text-white">dsafsd</p>
				</div>
				<div>
					<p className="font-normal text-text-sub-600 text-xs dark:text-white/60">API key prefix</p>
					<div className="mt-1 flex items-center">
						<span className="font-medium font-mono text-sm text-text-strong-950 dark:text-white">rl_prod_Tt65cG2I7</span>
					</div>
				</div>
			</div>
			<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
				<span className="font-semibold">Warning:</span> Services using this key will experience downtime until they are updated with the new secret.
			</div>
			<div className="mt-4 space-y-2">
				<Label.Root className="flex flex-wrap items-center gap-1.5 text-sm">
					<span>Type</span>
					<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-white/[0.06] dark:text-white">
						dsafsd <Icon name="copy" className="h-3 w-3 text-text-sub-600 dark:text-white/60" />
					</span>
					<span>to confirm</span>
				</Label.Root>
				<Input.Root size="medium">
					<Input.Wrapper>
						<Input.Input placeholder="dsafsd" defaultValue="dsafsd" />
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="mt-6 flex items-center justify-end gap-3">
				<Button.Root type="button" variant="neutral" mode="stroke" size="small" className="gap-1.5">
					Cancel <Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="blue" size="small" className="min-w-[158px] justify-center">
					Rotate API key <Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

function RotateApiKeyNew() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
			<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
				<div className="flex items-start justify-between gap-4 px-6">
					<div className="flex items-center gap-2">
						<Icon name="refresh" className="size-4 text-text-sub-600 dark:text-white/60" />
						<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">Rotate API key</h2>
					</div>
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 dark:bg-transparent dark:text-white/60">
						<X className="size-3.5" strokeWidth={2.25} />
					</span>
				</div>
				<div className="space-y-4 px-6 pb-6">
					<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
						This will rotate{" "}
						<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono font-medium text-text-strong-950 text-xs dark:bg-white/[0.06] dark:text-white">
							rl_prod_Tt65cG2I7
						</span>{" "}
						<span className="font-medium text-text-strong-950 dark:text-white">dsafsd</span>.
					</p>
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800 text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
						<span className="font-semibold">Note:</span> Generating a new secret will instantly revoke the old key. Any services using it will
						experience downtime until updated with the new secret.
					</div>
					<div className="space-y-2">
						<Label.Root className="flex flex-wrap items-center gap-1.5 text-sm">
							<span>Type</span>
							<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-white/[0.06] dark:text-white">
								dsafsd <Icon name="copy" className="h-3 w-3 text-text-sub-600 dark:text-white/60" />
							</span>
							<span>to confirm</span>
						</Label.Root>
						<Input.Root size="medium">
							<Input.Wrapper>
								<Input.Input placeholder="dsafsd" defaultValue="dsafsd" />
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
			</div>
			<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
				<Button.Root type="button" variant="neutral" mode="ghost" size="small" className="gap-1.5">
					Cancel <Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root type="button" variant="blue" size="small" className="min-w-[158px] justify-center">
					Rotate API key <Kbd className={cn(actionKbdOnBlueClassName, "ml-1")}>↵</Kbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}

export function TwitterDeleteApiKeyComparison() {
	return (
		<div data-standalone="true" className="relative flex w-full flex-col bg-white dark:bg-[#080808]">
			{/* Section 1: Delete API key — 100dvh */}
			<div className="flex min-h-[100dvh] w-full items-center justify-center px-6 py-10">
				<div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-start justify-items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
					<div className="relative flex w-full max-w-[460px] justify-center">
						<DeleteApiKeyOld />
					</div>
					<div className="relative flex w-full max-w-[460px] justify-center">
						<DeleteApiKeyNew />
					</div>
				</div>
			</div>

			{/* Section 2: Create API key — 100dvh */}
			<div className="flex min-h-[100dvh] w-full items-center justify-center px-6 py-10">
				<div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-start justify-items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
					<div className="relative flex w-full max-w-[460px] justify-center">
						<CreateApiKeyOld />
					</div>
					<div className="relative flex w-full max-w-[460px] justify-center">
						<CreateApiKeyNew />
					</div>
				</div>
			</div>

			{/* Section 3: API key display (success) — 100dvh */}
			<div className="flex min-h-[100dvh] w-full items-center justify-center px-6 py-10">
				<div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-start justify-items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
					<div className="relative flex w-full max-w-[460px] justify-center">
						<ApiKeyDisplayOld />
					</div>
					<div className="relative flex w-full max-w-[460px] justify-center">
						<ApiKeyDisplayNew />
					</div>
				</div>
			</div>

			{/* Section 4: Rotate API key — 100dvh */}
			<div className="flex min-h-[100dvh] w-full items-center justify-center px-6 py-10">
				<div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-start justify-items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
					<div className="relative flex w-full max-w-[460px] justify-center">
						<RotateApiKeyOld />
					</div>
					<div className="relative flex w-full max-w-[460px] justify-center">
						<RotateApiKeyNew />
					</div>
				</div>
			</div>
		</div>
	);
}
