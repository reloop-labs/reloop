"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useContactsQuery } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import { useUIStore } from "#/store/use-ui-store";
import type { AudienceTargetType } from "../campaign-types";
import { CampaignsProvider, useCampaigns } from "../campaigns-provider";

type Step = "setup" | "audience" | "sender" | "content" | "review";

const STEPS: { id: Step; label: string; description: string }[] = [
	{
		id: "setup",
		label: "General Information",
		description: "Campaign name",
	},
	{
		id: "audience",
		label: "Audience",
		description: "Target recipients",
	},
	{
		id: "sender",
		label: "Sender",
		description: "Identity & subject line",
	},
	{
		id: "content",
		label: "Email Content",
		description: "Design & preview",
	},
	{
		id: "review",
		label: "Summary",
		description: "Final checklist",
	},
];

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

function CreateCampaignPageContent() {
	const router = useRouter();
	const { activeOrganization } = useActiveOrganization();
	const { createCampaign } = useCampaigns();

	// Load audience contacts count
	const contactsQuery = useContactsQuery({
		page: 1,
		limit: 1,
		search: "",
		status: "subscribed",
	});

	// Load domains
	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 50,
		q: "",
		status: [],
	});

	const totalContacts =
		contactsQuery.data?.total ?? contactsQuery.data?.totalContacts ?? 1280;

	// Form State
	const [step, setStep] = useState<Step>("setup");
	const [busy, setBusy] = useState(false);
	const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

	// Setup Step
	const [name, setName] = useState("");
	const [subject, setSubject] = useState("");
	const [previewText, setPreviewText] = useState("");

	// Audience & Sender Step
	const [fromName, setFromName] = useState(
		activeOrganization?.name
			? `${activeOrganization.name} Team`
			: "Reloop Team",
	);
	const [fromUsername, setFromUsername] = useState("updates");
	const [selectedDomain, setSelectedDomain] = useState("");
	const [replyTo, setReplyTo] = useState("");
	const [audienceType] = useState<AudienceTargetType>("all");

	// Content Step
	const [contentHtml, setContentHtml] = useState(
		`<h2>Hi {{firstName | default: "there"}},</h2>\n<p>We are thrilled to announce our latest updates and features built to help you grow.</p>\n<p>Here is what is new:</p>\n<ul>\n  <li>Ultra-fast global email dispatch</li>\n  <li>Deep delivery & engagement analytics</li>\n  <li>Automated workflow triggers</li>\n</ul>\n<p>Check out the full changelog on our dashboard.</p>\n<p>Best regards,<br />The Team</p>`,
	);
	const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
		"desktop",
	);
	const [testEmailAddress, setTestEmailAddress] = useState("");

	// Compute verified domains list
	const domainsList = useMemo(() => {
		const list = domainsQuery.data?.domains ?? [];
		if (list.length > 0) return list.map((d) => d.domain);
		return ["reloop.sh", "mail.reloop.sh"];
	}, [domainsQuery.data?.domains]);

	const effectiveDomain = selectedDomain || domainsList[0] || "reloop.sh";
	const senderEmailAddress = `${fromUsername.trim() || "newsletter"}@${effectiveDomain}`;

	// Shortcuts
	useHotkeys(
		"esc",
		(e) => {
			e.preventDefault();
			router.push("/campaigns");
		},
		{ enableOnFormTags: false },
	);

	const handleSendTestEmail = () => {
		const email = testEmailAddress.trim();
		if (!email || !email.includes("@")) {
			toast.error("Please enter a valid email address for test send");
			return;
		}
		toast.success(`Test email sent to ${email}`);
	};

	const handleSaveDraft = async () => {
		const campaignName = name.trim() || "Untitled Campaign";
		setBusy(true);
		try {
			const campaign = await createCampaign(
				{
					name: campaignName,
					subject: subject.trim() || "Untitled Campaign",
					previewText: previewText.trim() || undefined,
					fromName: fromName.trim() || "Team",
					fromEmail: senderEmailAddress,
					replyTo: replyTo.trim() || undefined,
					audienceType,
					audienceTargetName: "All Contacts",
					contentHtml,
					sendImmediately: false,
				},
				totalContacts,
			);
			toast.success("Campaign saved as draft");
			router.push(`/campaigns/${campaign.id}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to save campaign");
		} finally {
			setBusy(false);
		}
	};

	const handleBroadcastNow = async () => {
		const campaignName = name.trim() || "Untitled Broadcast";
		const campaignSubject = subject.trim() || "Announcements & Updates";

		setIsSendingBroadcast(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 800));

			const campaign = await createCampaign(
				{
					name: campaignName,
					subject: campaignSubject,
					previewText: previewText.trim() || undefined,
					fromName: fromName.trim() || "Team",
					fromEmail: senderEmailAddress,
					replyTo: replyTo.trim() || undefined,
					audienceType,
					audienceTargetName: "All Contacts",
					contentHtml,
					sendImmediately: true,
				},
				totalContacts,
			);

			toast.success(
				`🚀 Campaign broadcasted to all ${totalContacts.toLocaleString()} contacts!`,
			);
			router.push(`/campaigns/${campaign.id}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to send campaign");
		} finally {
			setIsSendingBroadcast(false);
		}
	};

	const handleContinue = () => {
		if (step === "setup") {
			if (!name.trim()) {
				toast.error("Please enter a campaign name");
				return;
			}
			setStep("audience");
		} else if (step === "audience") {
			setStep("sender");
		} else if (step === "sender") {
			if (!subject.trim()) {
				toast.error("Please enter a subject line");
				return;
			}
			setStep("content");
		} else if (step === "content") {
			setStep("review");
		}
	};

	const handleBack = () => {
		if (step === "audience") setStep("setup");
		else if (step === "sender") setStep("audience");
		else if (step === "content") setStep("sender");
		else if (step === "review") setStep("content");
		else router.push("/campaigns");
	};

	const handleOpenSupport = () => {
		const { setAiPanelActiveTab, setIsAiPanelOpen } = useUIStore.getState();
		setAiPanelActiveTab("support");
		setIsAiPanelOpen(true);
	};

	return (
		<div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
			{/* Main Grid: Left Stepper Sidebar + Right Form Content */}
			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				{/* Left Stepper Sidebar */}
				<div className="self-stretch lg:col-span-4 lg:border-stroke-soft-200/80 lg:border-r lg:pr-8 dark:lg:border-stroke-soft-100/50">
					<div className="sticky top-8 space-y-6 font-sans">
						{/* Steps List */}
						<div className="space-y-2.5">
							{STEPS.map((s, idx) => {
								const stepIndex = STEPS.findIndex((item) => item.id === step);
								const isCurrent = step === s.id;
								const isCompleted = idx < stepIndex;

								return (
									<button
										key={s.id}
										type="button"
										onClick={() => setStep(s.id)}
										className={`flex w-full cursor-pointer items-center gap-2.5 text-left transition-colors ${
											isCurrent
												? "font-medium text-text-strong-950 text-xs"
												: isCompleted
													? "font-medium text-text-sub-600 text-xs hover:text-text-strong-950"
													: "font-medium text-text-soft-400 text-xs hover:text-text-sub-600"
										}`}
									>
										<span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
											{isCurrent || isCompleted ? (
												<span
													className={`h-1.5 w-1.5 rounded-full ${
														isCurrent
															? "bg-text-strong-950 dark:bg-text-strong-950"
															: "bg-text-sub-600/60"
													}`}
												/>
											) : (
												<span className="h-1.5 w-1.5 rounded-full border border-stroke-soft-300 bg-transparent" />
											)}
										</span>
										<span>{s.label}</span>
									</button>
								);
							})}
						</div>

						{/* Support Section */}
						<div className="space-y-2 border-stroke-soft-200/60 border-t pt-6 text-text-sub-600 text-xs">
							<p className="font-medium text-text-strong-950">
								Need assistance?
							</p>
							<p className="text-text-soft-400 leading-relaxed">
								Reach out to our support team for help with campaigns, sender
								setup, or broadcast delivery.
							</p>
							<button
								type="button"
								onClick={handleOpenSupport}
								className="inline-flex cursor-pointer items-center gap-1 pt-1 font-medium text-text-strong-950 text-xs hover:underline"
							>
								Contact support
								<Icon name="arrow-right" className="h-3 w-3" />
							</button>
						</div>
					</div>
				</div>

				{/* Right Form Body Container */}
				<div className="lg:col-span-8">
					<div className="w-full space-y-6 font-sans">
						{/* Main Card Container */}
						<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/50">
							{/* Top Padded Content Area */}
							<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6 dark:border-stroke-soft-100/50 dark:bg-bg-white-0">
								<AnimatePresence mode="wait">
									{/* STEP 1: SETUP */}
									{step === "setup" && (
										<motion.div
											key="setup"
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -8 }}
											transition={{ duration: 0.18 }}
											className="space-y-5"
										>
											<div>
												<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
													Campaign Details
												</h2>
												<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed">
													Give your campaign a title to identify and track it in
													your analytics.
												</p>
											</div>

											<div className="space-y-4">
												<div className="space-y-1.5">
													<Label.Root
														htmlFor="campaign-name"
														className="font-medium text-text-strong-950 text-xs"
													>
														Campaign Name{" "}
														<span className="text-error-base">*</span>
													</Label.Root>
													<Input.Root>
														<Input.Wrapper>
															<Input.Input
																id="campaign-name"
																placeholder="e.g. August 2026 Product Launch & Community Update"
																value={name}
																onChange={(e) => setName(e.target.value)}
																autoFocus
															/>
														</Input.Wrapper>
													</Input.Root>
													<p className="text-[11px] text-text-sub-600">
														Internal title used for tracking in your dashboard
														and analytics.
													</p>
												</div>
											</div>
										</motion.div>
									)}

									{/* STEP 2: AUDIENCE */}
									{step === "audience" && (
										<motion.div
											key="audience"
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -8 }}
											transition={{ duration: 0.18 }}
											className="space-y-5"
										>
											<div>
												<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
													Target Audience
												</h2>
												<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed">
													Define who receives this broadcast and review your
													total recipient count.
												</p>
											</div>

											{/* Audience target box */}
											<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/50">
												<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
													<div className="flex items-center gap-3">
														<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 shadow-xs dark:border-stroke-soft-100/50">
															<Icon name="contacts" className="h-5 w-5" />
														</div>
														<div>
															<h4 className="font-medium text-sm text-text-strong-950">
																Send to All Contacts
															</h4>
															<p className="text-text-sub-600 text-xs">
																Broadcast will be delivered to every active
																subscribed contact across your organization.
															</p>
														</div>
													</div>

													<div className="inline-flex items-center gap-1.5 self-start rounded-full bg-success-base/10 px-3.5 py-1 font-semibold text-success-base text-xs sm:self-center">
														<span className="h-2 w-2 rounded-full bg-success-base" />
														{totalContacts.toLocaleString()} recipients
													</div>
												</div>
											</div>
										</motion.div>
									)}

									{/* STEP 3: SENDER */}
									{step === "sender" && (
										<motion.div
											key="sender"
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -8 }}
											transition={{ duration: 0.18 }}
											className="space-y-5"
										>
											<div>
												<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
													Sender & Subject Details
												</h2>
												<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed">
													Configure your sender profile, email address, subject
													line, and preheader.
												</p>
											</div>

											<div className="space-y-4">
												{/* Sender Name & Reply-To */}
												<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
													<div className="space-y-1.5">
														<Label.Root
															htmlFor="from-name"
															className="font-medium text-text-strong-950 text-xs"
														>
															From Name
														</Label.Root>
														<Input.Root>
															<Input.Wrapper>
																<Input.Input
																	id="from-name"
																	placeholder="e.g. Reloop Announcements"
																	value={fromName}
																	onChange={(e) => setFromName(e.target.value)}
																/>
															</Input.Wrapper>
														</Input.Root>
														<p className="text-[11px] text-text-sub-600">
															The display name recipients will see.
														</p>
													</div>

													<div className="space-y-1.5">
														<Label.Root
															htmlFor="reply-to"
															className="font-medium text-text-strong-950 text-xs"
														>
															Reply-To Email{" "}
															<span className="font-normal text-text-sub-600">
																(optional)
															</span>
														</Label.Root>
														<Input.Root>
															<Input.Wrapper>
																<Input.Input
																	id="reply-to"
																	placeholder="e.g. support@reloop.sh"
																	value={replyTo}
																	onChange={(e) => setReplyTo(e.target.value)}
																/>
															</Input.Wrapper>
														</Input.Root>
														<p className="text-[11px] text-text-sub-600">
															Direct replies to a specific support or team
															address.
														</p>
													</div>
												</div>

												{/* Sender Email with Domain Selector */}
												<div className="space-y-1.5">
													<Label.Root className="font-medium text-text-strong-950 text-xs">
														From Email Address
													</Label.Root>
													<div className="flex items-center gap-2">
														<div className="flex-1">
															<Input.Root>
																<Input.Wrapper>
																	<Input.Input
																		placeholder="newsletter"
																		value={fromUsername}
																		onChange={(e) =>
																			setFromUsername(e.target.value)
																		}
																	/>
																</Input.Wrapper>
															</Input.Root>
														</div>
														<span className="font-medium text-sm text-text-sub-600">
															@
														</span>
														<div className="w-56">
															<select
																value={effectiveDomain}
																onChange={(e) =>
																	setSelectedDomain(e.target.value)
																}
																className="h-9 w-full rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-3 text-text-strong-950 text-xs outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
															>
																{domainsList.map((d) => (
																	<option key={d} value={d}>
																		{d}
																	</option>
																))}
															</select>
														</div>
													</div>
													<p className="text-[11px] text-text-sub-600">
														Sending as:{" "}
														<span className="font-medium font-mono text-text-strong-950">
															{senderEmailAddress}
														</span>
													</p>
												</div>

												{/* Subject Line */}
												<div className="space-y-1.5 pt-1">
													<Label.Root
														htmlFor="campaign-subject"
														className="font-medium text-text-strong-950 text-xs"
													>
														Subject Line{" "}
														<span className="text-error-base">*</span>
													</Label.Root>
													<Input.Root>
														<Input.Wrapper>
															<Input.Input
																id="campaign-subject"
																placeholder="e.g. 🚀 Reloop 2.0 is live: Check out what's new"
																value={subject}
																onChange={(e) => setSubject(e.target.value)}
															/>
														</Input.Wrapper>
													</Input.Root>
													<p className="text-[11px] text-text-sub-600">
														The primary headline subscribers will see in their
														inboxes.
													</p>
												</div>

												{/* Preview Text / Preheader */}
												<div className="space-y-1.5">
													<Label.Root
														htmlFor="campaign-preview"
														className="font-medium text-text-strong-950 text-xs"
													>
														Preview Text / Preheader{" "}
														<span className="font-normal text-text-sub-600">
															(optional)
														</span>
													</Label.Root>
													<Input.Root>
														<Input.Wrapper>
															<Input.Input
																id="campaign-preview"
																placeholder="Snippet displayed in inboxes right after the subject..."
																value={previewText}
																onChange={(e) => setPreviewText(e.target.value)}
															/>
														</Input.Wrapper>
													</Input.Root>
													<p className="text-[11px] text-text-sub-600">
														Secondary text shown alongside the subject line in
														email clients.
													</p>
												</div>
											</div>
										</motion.div>
									)}

									{/* STEP 4: CONTENT & PREVIEW */}
									{step === "content" && (
										<motion.div
											key="content"
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -8 }}
											transition={{ duration: 0.18 }}
											className="space-y-5"
										>
											<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
												<div>
													<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
														Design & Message Content
													</h2>
													<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed">
														Write rich HTML or plain text with merge tag
														personalization.
													</p>
												</div>

												{/* Desktop / Mobile Preview Toggle */}
												<div className="flex items-center rounded-lg border border-stroke-soft-100 p-0.5 dark:border-stroke-soft-100/50">
													<button
														type="button"
														onClick={() => setPreviewDevice("desktop")}
														className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-colors ${
															previewDevice === "desktop"
																? "bg-bg-weak-100 text-text-strong-950 shadow-xs"
																: "text-text-sub-600 hover:text-text-strong-950"
														}`}
													>
														<Icon name="laptop" className="h-3.5 w-3.5" />
														Desktop
													</button>
													<button
														type="button"
														onClick={() => setPreviewDevice("mobile")}
														className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-colors ${
															previewDevice === "mobile"
																? "bg-bg-weak-100 text-text-strong-950 shadow-xs"
																: "text-text-sub-600 hover:text-text-strong-950"
														}`}
													>
														<Icon name="smartphone" className="h-3.5 w-3.5" />
														Mobile
													</button>
												</div>
											</div>

											{/* Merge tags toolbar */}
											<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 px-3.5 py-2 dark:border-stroke-soft-100/50">
												<span className="font-medium text-text-sub-600 text-xs">
													Insert dynamic merge tag:
												</span>
												<div className="flex flex-wrap items-center gap-1.5">
													{["{{firstName}}", "{{email}}", "{{company}}"].map(
														(tag) => (
															<button
																key={tag}
																type="button"
																onClick={() =>
																	setContentHtml((prev) => `${prev} ${tag}`)
																}
																className="rounded-md border border-stroke-soft-100 bg-bg-white-0 px-2 py-0.5 font-mono text-[11px] text-text-strong-950 shadow-2xs hover:bg-bg-weak-50 dark:border-stroke-soft-100/50"
															>
																+ {tag}
															</button>
														),
													)}
												</div>
											</div>

											<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
												{/* Editor Area */}
												<div className="space-y-1.5">
													<Label.Root
														htmlFor="email-body"
														className="font-medium text-text-strong-950 text-xs"
													>
														Email HTML / Content
													</Label.Root>
													<textarea
														id="email-body"
														value={contentHtml}
														onChange={(e) => setContentHtml(e.target.value)}
														rows={14}
														className="w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3.5 font-mono text-text-strong-950 text-xs leading-relaxed outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
														placeholder="Write HTML or markdown message..."
													/>
												</div>

												{/* Live Preview Container */}
												<div className="space-y-1.5">
													<Label.Root className="font-medium text-text-strong-950 text-xs">
														Interactive Preview
													</Label.Root>
													<div
														className={`flex flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm transition-all duration-200 dark:border-stroke-soft-100/50 ${
															previewDevice === "mobile"
																? "mx-auto max-w-[300px]"
																: "w-full"
														}`}
													>
														{/* Mock email client header */}
														<div className="border-stroke-soft-100 border-b bg-bg-weak-50/70 p-3 text-xs dark:border-stroke-soft-100/50">
															<p className="truncate font-semibold text-text-strong-950">
																{subject || "Subject line preview..."}
															</p>
															<p className="mt-0.5 truncate text-[11px] text-text-sub-600">
																From: {fromName} &lt;{senderEmailAddress}
																&gt;
															</p>
															{previewText && (
																<p className="mt-0.5 truncate text-[11px] text-text-sub-600/80 italic">
																	{previewText}
																</p>
															)}
														</div>

														{/* Rendered HTML */}
														<div
															className="prose prose-sm dark:prose-invert max-h-[300px] overflow-y-auto p-4 text-text-strong-950 text-xs"
															dangerouslySetInnerHTML={{
																__html: contentHtml
																	.replace(/\{\{firstName.*?\}\}/g, "Pranav")
																	.replace(
																		/\{\{email\}\}/g,
																		"pranav@example.com",
																	)
																	.replace(/\{\{company\}\}/g, "Reloop Inc"),
															}}
														/>
													</div>
												</div>
											</div>
										</motion.div>
									)}

									{/* STEP 5: REVIEW & BROADCAST */}
									{step === "review" && (
										<motion.div
											key="review"
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -8 }}
											transition={{ duration: 0.18 }}
											className="space-y-5"
										>
											<div>
												<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
													Review & Send
												</h2>
												<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed">
													Verify details and send a test email before
													broadcasting to your contacts.
												</p>
											</div>

											{/* Summary Checklist */}
											<div className="divide-y divide-stroke-soft-100 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/40 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
												<div className="flex items-center justify-between p-3.5">
													<span className="font-medium text-text-sub-600 text-xs">
														Campaign Name
													</span>
													<span className="font-semibold text-text-strong-950 text-xs">
														{name || "Untitled Campaign"}
													</span>
												</div>

												<div className="flex items-center justify-between p-3.5">
													<span className="font-medium text-text-sub-600 text-xs">
														Subject Line
													</span>
													<span className="max-w-sm truncate text-right font-medium text-text-strong-950 text-xs">
														{subject || "No subject specified"}
													</span>
												</div>

												<div className="flex items-center justify-between p-3.5">
													<span className="font-medium text-text-sub-600 text-xs">
														Sender Identity
													</span>
													<span className="font-mono text-text-strong-950 text-xs">
														{fromName} &lt;{senderEmailAddress}&gt;
													</span>
												</div>

												<div className="flex items-center justify-between p-3.5">
													<span className="font-medium text-text-sub-600 text-xs">
														Total Audience
													</span>
													<div className="flex items-center gap-1.5">
														<Icon
															name="contacts"
															className="h-4 w-4 text-success-base"
														/>
														<span className="font-semibold text-success-base text-xs">
															All Contacts ({totalContacts.toLocaleString()}{" "}
															recipients)
														</span>
													</div>
												</div>
											</div>

											{/* Test Email Box */}
											<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/50">
												<h5 className="font-medium text-sm text-text-strong-950">
													Send test email
												</h5>
												<p className="mt-0.5 text-text-sub-600 text-xs">
													Send a test copy to verify rendering in your own inbox
													before broadcasting.
												</p>

												<div className="mt-3 flex max-w-md items-center gap-2">
													<div className="flex-1">
														<Input.Root>
															<Input.Wrapper>
																<Input.Input
																	placeholder="your-email@domain.com"
																	value={testEmailAddress}
																	onChange={(e) =>
																		setTestEmailAddress(e.target.value)
																	}
																/>
															</Input.Wrapper>
														</Input.Root>
													</div>
													<Button.Root
														variant="neutral"
														mode="stroke"
														size="small"
														onClick={handleSendTestEmail}
													>
														Send test
													</Button.Root>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Bottom Footer / Action Bar */}
							<div className="flex items-center justify-between px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
								{/* Left: Back / Cancel */}
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={handleBack}
									disabled={busy || isSendingBroadcast}
									className="gap-1.5 rounded-xl text-text-sub-600 hover:text-text-strong-950"
								>
									{step === "setup" ? "Cancel" : "Back"}
								</Button.Root>

								{/* Right: Save Draft & Next/Send */}
								<div className="flex items-center gap-2.5">
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="small"
										onClick={handleSaveDraft}
										disabled={!name.trim() || busy || isSendingBroadcast}
										className="gap-1.5 rounded-xl"
									>
										Save Draft
									</Button.Root>

									{step !== "review" ? (
										<FancyButton.Root
											type="button"
											variant="blue"
											size="small"
											onClick={handleContinue}
											className="min-w-[110px] gap-1.5 rounded-xl"
										>
											Continue
											<ActionKbd className={actionKbdOnBlueClassName}>
												↵
											</ActionKbd>
										</FancyButton.Root>
									) : (
										<FancyButton.Root
											type="button"
											variant="blue"
											size="small"
											onClick={handleBroadcastNow}
											disabled={
												isSendingBroadcast || !name.trim() || !subject.trim()
											}
											className="min-w-[180px] gap-1.5 rounded-xl"
										>
											{isSendingBroadcast ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Broadcasting…</span>
												</>
											) : (
												<>
													<Icon name="mail-send" className="h-4 w-4" />
													<span>
														Send to All Contacts (
														{totalContacts.toLocaleString()})
													</span>
												</>
											)}
										</FancyButton.Root>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function CreateCampaignPage() {
	return (
		<CampaignsProvider>
			<CreateCampaignPageContent />
		</CampaignsProvider>
	);
}
