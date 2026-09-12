"use client";

import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Switch from "@reloop/ui/switch";
import { X } from "lucide-react";
import { useState } from "react";

/* -------------------------------------------------------------------------- */
/*                                KEYBOARD KBD                                */
/* -------------------------------------------------------------------------- */

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<kbd
			className={cn(
				"inline-flex h-4 min-w-4 items-center justify-center rounded border border-stroke-soft-200 bg-bg-white-0 px-1 font-mono text-[10px] text-text-sub-600 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:border-white/15 dark:bg-white/10 dark:text-white/70 dark:shadow-[0_1px_0_0_rgba(0,0,0,0.3)]",
				className,
			)}
		>
			{children}
		</kbd>
	);
}

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

/* -------------------------------------------------------------------------- */
/*                     OLD EDIT CONTACT (200 COMMITS AGO)                     */
/* -------------------------------------------------------------------------- */

export function EditContactOld() {
	const [firstName, setFirstName] = useState("Alex");
	const [lastName, setLastName] = useState("Morgan");
	const [company, setCompany] = useState("Acme Corp");
	const [role, setRole] = useState("VP of Engineering");
	const [isSubscribed, setIsSubscribed] = useState(true);
	const [groups, setGroups] = useState(["VIP Customers", "Early Adopters"]);
	const [channels, setChannels] = useState([
		"Product Updates",
		"Monthly Digest",
	]);
	const [groupInput, setGroupInput] = useState("");
	const [channelInput, setChannelInput] = useState("");

	const removeGroup = (name: string) => {
		setGroups((prev) => prev.filter((g) => g !== name));
	};

	const removeChannel = (name: string) => {
		setChannels((prev) => prev.filter((c) => c !== name));
	};

	return (
		<div className="w-full font-sans">
			{/* Old Modal Card Shell (sm:max-w-[480px], rounded-2xl, border-stroke-soft-100) */}
			<div className="relative overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 shadow-regular-sm dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
				{/* Top-right Radix Modal close button */}
				<button
					type="button"
					aria-label="Close"
					className="absolute top-5 right-5 flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/[0.05] dark:hover:text-white"
				>
					<Icon name="cross" className="size-3.5" />
				</button>

				{/* Modal Header */}
				<div className="relative mb-5 pr-6">
					<h2 className="font-semibold text-[26px] text-text-strong-950 tracking-tight dark:text-white">
						Edit contact
					</h2>
					<p className="mt-1 text-sm text-text-sub-600 leading-relaxed dark:text-neutral-400">
						Update this contact&apos;s details, groups, and email preferences.
					</p>
				</div>

				<form onSubmit={(e) => e.preventDefault()} className="space-y-6">
					{/* ── Identity ───────────────────────────────────────── */}
					<section className="space-y-4">
						{/* Email with leading mail icon + trailing lock icon */}
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center gap-1.5">
								<Label.Root
									htmlFor="old-email"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Email
								</Label.Root>
								<span className="font-normal text-text-sub-600 text-xs dark:text-neutral-400">
									(cannot be changed)
								</span>
							</div>
							<Input.Root
								size="medium"
								className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30"
							>
								<Input.Wrapper>
									<Input.Icon
										as={Icon}
										name="mail-single"
										size="small"
										className="h-4 w-4 text-text-sub-600"
									/>
									<Input.Input
										id="old-email"
										type="email"
										value="alex.morgan@acme.corp"
										readOnly
										className="cursor-not-allowed font-medium text-text-strong-950 opacity-100 focus:outline-none dark:text-white"
									/>
									<Icon
										name="lock"
										className="mr-1.5 h-3.5 w-3.5 shrink-0 text-text-sub-600"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						{/* First Name & Last Name */}
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-1.5">
								<Label.Root
									htmlFor="old-first-name"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									First name
								</Label.Root>
								<Input.Root size="medium">
									<Input.Wrapper>
										<Input.Input
											id="old-first-name"
											type="text"
											value={firstName}
											onChange={(e) => setFirstName(e.target.value)}
											placeholder="First name"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label.Root
									htmlFor="old-last-name"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Last name
								</Label.Root>
								<Input.Root size="medium">
									<Input.Wrapper>
										<Input.Input
											id="old-last-name"
											type="text"
											value={lastName}
											onChange={(e) => setLastName(e.target.value)}
											placeholder="Last name"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>

						{/* Custom properties */}
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-1.5">
								<Label.Root
									htmlFor="old-prop-company"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Company
								</Label.Root>
								<Input.Root size="medium">
									<Input.Wrapper>
										<Input.Input
											id="old-prop-company"
											type="text"
											value={company}
											onChange={(e) => setCompany(e.target.value)}
											placeholder="Enter Company"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label.Root
									htmlFor="old-prop-role"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Role
								</Label.Root>
								<Input.Root size="medium">
									<Input.Wrapper>
										<Input.Input
											id="old-prop-role"
											type="text"
											value={role}
											onChange={(e) => setRole(e.target.value)}
											placeholder="Enter Role"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>
					</section>

					{/* ── Organization (with divider line) ──────────────── */}
					<section className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="h-px flex-1 bg-stroke-soft-100 dark:bg-white/10" />
							<span className="font-medium text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-neutral-500">
								Organization
							</span>
							<div className="h-px flex-1 bg-stroke-soft-100 dark:bg-white/10" />
						</div>

						{/* Old GroupSelect */}
						<div className="flex flex-col gap-1.5">
							<div className="flex flex-wrap items-center gap-1.5">
								<Label.Root
									htmlFor="old-groups"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									Groups
								</Label.Root>
								<span className="font-normal text-[11px] text-text-soft-400 dark:text-neutral-500">
									(Audience groups for targeting and filtering. Separate from
									email opt-in.)
								</span>
							</div>
							<div className="group/chips flex min-h-[42px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-xs dark:border-stroke-soft-100/40 dark:bg-transparent">
								{groups.map((group) => (
									<span
										key={group}
										className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 pl-0.5 text-paragraph-xs text-text-strong-950 transition-all dark:border-stroke-soft-100/40 dark:bg-white/[0.05] dark:text-white"
									>
										<Avatar.Root size="20" color="gray">
											<Icon
												name="modules"
												className="h-3 w-3 text-text-sub-600"
											/>
										</Avatar.Root>
										<span className="font-medium">{group}</span>
										<button
											type="button"
											onClick={() => removeGroup(group)}
											className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950 dark:hover:bg-white/10 dark:hover:text-white"
											aria-label={`Remove ${group}`}
										>
											<Icon name="cross" className="h-3 w-3" />
										</button>
									</span>
								))}
								<input
									id="old-groups"
									type="text"
									value={groupInput}
									onChange={(e) => setGroupInput(e.target.value)}
									placeholder={groups.length === 0 ? "Search groups..." : ""}
									className="min-w-[80px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400 dark:text-white"
								/>
							</div>
						</div>
					</section>

					{/* ── Email preferences (with divider line) ─────────── */}
					<section className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="h-px flex-1 bg-stroke-soft-100 dark:bg-white/10" />
							<span className="font-medium text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-neutral-500">
								Email preferences
							</span>
							<div className="h-px flex-1 bg-stroke-soft-100 dark:bg-white/10" />
						</div>

						{/* 1. Channels */}
						<div className="flex flex-col gap-1.5">
							<Label.Root
								htmlFor="old-channels"
								className="font-medium text-text-strong-950 text-xs dark:text-white"
							>
								Channels
							</Label.Root>
							<div className="group/chips flex min-h-[42px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-xs dark:border-stroke-soft-100/40 dark:bg-transparent">
								{channels.map((channel) => (
									<span
										key={channel}
										className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 pl-0.5 text-paragraph-xs text-text-strong-950 transition-all dark:border-stroke-soft-100/40 dark:bg-white/[0.05] dark:text-white"
									>
										<Avatar.Root size="20" color="gray">
											<Icon
												name="notification-indicator"
												className="h-3 w-3 text-text-sub-600"
											/>
										</Avatar.Root>
										<span className="font-medium">{channel}</span>
										<button
											type="button"
											onClick={() => removeChannel(channel)}
											className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950 dark:hover:bg-white/10 dark:hover:text-white"
											aria-label={`Remove ${channel}`}
										>
											<Icon name="cross" className="h-3 w-3" />
										</button>
									</span>
								))}
								<input
									id="old-channels"
									type="text"
									value={channelInput}
									onChange={(e) => setChannelInput(e.target.value)}
									placeholder={
										channels.length === 0
											? "Search channels to enroll..."
											: "Add another..."
									}
									className="min-w-[100px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400 dark:text-white"
								/>
							</div>
							<p className="text-paragraph-xs text-text-soft-400 dark:text-neutral-500">
								Email lists this contact is enrolled in. They only get mail from
								these channels.
							</p>
						</div>

						{/* 2. Marketing subscription toggle (Switch) */}
						<div
							className={cn(
								"flex items-center justify-between gap-4 rounded-2xl border p-3.5 transition-colors",
								isSubscribed
									? "border-stroke-soft-200 bg-bg-weak-50/40 dark:border-white/10 dark:bg-white/[0.02]"
									: "border-red-500/15 bg-red-500/[0.03]",
							)}
						>
							<div className="flex min-w-0 items-center gap-3">
								<div
									className={cn(
										"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-bg-white-0 shadow-xs dark:bg-white/5",
										isSubscribed
											? "border-stroke-soft-200 text-text-strong-950 dark:border-white/10 dark:text-white"
											: "border-red-500/20 text-red-600",
									)}
								>
									<Icon
										name={isSubscribed ? "mail-single" : "bell-off"}
										className="h-4 w-4"
									/>
								</div>
								<div className="flex min-w-0 flex-col gap-0.5 text-left">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-medium text-text-strong-950 text-xs dark:text-white">
											Marketing subscription
										</span>
										<span
											className={cn(
												"inline-flex items-center rounded-md px-1.5 py-0.5 font-medium text-[10px] leading-none",
												isSubscribed
													? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
													: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
											)}
										>
											{isSubscribed ? "Subscribed" : "Unsubscribed"}
										</span>
									</div>
									<span className="text-paragraph-xs text-text-sub-600 dark:text-neutral-400">
										{isSubscribed
											? "Can receive marketing and broadcast emails"
											: "Marketing paused — transactional emails only"}
									</span>
								</div>
							</div>
							<Switch.Root
								checked={isSubscribed}
								onCheckedChange={setIsSubscribed}
								aria-label="Marketing subscription"
							/>
						</div>
					</section>

					{/* ── Footer Action Bar (Old: right-aligned) ────────── */}
					<div className="mt-6 flex items-center justify-end gap-3 pt-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							className="gap-1.5"
						>
							Cancel
							<ActionKbd className="lowercase! w-auto min-w-0 px-1">
								esc
							</ActionKbd>
						</Button.Root>

						<FancyButton.Root
							type="button"
							variant="primary"
							size="small"
							className="min-w-[95px] justify-center font-medium"
						>
							<span className="flex items-center justify-center gap-1.5 font-medium">
								<span>Update</span>
								<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
							</span>
						</FancyButton.Root>
					</div>
				</form>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*                     NEW EDIT CONTACT (CURRENT REDESIGN)                    */
/* -------------------------------------------------------------------------- */

export function EditContactNew() {
	const [firstName, setFirstName] = useState("Alex");
	const [lastName, setLastName] = useState("Morgan");
	const [company, setCompany] = useState("Acme Corp");
	const [role, setRole] = useState("VP of Engineering");
	const [isSubscribed, setIsSubscribed] = useState(true);
	const [groups, setGroups] = useState(["VIP Customers", "Early Adopters"]);
	const [channels, setChannels] = useState([
		"Product Updates",
		"Monthly Digest",
	]);
	const [groupInput, setGroupInput] = useState("");
	const [channelInput, setChannelInput] = useState("");

	const removeGroup = (name: string) => {
		setGroups((prev) => prev.filter((g) => g !== name));
	};

	const removeChannel = (name: string) => {
		setChannels((prev) => prev.filter((c) => c !== name));
	};

	return (
		<div className="w-full font-sans">
			{/* New Modal Shell: Nested Double-Bezel Card Layout */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 shadow-regular-sm dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
				<form onSubmit={(e) => e.preventDefault()}>
					<div className="relative m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						{/* Header: User Icon + Title + In-flow Rounded Close Button */}
						<div className="flex items-start justify-between gap-4 px-6">
							<div className="flex items-center gap-2">
								<Icon
									name="user"
									className="size-4 text-text-sub-600 dark:text-white/60"
								/>
								<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
									Edit contact
								</h2>
							</div>
							<button
								type="button"
								aria-label="Close"
								className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
							>
								<X className="size-3.5" strokeWidth={2.25} />
							</button>
						</div>

						{/* Form Content Area */}
						<div className="space-y-6 px-6 pt-5 pb-6">
							{/* ── Identity ───────────────────────────────────── */}
							<section className="space-y-4">
								{/* Email: Clean input without leading icon, only trailing lock */}
								<div className="flex flex-col gap-1.5">
									<div className="flex items-center gap-1.5">
										<Label.Root
											htmlFor="new-email"
											className="font-medium text-text-strong-950 text-xs dark:text-white"
										>
											Email
										</Label.Root>
										<span className="font-normal text-text-sub-600 text-xs dark:text-neutral-400">
											(cannot be changed)
										</span>
									</div>
									<Input.Root
										size="medium"
										className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30"
									>
										<Input.Wrapper>
											<Input.Input
												id="new-email"
												type="email"
												value="alex.morgan@acme.corp"
												readOnly
												className="cursor-not-allowed font-medium text-text-strong-950 opacity-100 focus:outline-none dark:text-white"
											/>
											<Icon
												name="lock"
												className="mr-1.5 h-3.5 w-3.5 shrink-0 text-text-sub-600"
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>

								{/* First Name & Last Name */}
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="flex flex-col gap-1.5">
										<Label.Root
											htmlFor="new-first-name"
											className="font-medium text-text-strong-950 text-xs dark:text-white"
										>
											First name
										</Label.Root>
										<Input.Root size="medium">
											<Input.Wrapper>
												<Input.Input
													id="new-first-name"
													type="text"
													value={firstName}
													onChange={(e) => setFirstName(e.target.value)}
													placeholder="First name"
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>
									<div className="flex flex-col gap-1.5">
										<Label.Root
											htmlFor="new-last-name"
											className="font-medium text-text-strong-950 text-xs dark:text-white"
										>
											Last name
										</Label.Root>
										<Input.Root size="medium">
											<Input.Wrapper>
												<Input.Input
													id="new-last-name"
													type="text"
													value={lastName}
													onChange={(e) => setLastName(e.target.value)}
													placeholder="Last name"
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>
								</div>

								{/* Custom properties */}
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="flex flex-col gap-1.5">
										<Label.Root
											htmlFor="new-prop-company"
											className="font-medium text-text-strong-950 text-xs dark:text-white"
										>
											Company
										</Label.Root>
										<Input.Root size="medium">
											<Input.Wrapper>
												<Input.Input
													id="new-prop-company"
													type="text"
													value={company}
													onChange={(e) => setCompany(e.target.value)}
													placeholder="Enter Company"
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>
									<div className="flex flex-col gap-1.5">
										<Label.Root
											htmlFor="new-prop-role"
											className="font-medium text-text-strong-950 text-xs dark:text-white"
										>
											Role
										</Label.Root>
										<Input.Root size="medium">
											<Input.Wrapper>
												<Input.Input
													id="new-prop-role"
													type="text"
													value={role}
													onChange={(e) => setRole(e.target.value)}
													placeholder="Enter Role"
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>
								</div>
							</section>

							{/* ── Organization (No line dividers! Integrated label icon) ── */}
							<section className="space-y-4">
								<div className="flex flex-col gap-1.5">
									<Label.Root
										htmlFor="new-groups"
										className="font-medium text-text-strong-950 text-xs dark:text-white"
									>
										<span className="inline-flex items-center gap-1.5">
											<Icon
												name="modules"
												className="size-3.5 text-text-sub-600"
											/>
											Groups
										</span>
									</Label.Root>
									<div className="group/chips flex min-h-[42px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus dark:border-stroke-soft-100/40 dark:bg-transparent">
										{groups.map((group) => (
											<span
												key={group}
												className="inline-flex h-6 max-w-full shrink-0 cursor-default items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 pl-0.5 text-paragraph-sm text-text-strong-950 transition-all dark:border-stroke-soft-100/40 dark:bg-white/[0.05] dark:text-white"
											>
												<Avatar.Root size="20" color="gray">
													<Icon
														name="modules"
														className="h-3 w-3 text-text-sub-600"
													/>
												</Avatar.Root>
												<span className="truncate font-medium">{group}</span>
												<button
													type="button"
													onClick={() => removeGroup(group)}
													className="ml-0.5 flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950 dark:hover:bg-white/10 dark:hover:text-white"
													aria-label={`Remove ${group}`}
												>
													<X className="h-3 w-3" strokeWidth={2.5} />
												</button>
											</span>
										))}
										<input
											id="new-groups"
											type="text"
											value={groupInput}
											onChange={(e) => setGroupInput(e.target.value)}
											placeholder={
												groups.length === 0 ? "Search groups..." : ""
											}
											className="min-w-[80px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400 dark:text-white"
										/>
									</div>
								</div>
							</section>

							{/* ── Email preferences (No line dividers! Integrated label icon) ── */}
							<section className="space-y-4">
								{/* 1. Channels */}
								<div className="flex flex-col gap-1.5">
									<Label.Root
										htmlFor="new-channels"
										className="font-medium text-text-strong-950 text-xs dark:text-white"
									>
										<span className="inline-flex items-center gap-1.5">
											<Icon
												name="notification-indicator"
												className="size-3.5 text-text-sub-600"
											/>
											Channels
										</span>
									</Label.Root>
									<div className="group/chips flex min-h-[42px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus dark:border-stroke-soft-100/40 dark:bg-transparent">
										{channels.map((channel) => (
											<span
												key={channel}
												className="inline-flex h-6 max-w-full shrink-0 cursor-default items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 pl-0.5 text-paragraph-sm text-text-strong-950 transition-all dark:border-stroke-soft-100/40 dark:bg-white/[0.05] dark:text-white"
											>
												<Avatar.Root size="20" color="gray">
													<Icon
														name="notification-indicator"
														className="h-3 w-3 text-text-sub-600"
													/>
												</Avatar.Root>
												<span className="truncate font-medium">{channel}</span>
												<button
													type="button"
													onClick={() => removeChannel(channel)}
													className="ml-0.5 flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950 dark:hover:bg-white/10 dark:hover:text-white"
													aria-label={`Remove ${channel}`}
												>
													<X className="h-3 w-3" strokeWidth={2.5} />
												</button>
											</span>
										))}
										<input
											id="new-channels"
											type="text"
											value={channelInput}
											onChange={(e) => setChannelInput(e.target.value)}
											placeholder={
												channels.length === 0
													? "Search channels to enroll..."
													: "Add another..."
											}
											className="min-w-[100px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400 dark:text-white"
										/>
									</div>
								</div>

								{/* 2. Marketing Email Checkbox (Checkbox instead of Switch) */}
								<label
									htmlFor="new-marketing-checkbox"
									className={cn(
										"flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-3.5 transition-colors",
										isSubscribed
											? "border-stroke-soft-200 bg-bg-weak-50/40 dark:border-white/10 dark:bg-white/[0.02]"
											: "border-red-500/15 bg-red-500/[0.03]",
									)}
								>
									<div className="flex min-w-0 items-center gap-3">
										<div
											className={cn(
												"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-bg-white-0 shadow-xs dark:bg-white/5",
												isSubscribed
													? "border-stroke-soft-200 text-text-strong-950 dark:border-white/10 dark:text-white"
													: "border-red-500/20 text-red-600",
											)}
										>
											<Icon
												name={isSubscribed ? "mail-single" : "bell-off"}
												className="h-4 w-4"
											/>
										</div>
										<div className="flex min-w-0 flex-col gap-0.5 text-left">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-medium text-text-strong-950 text-xs dark:text-white">
													Marketing Email
												</span>
												<span
													className={cn(
														"inline-flex items-center rounded-md px-1.5 py-0.5 font-medium text-[10px] leading-none",
														isSubscribed
															? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
															: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
													)}
												>
													{isSubscribed ? "Subscribed" : "Unsubscribed"}
												</span>
											</div>
											<span className="text-paragraph-xs text-text-sub-600 dark:text-neutral-400">
												{isSubscribed
													? "Can receive marketing and broadcast emails"
													: "Marketing paused — transactional emails only"}
											</span>
										</div>
									</div>
									<Checkbox.Root
										id="new-marketing-checkbox"
										checked={isSubscribed}
										onCheckedChange={(checked) =>
											setIsSubscribed(checked === true)
										}
										aria-label="Marketing Email"
									/>
								</label>
							</section>
						</div>
					</div>

					{/* ── Footer Action Bar (New: full-width bottom shelf with justify-between) ── */}
					<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							className="gap-1.5"
						>
							Cancel
							<ActionKbd className="lowercase! w-auto min-w-0 px-1">
								esc
							</ActionKbd>
						</Button.Root>

						<FancyButton.Root
							type="button"
							variant="primary"
							size="small"
							className="min-w-[95px] justify-center font-medium"
						>
							<span className="flex items-center justify-center gap-1.5 font-medium">
								<span>Update</span>
								<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
							</span>
						</FancyButton.Root>
					</div>
				</form>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*                 MAIN EDIT CONTACT COMPARISON COMPONENT                     */
/* -------------------------------------------------------------------------- */

export function TwitterEditContactComparison() {
	return (
		<div className="mx-auto flex w-full max-w-[1300px] flex-col items-center justify-center gap-10 xl:flex-row xl:items-start xl:gap-0">
			{/* Left Side: Old Edit Contact Modal */}
			<div className="flex w-full flex-1 flex-col items-center xl:items-end">
				<div className="w-full max-w-[480px]">
					<EditContactOld />
				</div>
			</div>

			{/* Center Vertical Divider Line */}
			<div className="hidden shrink-0 self-stretch px-10 xl:flex xl:items-stretch">
				<div className="w-px bg-stroke-soft-100 dark:bg-white/10" aria-hidden />
			</div>
			<div
				className="h-px w-full bg-stroke-soft-100 xl:hidden dark:bg-white/10"
				aria-hidden
			/>

			{/* Right Side: New Redesigned Edit Contact Modal */}
			<div className="flex w-full flex-1 flex-col items-center xl:items-start">
				<div className="w-full max-w-[500px]">
					<EditContactNew />
				</div>
			</div>
		</div>
	);
}
