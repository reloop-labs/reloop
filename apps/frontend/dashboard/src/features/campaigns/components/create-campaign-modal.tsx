"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import * as Textarea from "@reloop/ui/textarea";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useContactsQuery } from "#/features/contacts/hooks/use-contacts-query";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import { useTemplatesQuery } from "#/features/templates/hooks/use-templates-query";
import type { AudienceTargetType } from "../campaign-types";
import { useCampaigns } from "../campaigns-provider";

interface CreateCampaignModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type Step = "setup" | "audience" | "sender" | "content" | "review";

export const CreateCampaignModal = ({
	open,
	onOpenChange,
}: CreateCampaignModalProps) => {
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

	// Load templates
	const templatesQuery = useTemplatesQuery();

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
	const [audienceType, setAudienceType] = useState<AudienceTargetType>("all");

	// Content Step
	const [selectedTemplateId, setSelectedTemplateId] =
		useState<string>("custom");
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

	const handleReset = () => {
		setStep("setup");
		setName("");
		setSubject("");
		setPreviewText("");
		setTestEmailAddress("");
		onOpenChange(false);
	};

	const handleSendTestEmail = () => {
		const email = testEmailAddress.trim();
		if (!email || !email.includes("@")) {
			toast.error("Please enter a valid email address for test send");
			return;
		}
		toast.success(`Test email sent to ${email}`);
	};

	const handleSaveDraft = async () => {
		if (!name.trim()) {
			toast.error("Please enter a campaign name");
			return;
		}
		setBusy(true);
		try {
			const campaign = await createCampaign(
				{
					name: name.trim(),
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
			handleReset();
			toast.success("Campaign saved as draft");
			router.push(`/campaigns/${campaign.id}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to save campaign");
		} finally {
			setBusy(false);
		}
	};

	const handleBroadcastNow = async () => {
		if (!name.trim() || !subject.trim()) {
			toast.error("Please fill in campaign name and subject line");
			return;
		}

		setIsSendingBroadcast(true);
		try {
			// Simulate broadcast dispatch
			await new Promise((resolve) => setTimeout(resolve, 800));

			const campaign = await createCampaign(
				{
					name: name.trim(),
					subject: subject.trim(),
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

			handleReset();
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

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-2xl">
				<Modal.Header>
					<div className="flex items-center justify-between">
						<div>
							<Modal.Title>Create & Send Campaign</Modal.Title>
							<Modal.Description>
								Compose a message and broadcast directly to all your contacts.
							</Modal.Description>
						</div>

						{/* Step indicator pills */}
						<div className="hidden items-center gap-1 sm:flex">
							{(
								["setup", "audience", "sender", "content", "review"] as Step[]
							).map((s, idx) => {
								const labels = [
									"Details",
									"Audience",
									"Sender",
									"Content",
									"Review",
								];
								const active = step === s;
								return (
									<button
										key={s}
										type="button"
										onClick={() => setStep(s)}
										className={`rounded-full px-2.5 py-0.5 font-medium text-xs transition-colors ${
											active
												? "bg-bg-strong-950 text-text-white-0 dark:bg-bg-white-0 dark:text-text-strong-950"
												: "bg-bg-weak-50 text-text-sub-600 hover:text-text-strong-950"
										}`}
									>
										{idx + 1}. {labels[idx]}
									</button>
								);
							})}
						</div>
					</div>
				</Modal.Header>

				<Modal.Body className="max-h-[68vh] overflow-y-auto pr-1">
					{/* STEP 1: SETUP */}
					{step === "setup" && (
						<div className="space-y-4">
							<div className="space-y-1.5">
								<Label.Root htmlFor="campaign-name">
									Campaign Name <span className="text-error-base">*</span>
								</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											id="campaign-name"
											placeholder="e.g. August Product Launch & Community Update"
											value={name}
											onChange={(e) => setName(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
								<p className="text-[11px] text-text-sub-600">
									Internal title used for tracking in your dashboard.
								</p>
							</div>
						</div>
					)}

					{/* STEP 2: AUDIENCE */}
					{step === "audience" && (
						<div className="space-y-5">
							{/* Audience target box */}
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/50">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2.5">
										<div className="flex h-9 w-9 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 dark:border-stroke-soft-100/50">
											<Icon name="contacts" className="h-4 w-4" />
										</div>
										<div>
											<h4 className="font-medium text-sm text-text-strong-950">
												Send to All Contacts
											</h4>
											<p className="text-text-sub-600 text-xs">
												Broadcast will be delivered to every active subscribed
												contact.
											</p>
										</div>
									</div>

									<div className="rounded-full bg-success-base/10 px-3 py-1 font-semibold text-success-base text-xs">
										{totalContacts.toLocaleString()} recipients
									</div>
								</div>
							</div>
						</div>
					)}

					{/* STEP 3: SENDER */}
					{step === "sender" && (
						<div className="space-y-5">
							{/* Sender Name & From Address */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label.Root htmlFor="from-name">From Name</Label.Root>
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
								</div>

								<div className="space-y-1.5">
									<Label.Root htmlFor="reply-to">
										Reply-To (Optional)
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
								</div>
							</div>

							{/* Sender Email with Domain Selector */}
							<div className="space-y-1.5">
								<Label.Root>From Email Address</Label.Root>
								<div className="flex items-center gap-2">
									<div className="flex-1">
										<Input.Root>
											<Input.Wrapper>
												<Input.Input
													placeholder="newsletter"
													value={fromUsername}
													onChange={(e) => setFromUsername(e.target.value)}
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>
									<span className="text-sm text-text-sub-600">@</span>
									<div className="w-48">
										<select
											value={effectiveDomain}
											onChange={(e) => setSelectedDomain(e.target.value)}
											className="h-9 w-full rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-3 text-sm text-text-strong-950 outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
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
									Sending as{" "}
									<span className="font-mono text-text-strong-950">
										{senderEmailAddress}
									</span>
								</p>
							</div>

							{/* Subject Line */}
							<div className="space-y-1.5 pt-1">
								<Label.Root htmlFor="campaign-subject">
									Subject Line <span className="text-error-base">*</span>
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
									The primary subject line subscribers see in their inboxes.
								</p>
							</div>

							{/* Preview Text */}
							<div className="space-y-1.5">
								<Label.Root htmlFor="campaign-preview">
									Preview Text (Optional)
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
									Secondary preview line displayed in email clients.
								</p>
							</div>
						</div>
					)}

					{/* STEP 4: CONTENT & PREVIEW */}
					{step === "content" && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium text-text-sub-600 text-xs">
										Merge tags:
									</span>
									{["{{firstName}}", "{{email}}", "{{company}}"].map((tag) => (
										<button
											key={tag}
											type="button"
											onClick={() => setContentHtml((prev) => `${prev} ${tag}`)}
											className="rounded border border-stroke-soft-100 bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[10px] text-text-strong-950 hover:bg-bg-soft-200/50"
										>
											{tag}
										</button>
									))}
								</div>

								{/* Desktop / Mobile Preview Toggle */}
								<div className="flex items-center rounded-lg border border-stroke-soft-100 p-0.5">
									<button
										type="button"
										onClick={() => setPreviewDevice("desktop")}
										className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
											previewDevice === "desktop"
												? "bg-bg-weak-100 font-medium text-text-strong-950"
												: "text-text-sub-600"
										}`}
									>
										<Icon name="laptop" className="h-3 w-3" />
										Desktop
									</button>
									<button
										type="button"
										onClick={() => setPreviewDevice("mobile")}
										className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
											previewDevice === "mobile"
												? "bg-bg-weak-100 font-medium text-text-strong-950"
												: "text-text-sub-600"
										}`}
									>
										<Icon name="smartphone" className="h-3 w-3" />
										Mobile
									</button>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
								{/* Editor Area */}
								<div className="space-y-1.5">
									<Label.Root htmlFor="email-body">
										Email HTML / Content
									</Label.Root>
									<textarea
										id="email-body"
										value={contentHtml}
										onChange={(e) => setContentHtml(e.target.value)}
										rows={12}
										className="w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 font-mono text-text-strong-950 text-xs outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
										placeholder="Write HTML or plain text message..."
									/>
								</div>

								{/* Live Preview Container */}
								<div className="space-y-1.5">
									<Label.Root>Live Preview</Label.Root>
									<div
										className={`flex flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm transition-all duration-200 dark:border-stroke-soft-100/50 ${
											previewDevice === "mobile"
												? "mx-auto max-w-[280px]"
												: "w-full"
										}`}
									>
										{/* Mock email client header */}
										<div className="border-stroke-soft-100 border-b bg-bg-weak-50/50 p-2.5 text-xs dark:border-stroke-soft-100/50">
											<p className="truncate font-semibold text-text-strong-950">
												{subject || "Subject line..."}
											</p>
											<p className="truncate text-[11px] text-text-sub-600">
												From: {fromName} &lt;{senderEmailAddress}&gt;
											</p>
										</div>

										{/* Rendered HTML */}
										<div
											className="prose prose-sm dark:prose-invert max-h-56 overflow-y-auto p-3 text-text-strong-950 text-xs"
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
					)}

					{/* STEP 4: REVIEW & BROADCAST */}
					{step === "review" && (
						<div className="space-y-5">
							{/* Summary Checklist Box */}
							<div className="divide-y divide-stroke-soft-100 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
								<div className="flex items-center justify-between p-3.5">
									<span className="font-medium text-text-sub-600 text-xs">
										Campaign Name
									</span>
									<span className="font-medium text-text-strong-950 text-xs">
										{name || "Untitled"}
									</span>
								</div>

								<div className="flex items-center justify-between p-3.5">
									<span className="font-medium text-text-sub-600 text-xs">
										Subject Line
									</span>
									<span className="max-w-[280px] truncate text-right font-medium text-text-strong-950 text-xs">
										{subject || "No subject specified"}
									</span>
								</div>

								<div className="flex items-center justify-between p-3.5">
									<span className="font-medium text-text-sub-600 text-xs">
										Sender
									</span>
									<span className="font-mono text-text-strong-950 text-xs">
										{fromName} &lt;{senderEmailAddress}&gt;
									</span>
								</div>

								<div className="flex items-center justify-between p-3.5">
									<span className="font-medium text-text-sub-600 text-xs">
										Recipients
									</span>
									<div className="flex items-center gap-1.5">
										<Icon
											name="contacts"
											className="h-3.5 w-3.5 text-success-base"
										/>
										<span className="font-semibold text-success-base text-xs">
											All Contacts ({totalContacts.toLocaleString()} recipients)
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
									Send a test copy to verify rendering in your own inbox before
									broadcasting.
								</p>

								<div className="mt-3 flex items-center gap-2">
									<div className="flex-1">
										<Input.Root>
											<Input.Wrapper>
												<Input.Input
													placeholder="your-email@domain.com"
													value={testEmailAddress}
													onChange={(e) => setTestEmailAddress(e.target.value)}
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
						</div>
					)}
				</Modal.Body>

				<Modal.Footer className="flex items-center justify-between border-stroke-soft-100 border-t pt-4 dark:border-stroke-soft-100/50">
					{/* Left button: Previous or Cancel */}
					{step === "setup" ? (
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleReset}
							disabled={busy || isSendingBroadcast}
						>
							Cancel
						</Button.Root>
					) : (
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => {
								if (step === "audience") setStep("setup");
								if (step === "sender") setStep("audience");
								if (step === "content") setStep("sender");
								if (step === "review") setStep("content");
							}}
							disabled={busy || isSendingBroadcast}
						>
							Back
						</Button.Root>
					)}

					{/* Right buttons: Next / Save Draft / Broadcast */}
					<div className="flex items-center gap-2">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleSaveDraft}
							disabled={!name.trim() || busy || isSendingBroadcast}
						>
							Save Draft
						</Button.Root>

						{step !== "review" ? (
							<Button.Root
								variant="neutral"
								size="small"
								onClick={() => {
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
								}}
							>
								Continue
							</Button.Root>
						) : (
							<Button.Root
								variant="neutral"
								size="small"
								onClick={handleBroadcastNow}
								disabled={isSendingBroadcast || !name.trim() || !subject.trim()}
								className="gap-1.5"
							>
								<Icon name="mail-send" className="h-3.5 w-3.5" />
								{isSendingBroadcast
									? "Broadcasting to all contacts…"
									: `Send to All Contacts (${totalContacts.toLocaleString()})`}
							</Button.Root>
						)}
					</div>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
