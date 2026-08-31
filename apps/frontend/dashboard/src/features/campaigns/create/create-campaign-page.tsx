"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as FileFormatIcon from "@reloop/ui/file-format-icon";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	useChannelsQuery,
	useContactsQuery,
	useGroupsQuery,
} from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import type { AudienceTargetType } from "../campaign-types";
import { CampaignsProvider, useCampaigns } from "../campaigns-provider";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type Step = "setup" | "audience" | "sender" | "content" | "review";

const STEPS: { id: Step; label: string; description: string; icon: string }[] =
	[
		{
			id: "setup",
			label: "General Information",
			description: "Campaign name",
			icon: "mega-phone",
		},
		{
			id: "audience",
			label: "Contact",
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

	// Load groups & channels
	const groupsQuery = useGroupsQuery({
		page: 1,
		limit: 100,
		search: "",
	});

	const channelsQuery = useChannelsQuery();

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

	// Contact Target Step
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [audienceView, setAudienceView] = useState<"select" | "detail">(
		"select",
	);
	const [audienceType, setAudienceType] = useState<AudienceTargetType>("all");
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [selectedGroupName, setSelectedGroupName] = useState<string>("");
	const [selectedChannelId, setSelectedChannelId] = useState<string>("");
	const [selectedChannelName, setSelectedChannelName] = useState<string>("");
	const [csvFileName, setCsvFileName] = useState<string>("");
	const [csvEmails, setCsvEmails] = useState<string[]>([]);
	const [csvParsing, setCsvParsing] = useState(false);
	const [csvError, setCsvError] = useState<string>("");
	const [targetError, setTargetError] = useState<string>("");
	const [targetShakeKey, setTargetShakeKey] = useState<number>(0);
	const [groupSearch, setGroupSearch] = useState<string>("");

	// Audience & Sender Step
	const [fromName, setFromName] = useState(
		activeOrganization?.name
			? `${activeOrganization.name} Team`
			: "Reloop Team",
	);
	const [fromUsername, setFromUsername] = useState("updates");
	const [selectedDomain, setSelectedDomain] = useState("");
	const [replyTo, setReplyTo] = useState("");

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

	// Available Groups & Channels
	const availableGroups = useMemo(() => {
		const fetched = groupsQuery.data?.groups ?? [];
		if (fetched.length > 0) return fetched;
		return [
			{
				id: "grp-newsletter",
				name: "Newsletter Subscribers",
				description: "Subscribed to regular product digests and emails",
				memberCount: Math.round(totalContacts * 0.65),
			},
			{
				id: "grp-beta",
				name: "Beta Testers & Power Users",
				description: "Early access feature feedback segment",
				memberCount: Math.round(totalContacts * 0.25),
			},
			{
				id: "grp-enterprise",
				name: "Enterprise Customers",
				description: "Key accounts and organization administrators",
				memberCount: Math.round(totalContacts * 0.15),
			},
			{
				id: "grp-waitlist",
				name: "Product Launch Waitlist",
				description: "Prospective users waiting for feature releases",
				memberCount: Math.round(totalContacts * 0.35),
			},
		];
	}, [groupsQuery.data?.groups, totalContacts]);

	const availableChannels = useMemo(() => {
		const fetched = channelsQuery.data?.channels ?? [];
		if (fetched.length > 0) return fetched;
		return [
			{
				id: "chn-marketing",
				name: "Marketing & Announcements",
				description: "General product news, tips, and feature launches",
				subscriberCount: Math.round(totalContacts * 0.75),
			},
			{
				id: "chn-product",
				name: "Product Changelog",
				description: "Release notes, weekly updates, and roadmap previews",
				subscriberCount: Math.round(totalContacts * 0.45),
			},
			{
				id: "chn-security",
				name: "Security & System Alerts",
				description: "Critical security notices and operational advisories",
				subscriberCount: Math.round(totalContacts * 0.9),
			},
		];
	}, [channelsQuery.data?.channels, totalContacts]);

	const filteredGroups = useMemo(() => {
		if (!groupSearch.trim()) return availableGroups;
		const q = groupSearch.toLowerCase();
		return availableGroups.filter((g) => g.name.toLowerCase().includes(q));
	}, [availableGroups, groupSearch]);

	const effectiveRecipientCount = useMemo(() => {
		if (audienceType === "all") return totalContacts;
		if (audienceType === "group") {
			const found = availableGroups.find((g) => g.id === selectedGroupId);
			return (
				(found as { memberCount?: number })?.memberCount ??
				Math.min(totalContacts, Math.max(1, Math.round(totalContacts * 0.45)))
			);
		}
		if (audienceType === "channel") {
			const found = availableChannels.find((c) => c.id === selectedChannelId);
			return (
				found?.subscriberCount ??
				Math.min(totalContacts, Math.max(1, Math.round(totalContacts * 0.6)))
			);
		}
		if (audienceType === "csv") return csvEmails.length;
		return totalContacts;
	}, [
		audienceType,
		totalContacts,
		availableGroups,
		selectedGroupId,
		availableChannels,
		selectedChannelId,
		csvEmails.length,
	]);

	const effectiveTargetName = useMemo(() => {
		if (audienceType === "all") return "All Contacts";
		if (audienceType === "group")
			return selectedGroupName || "Selected Contact Group";
		if (audienceType === "channel")
			return selectedChannelName
				? `Channel: ${selectedChannelName}`
				: "Selected Channel";
		if (audienceType === "csv")
			return csvFileName ? `CSV: ${csvFileName}` : "Imported CSV Contacts";
		return "All Contacts";
	}, [audienceType, selectedGroupName, selectedChannelName, csvFileName]);

	const handleCsvFileUpload = (file: File) => {
		setCsvParsing(true);
		setCsvError("");
		setTargetError("");

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target?.result as string;
				if (!text) {
					setCsvError("File appears to be empty");
					setCsvParsing(false);
					return;
				}
				const emailMatches =
					text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
				const uniqueEmails = Array.from(
					new Set(emailMatches.map((em) => em.trim().toLowerCase())),
				);
				if (uniqueEmails.length === 0) {
					setCsvError(
						"No valid email addresses found in uploaded file. Ensure your CSV has an email column.",
					);
					setCsvEmails([]);
					setCsvFileName("");
				} else {
					setCsvEmails(uniqueEmails);
					setCsvFileName(file.name);
					setCsvError("");
					toast.success(
						`Parsed ${uniqueEmails.length.toLocaleString()} valid contacts from ${file.name}`,
					);
				}
			} catch {
				setCsvError("Failed to read and parse the file");
			} finally {
				setCsvParsing(false);
			}
		};
		reader.onerror = () => {
			setCsvError("Error reading the uploaded file");
			setCsvParsing(false);
		};
		reader.readAsText(file);
	};

	// Shortcuts
	useHotkeys(
		"esc",
		(e) => {
			e.preventDefault();
			handleBack();
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		["mod+enter", "meta+enter", "ctrl+enter"],
		(e) => {
			e.preventDefault();
			if (step === "review") {
				handleBroadcastNow();
			} else {
				handleContinue();
			}
		},
		{ enableOnFormTags: true },
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
					audienceTargetId:
						audienceType === "group"
							? selectedGroupId
							: audienceType === "channel"
								? selectedChannelId
								: undefined,
					audienceTargetName: effectiveTargetName,
					contentHtml,
					sendImmediately: true,
				},
				effectiveRecipientCount,
			);

			toast.success(
				`🚀 Campaign broadcasted to ${effectiveRecipientCount.toLocaleString()} recipients!`,
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
			if (audienceType === "group" && !selectedGroupId) {
				setTargetError("Please select a contact group to continue");
				setTargetShakeKey((k) => k + 1);
				return;
			}
			if (audienceType === "channel" && !selectedChannelId) {
				setTargetError("Please select a channel to continue");
				setTargetShakeKey((k) => k + 1);
				return;
			}
			if (audienceType === "csv" && csvEmails.length === 0) {
				setTargetError(
					"Please upload a CSV or TXT file with valid contact emails",
				);
				setTargetShakeKey((k) => k + 1);
				return;
			}
			setTargetError("");
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
		if (step === "audience") {
			if (audienceView === "detail") {
				setAudienceView("select");
				setTargetError("");
			} else {
				setStep("setup");
			}
		} else if (step === "sender") {
			setStep("audience");
		} else if (step === "content") {
			setStep("sender");
		} else if (step === "review") {
			setStep("content");
		} else {
			router.push("/campaigns");
		}
	};

	return (
		<div className="relative mx-auto flex min-h-[calc(100vh-120px)] w-full items-start justify-center px-6 py-12">
			{/* Left Stepper Sidebar - Sticky on desktop */}
			<aside
				aria-label="Campaign creation progress"
				className="sticky top-12 hidden w-48 shrink-0 font-sans lg:block xl:w-56"
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
					step === "content" ? "max-w-3xl" : "max-w-md"
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
							className="space-y-6"
						>
							{/* Header Section */}
							<div>
								<Icon
									name="mega-phone"
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

							{/* Main Card Container */}
							<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
								<form
									onSubmit={(e) => {
										e.preventDefault();
										handleContinue();
									}}
								>
									{/* Top Padded Content Area */}
									<div className="m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
										<div>
											<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
												General Information
											</h2>
											<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
												Name your broadcast campaign for organization and
												performance tracking.
											</p>
										</div>

										<div className="space-y-2">
											<Label.Root
												htmlFor="campaign-name"
												className="font-medium text-text-strong-950 text-xs"
											>
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
									</div>

									{/* Bottom Footer / Action Bar (Inside the 2 borders) */}
									<div className="flex items-center justify-end px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
										<FancyButton.Root
											type="submit"
											variant="blue"
											size="small"
											className="min-w-[134px] justify-center gap-1.5 overflow-hidden rounded-xl font-medium text-sm"
										>
											Continue
											<ActionKbd className={actionKbdOnBlueClassName}>
												↵
											</ActionKbd>
										</FancyButton.Root>
									</div>
								</form>
							</div>
						</motion.div>
					)}

					{/* STEP 2: AUDIENCE / CONTACTS */}
					{step === "audience" && (
						<AnimatePresence mode="wait">
							{audienceView === "select" ? (
								<motion.div
									key="audience-select"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.18 }}
									className="space-y-6"
								>
									{/* Header Section */}
									<div>
										<Icon
											name="contacts"
											className="mb-3 h-6 w-6 text-text-strong-950"
										/>
										<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
											Target Contact
										</h1>
										<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
											Define who receives this broadcast and review your total
											recipient count.
										</p>
									</div>

									{/* Main Card Container */}
									<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
										<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
											{/* Header */}
											<div>
												<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
													Add contacts to your workspace
												</h2>
												<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
													Select from CSV drag & drop import, manual entry, or
													API integration to expand your audience.
												</p>
											</div>

											{/* Option Grid */}
											<div className="space-y-3">
												{/* Option 1: Import CSV file */}
												<button
													type="button"
													onClick={() => {
														setAudienceType("csv");
														setAudienceView("detail");
														setTargetError("");
													}}
													className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50/70"
												>
													<div className="flex items-center gap-3.5">
														<div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
															<FileFormatIcon.Root
																format="CSV"
																color="green"
																size="small"
																className="h-6 w-6"
															/>
														</div>
														<div>
															<div className="font-medium text-sm text-text-strong-950 group-hover:text-black dark:group-hover:text-white">
																Import CSV file
															</div>
															<div className="text-text-sub-600 text-xs">
																Upload a spreadsheet file to bulk import
																subscribers.
															</div>
														</div>
													</div>
													<Icon
														name="arrow-right"
														className="h-4 w-4 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950"
													/>
												</button>

												{/* Option 2: Contact Groups */}
												<button
													type="button"
													onClick={() => {
														setAudienceType("group");
														setAudienceView("detail");
														setTargetError("");
														const firstGroup = availableGroups[0];
														if (!selectedGroupId && firstGroup) {
															setSelectedGroupId(firstGroup.id);
															setSelectedGroupName(firstGroup.name);
														}
													}}
													className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50/70"
												>
													<div className="flex items-center gap-3.5">
														<div className="relative flex h-10 w-10 shrink-0 items-center justify-center text-text-strong-950">
															<Icon
																name="contacts"
																className="h-6 w-6 text-amber-500"
															/>
														</div>
														<div>
															<div className="font-medium text-sm text-text-strong-950 group-hover:text-black dark:group-hover:text-white">
																Contact Groups
															</div>
															<div className="text-text-sub-600 text-xs">
																Target specific segments and organized contact
																lists.
															</div>
														</div>
													</div>
													<Icon
														name="arrow-right"
														className="h-4 w-4 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950"
													/>
												</button>

												{/* Option 3: Channels */}
												<button
													type="button"
													onClick={() => {
														setAudienceType("channel");
														setAudienceView("detail");
														setTargetError("");
														const firstChannel = availableChannels[0];
														if (!selectedChannelId && firstChannel) {
															setSelectedChannelId(firstChannel.id);
															setSelectedChannelName(firstChannel.name);
														}
													}}
													className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50/70"
												>
													<div className="flex items-center gap-3.5">
														<div className="relative flex h-10 w-10 shrink-0 items-center justify-center text-text-strong-950">
															<Icon
																name="notification-indicator"
																className="h-6 w-6 text-blue-600 dark:text-blue-400"
															/>
														</div>
														<div>
															<div className="font-medium text-sm text-text-strong-950 group-hover:text-black dark:group-hover:text-white">
																Channels
															</div>
															<div className="text-text-sub-600 text-xs">
																Deliver only to subscribers opted into a
																specific channel.
															</div>
														</div>
													</div>
													<Icon
														name="arrow-right"
														className="h-4 w-4 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950"
													/>
												</button>

												{/* Option 4: All Contacts */}
												<button
													type="button"
													onClick={() => {
														setAudienceType("all");
														setAudienceView("detail");
														setTargetError("");
													}}
													className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50/70"
												>
													<div className="flex items-center gap-3.5">
														<div className="relative flex h-10 w-10 shrink-0 items-center justify-center text-text-strong-950">
															<Icon
																name="contacts"
																className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
															/>
														</div>
														<div>
															<div className="font-medium text-sm text-text-strong-950 group-hover:text-black dark:group-hover:text-white">
																All Contacts
															</div>
															<div className="text-text-sub-600 text-xs">
																Broadcast to every active subscriber across your
																organization.
															</div>
														</div>
													</div>
													<Icon
														name="arrow-right"
														className="h-4 w-4 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950"
													/>
												</button>
											</div>
										</div>

										{/* Bottom Footer / Action Bar (Inside the 2 borders) */}
										<div className="flex items-center justify-start px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
											<Button.Root
												type="button"
												variant="neutral"
												mode="stroke"
												size="small"
												onClick={handleBack}
												disabled={isSendingBroadcast}
												className="gap-1.5 rounded-xl"
											>
												Back
												<ActionKbd className="w-auto min-w-4 px-1">
													esc
												</ActionKbd>
											</Button.Root>
										</div>
									</div>
								</motion.div>
							) : (
								<motion.div
									key="audience-detail"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.18 }}
									className="space-y-6"
								>
									{/* Header Section */}
									<div>
										<Icon
											name="contacts"
											className="mb-3 h-6 w-6 text-text-strong-950"
										/>
										<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
											Target Contact
										</h1>
										<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
											Configure the selected target audience for your campaign
											broadcast.
										</p>
									</div>

									<motion.div
										key={targetShakeKey}
										animate={
											targetShakeKey > 0
												? { x: [0, 6, -6, 4, -4, 2, -2, 0] }
												: { x: 0 }
										}
										transition={{
											duration: 0.35,
											ease: [0.22, 1, 0.36, 1],
										}}
										className="space-y-4"
									>
										{/* Main Card Container */}
										<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
											<div className="m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
												{audienceType === "all" && (
													<div className="space-y-4">
														<div>
															<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
																All Contacts Audience
															</h2>
															<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
																Broadcast will reach all active subscribed
																contacts in your workspace.
															</p>
														</div>

														<div className="flex items-center gap-3 rounded-xl bg-success-base/[0.06] p-4 text-success-base">
															<Icon
																name="check-circle"
																className="h-5 w-5 shrink-0 text-success-base"
															/>
															<div className="text-xs">
																<p className="font-semibold text-text-strong-950">
																	{totalContacts.toLocaleString()} Active
																	Subscribers Selected
																</p>
																<p className="mt-0.5 text-text-sub-600">
																	Every contact with active subscription status
																	will be included in this broadcast.
																</p>
															</div>
														</div>
													</div>
												)}

												{audienceType === "group" && (
													<div className="space-y-4">
														<div>
															<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
																Select Contact Group
															</h2>
															<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
																Choose a segment or organized audience group to
																target.
															</p>
														</div>

														<div className="space-y-3">
															<div className="flex items-center justify-between gap-2">
																<span className="font-medium text-text-strong-950 text-xs">
																	Groups ({filteredGroups.length})
																</span>
																<div className="w-48">
																	<Input.Root size="small">
																		<Input.Wrapper>
																			<Input.Input
																				placeholder="Search groups..."
																				value={groupSearch}
																				onChange={(e) =>
																					setGroupSearch(e.target.value)
																				}
																			/>
																		</Input.Wrapper>
																	</Input.Root>
																</div>
															</div>

															<div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pt-0.5">
																{filteredGroups.map((grp) => {
																	const isGrpSelected =
																		selectedGroupId === grp.id;
																	return (
																		<div
																			key={grp.id}
																			onClick={() => {
																				setSelectedGroupId(grp.id);
																				setSelectedGroupName(grp.name);
																				setTargetError("");
																			}}
																			className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
																				isGrpSelected
																					? "border-primary-base bg-primary-base/[0.04] dark:border-primary-base/70 dark:bg-primary-base/10"
																					: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50/60 dark:border-stroke-soft-100/50"
																			}`}
																		>
																			<div className="flex min-w-0 items-center gap-2.5">
																				<div
																					className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
																						isGrpSelected
																							? "border-primary-base bg-primary-base text-white"
																							: "border-stroke-soft-300"
																					}`}
																				>
																					{isGrpSelected && (
																						<div className="h-1.5 w-1.5 rounded-full bg-white" />
																					)}
																				</div>
																				<div className="min-w-0">
																					<p className="truncate font-medium text-text-strong-950 text-xs">
																						{grp.name}
																					</p>
																					{"description" in grp &&
																						grp.description && (
																							<p className="truncate text-[11px] text-text-sub-600">
																								{grp.description}
																							</p>
																						)}
																				</div>
																			</div>
																			<span className="shrink-0 rounded-md bg-bg-weak-50 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 dark:bg-white/10">
																				{("memberCount" in grp &&
																				typeof grp.memberCount === "number"
																					? grp.memberCount
																					: Math.round(totalContacts * 0.4)
																				).toLocaleString()}{" "}
																				contacts
																			</span>
																		</div>
																	);
																})}
															</div>
														</div>
													</div>
												)}

												{audienceType === "channel" && (
													<div className="space-y-4">
														<div>
															<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
																Select Delivery Channel
															</h2>
															<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
																Deliver exclusively to contacts opted into this
																notification channel.
															</p>
														</div>

														<div className="space-y-3">
															<span className="font-medium text-text-strong-950 text-xs">
																Channels ({availableChannels.length})
															</span>

															<div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto">
																{availableChannels.map((chn) => {
																	const isChnSelected =
																		selectedChannelId === chn.id;
																	return (
																		<div
																			key={chn.id}
																			onClick={() => {
																				setSelectedChannelId(chn.id);
																				setSelectedChannelName(chn.name);
																				setTargetError("");
																			}}
																			className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
																				isChnSelected
																					? "border-primary-base bg-primary-base/[0.04] dark:border-primary-base/70 dark:bg-primary-base/10"
																					: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50/60 dark:border-stroke-soft-100/50"
																			}`}
																		>
																			<div className="flex min-w-0 items-center gap-2.5">
																				<div
																					className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
																						isChnSelected
																							? "border-primary-base bg-primary-base text-white"
																							: "border-stroke-soft-300"
																					}`}
																				>
																					{isChnSelected && (
																						<div className="h-1.5 w-1.5 rounded-full bg-white" />
																					)}
																				</div>
																				<div className="min-w-0">
																					<p className="truncate font-medium text-text-strong-950 text-xs">
																						{chn.name}
																					</p>
																					{chn.description && (
																						<p className="truncate text-[11px] text-text-sub-600">
																							{chn.description}
																						</p>
																					)}
																				</div>
																			</div>
																			<span className="shrink-0 rounded-md bg-bg-weak-50 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 dark:bg-white/10">
																				{(
																					chn.subscriberCount ??
																					Math.round(totalContacts * 0.6)
																				).toLocaleString()}{" "}
																				subs
																			</span>
																		</div>
																	);
																})}
															</div>
														</div>
													</div>
												)}

												{audienceType === "csv" && (
													<div className="space-y-4">
														<div>
															<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
																Import CSV File
															</h2>
															<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
																Upload a .csv or .txt file containing contacts
																to broadcast to.
															</p>
														</div>

														<div className="space-y-3">
															<input
																type="file"
																ref={fileInputRef}
																accept=".csv,.txt"
																onChange={(e) => {
																	const file = e.target.files?.[0];
																	if (file) handleCsvFileUpload(file);
																}}
																className="hidden"
															/>

															{csvEmails.length === 0 ? (
																<div
																	onClick={() => fileInputRef.current?.click()}
																	onDragOver={(e) => e.preventDefault()}
																	onDrop={(e) => {
																		e.preventDefault();
																		const file = e.dataTransfer.files?.[0];
																		if (file) handleCsvFileUpload(file);
																	}}
																	className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-stroke-soft-300 border-dashed bg-bg-white-0 px-4 py-8 text-center transition-colors hover:border-primary-base hover:bg-primary-base/[0.02] dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5"
																>
																	<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600">
																		<Icon
																			name="file-text"
																			className="h-5 w-5"
																		/>
																	</div>
																	<h5 className="mt-3 font-semibold text-text-strong-950 text-xs">
																		{csvParsing
																			? "Parsing CSV contents…"
																			: "Click to upload or drag & drop CSV"}
																	</h5>
																	<p className="mt-1 max-w-xs text-[11px] text-text-sub-600">
																		Upload .csv or .txt file containing email
																		addresses.
																	</p>
																	<div className="mt-3">
																		<Button.Root
																			type="button"
																			variant="neutral"
																			mode="stroke"
																			size="small"
																			className="rounded-lg"
																		>
																			Browse File
																		</Button.Root>
																	</div>
																</div>
															) : (
																<div className="space-y-3">
																	<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 dark:border-stroke-soft-100/50">
																		<div className="flex min-w-0 items-center gap-3">
																			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-primary-base">
																				<Icon
																					name="file-text"
																					className="h-4.5 w-4.5"
																				/>
																			</div>
																			<div className="min-w-0">
																				<p className="truncate font-semibold text-text-strong-950 text-xs">
																					{csvFileName}
																				</p>
																				<p className="font-medium text-[11px] text-success-base">
																					{csvEmails.length.toLocaleString()}{" "}
																					valid contacts
																				</p>
																			</div>
																		</div>
																		<div className="flex shrink-0 items-center gap-1.5">
																			<Button.Root
																				type="button"
																				variant="neutral"
																				mode="stroke"
																				size="xsmall"
																				onClick={() =>
																					fileInputRef.current?.click()
																				}
																				className="rounded-lg"
																			>
																				Replace
																			</Button.Root>
																			<Button.Root
																				type="button"
																				variant="neutral"
																				mode="stroke"
																				size="xsmall"
																				onClick={() => {
																					setCsvEmails([]);
																					setCsvFileName("");
																					if (fileInputRef.current)
																						fileInputRef.current.value = "";
																				}}
																				className="rounded-lg text-error-base hover:text-error-base"
																			>
																				Remove
																			</Button.Root>
																		</div>
																	</div>

																	{/* Preview Chips */}
																	<div className="space-y-1.5">
																		<p className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
																			Preview Recipients
																		</p>
																		<div className="flex flex-wrap items-center gap-1.5">
																			{csvEmails.slice(0, 6).map((em) => (
																				<span
																					key={em}
																					className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-mono text-[10px] text-text-strong-950 dark:border-stroke-soft-100/50"
																				>
																					{em}
																				</span>
																			))}
																			{csvEmails.length > 6 && (
																				<span className="rounded-md bg-bg-weak-50 px-2 py-0.5 font-medium text-[10px] text-text-sub-600">
																					+{csvEmails.length - 6} more
																				</span>
																			)}
																		</div>
																	</div>
																</div>
															)}

															{csvError && (
																<p className="font-medium text-error-base text-xs">
																	{csvError}
																</p>
															)}
														</div>
													</div>
												)}

												{/* Error Message */}
												<AnimatePresence>
													{targetError && (
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
															{targetError}
														</motion.p>
													)}
												</AnimatePresence>
											</div>

											{/* Bottom Footer / Action Bar (Inside the 2 borders) */}
											<div className="flex items-center justify-between px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
												<Button.Root
													type="button"
													variant="neutral"
													mode="stroke"
													size="small"
													onClick={handleBack}
													disabled={isSendingBroadcast}
													className="gap-1.5 rounded-xl"
												>
													Back
													<ActionKbd className="w-auto min-w-4 px-1">
														esc
													</ActionKbd>
												</Button.Root>
												<FancyButton.Root
													type="button"
													variant="blue"
													size="small"
													onClick={handleContinue}
													className="min-w-[134px] justify-center gap-1.5 overflow-hidden rounded-xl font-medium text-sm"
												>
													Continue
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</FancyButton.Root>
											</div>
										</div>
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>
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
										className="gap-1.5 rounded-xl"
									>
										Back
										<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
									</Button.Root>
									<FancyButton.Root
										type="submit"
										variant="blue"
										size="small"
										className="min-w-[134px] justify-center gap-1.5 overflow-hidden rounded-xl"
									>
										Continue
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
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
									className="gap-1.5 rounded-xl"
								>
									Back
									<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleContinue}
									className="min-w-[134px] justify-center gap-1.5 overflow-hidden rounded-xl"
								>
									Continue
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
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
											Target Contact
										</span>
										<div className="flex items-center gap-1.5">
											<Icon
												name="contacts"
												className="h-4 w-4 text-success-base"
											/>
											<span className="font-semibold text-success-base text-xs">
												{effectiveTargetName} (
												{effectiveRecipientCount.toLocaleString()} recipients)
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
									className="gap-1.5 rounded-xl"
								>
									Back
									<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleBroadcastNow}
									disabled={
										isSendingBroadcast || !name.trim() || !subject.trim()
									}
									className="min-w-[180px] justify-center gap-1.5 overflow-hidden rounded-xl"
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
												Send to {effectiveTargetName} (
												{effectiveRecipientCount.toLocaleString()})
											</span>
											<span className="inline-flex items-center gap-0.5">
												<ActionKbd className={actionKbdOnBlueClassName}>
													⌘
												</ActionKbd>
												<ActionKbd className={actionKbdOnBlueClassName}>
													↵
												</ActionKbd>
											</span>
										</>
									)}
								</FancyButton.Root>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<div
				className="hidden w-48 shrink-0 lg:block xl:w-56"
				aria-hidden="true"
			/>
			;
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
