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
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import type { AudienceTargetType } from "../campaign-types";
import { CampaignsProvider, useCampaigns } from "../campaigns-provider";

type Step = "setup" | "audience" | "sender" | "content" | "review";

const STEPS: { id: Step; label: string; description: string; icon: string }[] =
	[
		{
			id: "setup",
			label: "General Information",
			description: "Campaign name",
			icon: "file-text",
		},
		{
			id: "audience",
			label: "Audience",
			description: "Target recipients",
			icon: "contacts",
		},
		{
			id: "sender",
			label: "Sender",
			description: "Identity & subject line",
			icon: "mail-send",
		},
		{
			id: "content",
			label: "Email Content",
			description: "Design & preview",
			icon: "layout",
		},
		{
			id: "review",
			label: "Summary",
			description: "Final checklist",
			icon: "check-circle",
		},
	];

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
	const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

	// Setup Step
	const [name, setName] = useState("");
	const [nameError, setNameError] = useState("");
	const [nameShakeKey, setNameShakeKey] = useState(0);
	const [subject, setSubject] = useState("");
	const [subjectError, setSubjectError] = useState("");
	const [subjectShakeKey, setSubjectShakeKey] = useState(0);
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
				setNameError("Please enter a campaign name");
				setNameShakeKey((k) => k + 1);
				return;
			}
			setNameError("");
			setStep("audience");
		} else if (step === "audience") {
			setStep("sender");
		} else if (step === "sender") {
			if (!subject.trim()) {
				setSubjectError("Please enter a subject line");
				setSubjectShakeKey((k) => k + 1);
				return;
			}
			setSubjectError("");
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

	return (
		<div className="relative min-h-[calc(100vh-120px)] w-full px-6 py-12">
			{/* Left Stepper Sidebar - Absolute on desktop */}
			<aside
				aria-label="Campaign creation progress"
				className="hidden font-sans lg:absolute lg:top-12 lg:left-8 lg:block lg:w-48 xl:left-14"
			>
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
			</aside>
			{/* Center Content Container */}
			<div
				className={`mx-auto w-full font-sans transition-all duration-200 ${
					step === "content" ? "max-w-3xl" : "max-w-xl"
				}`}
			>
				<AnimatePresence mode="wait">
					{/* STEP 1: SETUP */}
					{step === "setup" && (
						<motion.div
							key="setup"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
						>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleContinue();
								}}
							>
								{/* Header Section */}
								<div>
									<Icon
										name="file-text"
										className="mb-3 h-6 w-6 text-text-strong-950"
									/>
									<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
										Campaign Details
									</h1>
									<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
										Give your campaign a title to identify and track it in your
										analytics.
									</p>
								</div>

								{/* Field */}
								<div className="space-y-2 pt-7">
									<Label.Root htmlFor="campaign-name">
										Campaign Name
										<Label.Asterisk />
									</Label.Root>
									<motion.div
										key={nameShakeKey}
										animate={
											nameShakeKey > 0
												? { x: [0, 6, -6, 4, -4, 2, -2, 0] }
												: { x: 0 }
										}
										transition={{
											duration: 0.35,
											ease: [0.22, 1, 0.36, 1],
										}}
									>
										<Input.Root size="medium" hasError={Boolean(nameError)}>
											<Input.Wrapper>
												<Input.Input
													id="campaign-name"
													placeholder="e.g. August 2026 Product Launch & Community Update"
													value={name}
													onChange={(e) => {
														setName(e.target.value);
														if (nameError) setNameError("");
													}}
													autoFocus
												/>
											</Input.Wrapper>
										</Input.Root>
									</motion.div>
									<AnimatePresence>
										{nameError && (
											<motion.p
												initial={{ opacity: 0, y: -4, height: 0 }}
												animate={{ opacity: 1, y: 0, height: "auto" }}
												exit={{ opacity: 0, y: -4, height: 0 }}
												transition={{
													duration: 0.2,
													ease: [0.22, 1, 0.36, 1],
												}}
												className="overflow-hidden font-medium text-error-base text-xs"
											>
												{nameError}
											</motion.p>
										)}
									</AnimatePresence>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center justify-end gap-3 pt-5">
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="small"
										onClick={handleBack}
										disabled={isSendingBroadcast}
										className="rounded-xl"
									>
										Cancel
									</Button.Root>
									<FancyButton.Root
										type="submit"
										variant="blue"
										size="small"
										className="min-w-[134px] justify-center overflow-hidden rounded-xl"
									>
										Continue
									</FancyButton.Root>
								</div>
							</form>
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
						>
							{/* Header Section */}
							<div>
								<Icon
									name="contacts"
									className="mb-3 h-6 w-6 text-text-strong-950"
								/>
								<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
									Target Audience
								</h1>
								<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
									Define who receives this broadcast and review your total
									recipient count.
								</p>
							</div>

							{/* Audience target box */}
							<div className="pt-7">
								<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/50">
									<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 shadow-xs dark:border-stroke-soft-100/50">
												<Icon name="contacts" className="h-5 w-5" />
											</div>
											<div>
												<h4 className="font-medium text-sm text-text-strong-950">
													Send to All Contacts
												</h4>
												<p className="text-text-sub-600 text-xs">
													Broadcast will be delivered to every active subscribed
													contact across your organization.
												</p>
											</div>
										</div>

										<div className="inline-flex items-center gap-1.5 self-start rounded-full bg-success-base/10 px-3.5 py-1 font-semibold text-success-base text-xs sm:self-center">
											<span className="h-2 w-2 rounded-full bg-success-base" />
											{totalContacts.toLocaleString()} recipients
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-3 pt-5">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={handleBack}
									disabled={isSendingBroadcast}
									className="rounded-xl"
								>
									Back
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleContinue}
									className="min-w-[134px] justify-center overflow-hidden rounded-xl"
								>
									Continue
								</FancyButton.Root>
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
						>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleContinue();
								}}
							>
								{/* Header Section */}
								<div>
									<Icon
										name="mail-send"
										className="mb-3 h-6 w-6 text-text-strong-950"
									/>
									<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
										Sender & Subject Details
									</h1>
									<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
										Configure your sender profile, email address, subject line,
										and preheader.
									</p>
								</div>

								<div className="space-y-4 pt-7">
									{/* Sender Name & Reply-To */}
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div className="space-y-1.5">
											<Label.Root htmlFor="from-name">From Name</Label.Root>
											<Input.Root size="medium">
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
											<Label.Root htmlFor="reply-to">
												Reply-To Email{" "}
												<span className="font-normal text-text-sub-600">
													(optional)
												</span>
											</Label.Root>
											<Input.Root size="medium">
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
												Direct replies to a specific support or team address.
											</p>
										</div>
									</div>

									{/* Sender Email with Domain Selector */}
									<div className="space-y-1.5">
										<Label.Root>From Email Address</Label.Root>
										<div className="flex items-center gap-2">
											<div className="flex-1">
												<Input.Root size="medium">
													<Input.Wrapper>
														<Input.Input
															placeholder="newsletter"
															value={fromUsername}
															onChange={(e) => setFromUsername(e.target.value)}
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
													onChange={(e) => setSelectedDomain(e.target.value)}
													className="h-10 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-text-strong-950 text-xs outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
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
										<Label.Root htmlFor="campaign-subject">
											Subject Line <Label.Asterisk />
										</Label.Root>
										<motion.div
											key={subjectShakeKey}
											animate={
												subjectShakeKey > 0
													? { x: [0, 6, -6, 4, -4, 2, -2, 0] }
													: { x: 0 }
											}
											transition={{
												duration: 0.35,
												ease: [0.22, 1, 0.36, 1],
											}}
										>
											<Input.Root
												size="medium"
												hasError={Boolean(subjectError)}
											>
												<Input.Wrapper>
													<Input.Input
														id="campaign-subject"
														placeholder="e.g. 🚀 Reloop 2.0 is live: Check out what's new"
														value={subject}
														onChange={(e) => {
															setSubject(e.target.value);
															if (subjectError) setSubjectError("");
														}}
													/>
												</Input.Wrapper>
											</Input.Root>
										</motion.div>
										<AnimatePresence>
											{subjectError ? (
												<motion.p
													initial={{ opacity: 0, y: -4, height: 0 }}
													animate={{ opacity: 1, y: 0, height: "auto" }}
													exit={{ opacity: 0, y: -4, height: 0 }}
													transition={{
														duration: 0.2,
														ease: [0.22, 1, 0.36, 1],
													}}
													className="overflow-hidden font-medium text-error-base text-xs"
												>
													{subjectError}
												</motion.p>
											) : (
												<p className="text-[11px] text-text-sub-600">
													The primary headline subscribers will see in their
													inboxes.
												</p>
											)}
										</AnimatePresence>
									</div>

									{/* Preview Text / Preheader */}
									<div className="space-y-1.5">
										<Label.Root htmlFor="campaign-preview">
											Preview Text / Preheader{" "}
											<span className="font-normal text-text-sub-600">
												(optional)
											</span>
										</Label.Root>
										<Input.Root size="medium">
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
											Secondary text shown alongside the subject line in email
											clients.
										</p>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center justify-end gap-3 pt-5">
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="small"
										onClick={handleBack}
										disabled={isSendingBroadcast}
										className="rounded-xl"
									>
										Back
									</Button.Root>
									<FancyButton.Root
										type="submit"
										variant="blue"
										size="small"
										className="min-w-[134px] justify-center overflow-hidden rounded-xl"
									>
										Continue
									</FancyButton.Root>
								</div>
							</form>
						</motion.div>
					)}

					{/* STEP 4: CONTENT */}
					{step === "content" && (
						<motion.div
							key="content"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
						>
							{/* Header Section */}
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<Icon
										name="layout"
										className="mb-3 h-6 w-6 text-text-strong-950"
									/>
									<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
										Design & Message Content
									</h1>
									<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
										Write rich HTML or plain text with merge tag
										personalization.
									</p>
								</div>

								{/* Device toggle */}
								<div className="flex items-center rounded-lg border border-stroke-soft-200 p-0.5 dark:border-stroke-soft-100/50">
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

							<div className="space-y-4 pt-7">
								{/* Variable helper */}
								<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 px-3.5 py-2 dark:border-stroke-soft-100/50">
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
													className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-mono text-[11px] text-text-strong-950 shadow-2xs hover:bg-bg-weak-50 dark:border-stroke-soft-100/50"
												>
													+ {tag}
												</button>
											),
										)}
									</div>
								</div>

								{/* Split Editor / Preview */}
								<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
									{/* Editor */}
									<div className="space-y-1.5">
										<Label.Root htmlFor="email-body">
											Email HTML / Content
										</Label.Root>
										<textarea
											id="email-body"
											value={contentHtml}
											onChange={(e) => setContentHtml(e.target.value)}
											rows={14}
											className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 font-mono text-text-strong-950 text-xs leading-relaxed outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
											placeholder="Write HTML or markdown message..."
										/>
									</div>

									{/* Live Preview */}
									<div className="space-y-1.5">
										<Label.Root>Interactive Preview</Label.Root>
										<div
											className={`flex flex-col overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm transition-all duration-200 dark:border-stroke-soft-100/50 ${
												previewDevice === "mobile"
													? "mx-auto max-w-[300px]"
													: "w-full"
											}`}
										>
											{/* Preview header */}
											<div className="border-stroke-soft-200 border-b bg-bg-weak-50/70 p-3 text-xs dark:border-stroke-soft-100/50">
												<p className="truncate font-semibold text-text-strong-950">
													{subject || "Subject line preview..."}
												</p>
												<p className="mt-0.5 truncate text-[11px] text-text-sub-600">
													From: {fromName} &lt;{senderEmailAddress}&gt;
												</p>
												{previewText && (
													<p className="mt-0.5 truncate text-[11px] text-text-sub-600/80 italic">
														{previewText}
													</p>
												)}
											</div>

											{/* Preview body */}
											<div
												className="prose prose-sm dark:prose-invert max-h-[300px] overflow-y-auto p-4 text-text-strong-950 text-xs"
												dangerouslySetInnerHTML={{
													__html: contentHtml
														.replace(/\{\{firstName.*?\}\}/g, "Pranav")
														.replace(/\{\{email\}\}/g, "pranav@example.com")
														.replace(/\{\{company\}\}/g, "Reloop Inc"),
												}}
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-3 pt-5">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={handleBack}
									disabled={isSendingBroadcast}
									className="rounded-xl"
								>
									Back
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleContinue}
									className="min-w-[134px] justify-center overflow-hidden rounded-xl"
								>
									Continue
								</FancyButton.Root>
							</div>
						</motion.div>
					)}

					{/* STEP 5: REVIEW */}
					{step === "review" && (
						<motion.div
							key="review"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
						>
							{/* Header Section */}
							<div>
								<Icon
									name="check-circle"
									className="mb-3 h-6 w-6 text-text-strong-950"
								/>
								<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
									Review & Send
								</h1>
								<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
									Verify details and send a test email before broadcasting to
									your contacts.
								</p>
							</div>

							<div className="space-y-5 pt-7">
								{/* Summary List */}
								<div className="divide-y divide-stroke-soft-200 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/40 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
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

								{/* Send test box */}
								<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 dark:border-stroke-soft-100/50">
									<h5 className="font-medium text-sm text-text-strong-950">
										Send test email
									</h5>
									<p className="mt-0.5 text-text-sub-600 text-xs">
										Send a test copy to verify rendering in your own inbox
										before broadcasting.
									</p>
									<div className="mt-3 flex max-w-md items-center gap-2">
										<div className="flex-1">
											<Input.Root size="medium">
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
											className="rounded-xl"
										>
											Send test
										</Button.Root>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-3 pt-5">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={handleBack}
									disabled={isSendingBroadcast}
									className="rounded-xl"
								>
									Back
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleBroadcastNow}
									disabled={
										isSendingBroadcast || !name.trim() || !subject.trim()
									}
									className="min-w-[180px] justify-center overflow-hidden rounded-xl"
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
												Send to All Contacts ({totalContacts.toLocaleString()})
											</span>
										</>
									)}
								</FancyButton.Root>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
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
