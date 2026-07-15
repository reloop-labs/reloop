"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useRef, useState } from "react";
import * as simpleIcons from "simple-icons";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

const renderSimpleIcon = (slug: string, className?: string) => {
	const icon = (simpleIcons as any)[slug];
	if (!icon) {
		const fallbackMap: Record<string, string> = {
			siLinkedin: "linkedin",
			siGoogle: "globe",
			siGithub: "github",
			siX: "twitter",
		};
		const fallbackName = fallbackMap[slug];
		if (fallbackName) {
			return (
				<Icon
					name={fallbackName}
					className={cn(className, "text-text-sub-600")}
				/>
			);
		}
		return null;
	}

	const monochromeSlugs = [
		"siGithub",
		"siX",
		"siMedium",
		"siSlack",
		"siLinkedin",
	];
	const isMonochrome = monochromeSlugs.includes(slug);

	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			className={cn(className, isMonochrome ? "text-text-sub-600" : "")}
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			style={!isMonochrome ? { color: `#${icon.hex}` } : undefined}
		>
			<path d={icon.path} />
		</svg>
	);
};

export const CreateOrgStep = () => {
	const { mutate } = useSWRConfig();
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [name, setName] = useQueryState("name", parseAsString.withDefault(""));
	const [orgId, setOrgId] = useQueryState(
		"orgId",
		parseAsString.withDefault(""),
	);
	const [logoPreview, setLogoPreview] = useQueryState(
		"logoPreview",
		parseAsString.withDefault(""),
	);
	const [logoUrl, setLogoUrl] = useQueryState(
		"logoUrl",
		parseAsString.withDefault(""),
	);
	const [isUploading, setIsUploading] = useState(false);
	const [referral, setReferral] = useQueryState(
		"referral",
		parseAsString.withDefault(""),
	);
	const [otherReferral, setOtherReferral] = useQueryState(
		"otherReferral",
		parseAsString.withDefault(""),
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isOpen, setIsOpen] = useState(false);
	const [hoverId, setHoverId] = useState<string | undefined>(undefined);
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const [searchQuery, setSearchQuery] = useState("");

	const referralOptions = [
		{ id: "google", label: "Google Search", iconSlug: "siGoogle" },
		{ id: "github", label: "GitHub", iconSlug: "siGithub" },
		{ id: "twitter", label: "Twitter / X", iconSlug: "siX" },
		{ id: "linkedin", label: "LinkedIn", iconSlug: "siLinkedin" },
		{
			id: "community",
			label: "Online Community (Reddit, Slack, Discord)",
			iconSlug: "siDiscord",
		},
		{ id: "blog", label: "Blog or Article", iconSlug: "siMedium" },
		{ id: "newsletter", label: "Newsletter", iconSlug: "siSubstack" },
		{ id: "youtube", label: "YouTube or Video", iconSlug: "siYoutube" },
		{ id: "podcast", label: "Podcast", iconSlug: "siSpotify" },
		{ id: "ad", label: "Advertisement", iconSlug: "siGoogleads" },
		{ id: "other", label: "Other", iconSlug: "siSafari" },
	];

	const filteredOptions = referralOptions.filter((option) =>
		option.label.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const currentTab = hoverId
		? (buttonRefs.current[hoverId] ?? undefined)
		: undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedOption = referralOptions.find((o) => o.id === referral);
	const displayLabel =
		selectedOption?.label ||
		(referral === "social-media"
			? "Social media"
			: referral === "friend-colleague"
				? "Friend/Colleague"
				: referral === "search-engine"
					? "Search engine"
					: referral === "advertisement"
						? "Advertisement"
						: referral) ||
		"Select an option";

	const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Show preview immediately
		const previewUrl = URL.createObjectURL(file);
		setLogoPreview(previewUrl);

		// Upload to upload service
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const { data: uploadData } = await axios.post(
				"/api/upload/v1/upload",
				formData,
				{ withCredentials: true },
			);

			setLogoUrl(uploadData.url);
			toast.success("Logo uploaded successfully");
		} catch (error) {
			console.error("Upload error:", error);
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401 || error.response?.status === 403) {
					setIsUploading(false);
					return;
				}
				const errorMessage =
					error.response?.data?.message ||
					"Failed to upload file. Please try again.";
				toast.error(
					errorMessage || "Failed to upload logo. You can still continue.",
				);
			} else if (error instanceof Error) {
				if (!error.message.includes("No organization yet")) {
					toast.error(
						error.message || "Failed to upload logo. You can still continue.",
					);
				}
			}
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileUploadClick = () => {
		fileInputRef.current?.click();
	};

	const onNext = async () => {
		const logoToUse = logoUrl;

		// If orgId exists, organization is already created, just proceed to next step
		if (orgId) {
			// Organization already exists, proceed to next step
			// Note: Better Auth doesn't have an organization update endpoint by default
			// If you need to update organization details, you'll need to create a custom endpoint
			setStep(step + 1);
			return;
		}

		// Generate a random unique ID for the workspace handle/slug
		const randomSlug =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID().replace(/-/g, "").substring(0, 12)
				: Math.random().toString(36).substring(2, 14);

		// Create new organization
		const { error, data: organization } = await authClient.organization.create({
			name: name,
			keepCurrentActiveOrganization: true,
			slug: randomSlug,
			logo: logoToUse || undefined,
			metadata: { referral: referral === "other" ? otherReferral : referral },
		});
		if (error) {
			toast.error(error.message || "Failed to create organization");
			return;
		}
		if (organization) {
			// Set orgId in query state
			setOrgId(organization.id);
			try {
				await authClient.organization.setActive({
					organizationId: organization.id,
				});
			} catch (error) {
				console.error("Error setting active organization:", error);
			}
			await authClient.updateUser({ activeOrganizationId: organization.id });
			try {
				await mutate(
					(key) => Array.isArray(key) && key[0] === "organizations",
					async () => (await authClient.organization.list()).data ?? [],
					{ revalidate: false },
				);
			} catch (error) {
				console.error("Error mutating organizations:", error);
			}
		}
		setStep(step + 1);
	};

	return (
		<div>
			<div>
				<div className="flex items-center gap-4">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleLogoChange}
						className="hidden"
					/>
					<FileUpload.Root
						className={cn(
							"flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl",
							logoUrl || logoPreview
								? "border-none p-0"
								: "border border-stroke-sub-300 p-1",
							isUploading && "cursor-wait opacity-50",
							!isUploading && "cursor-pointer",
						)}
						data-has-logo={!!(logoUrl || logoPreview)}
						onClick={isUploading ? undefined : handleFileUploadClick}
					>
						{isUploading ? (
							<Spinner size={20} color="var(--text-strong-950)" />
						) : logoUrl || logoPreview ? (
							<img
								src={logoUrl || logoPreview}
								alt="Logo preview"
								className="h-full w-full rounded-xl object-cover"
							/>
						) : (
							<FileUpload.Icon
								name="image-upload"
								as={Icon}
								className="h-4 w-4"
							/>
						)}
					</FileUpload.Root>
					<div>
						<Label.Root htmlFor="email">Workspace logo</Label.Root>
						<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
							Recommended size 1:1, up to 10MB.
						</p>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xxsmall"
							type="button"
							onClick={handleFileUploadClick}
							disabled={isUploading}
						>
							{isUploading ? (
								<>
									<Spinner size={14} color="var(--text-strong-950)" />
									Uploading...
								</>
							) : (
								<>
									<Icon name="camera" className="h-4 w-4" />
									Upload Logo
								</>
							)}
						</Button.Root>
					</div>
				</div>
			</div>
			<motion.div layout className="space-y-3.5 pt-6">
				<motion.div layout className="flex flex-col gap-1">
					<Label.Root htmlFor="company-name">Company name</Label.Root>
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Input
								id="company-name"
								type="text"
								value={name}
								className="font-medium"
								onChange={(e) => {
									setName(e.target.value);
								}}
								placeholder="e.g. Acme Corp"
							/>
						</Input.Wrapper>
					</Input.Root>
				</motion.div>
				<motion.div
					layout
					className={cn(
						"flex flex-col transition-all duration-200",
						referral === "other"
							? "gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4"
							: "gap-1",
					)}
				>
					<motion.div layout className="flex flex-col gap-1">
						<Label.Root htmlFor="referral">
							How did you hear about us?
						</Label.Root>
						<Popover.Root
							open={isOpen}
							onOpenChange={(open) => {
								setIsOpen(open);
								if (!open) setSearchQuery("");
							}}
						>
							<Popover.Trigger asChild>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="small"
									className="w-full justify-between gap-1.5 rounded-xl font-medium text-sm"
								>
									<span className="flex items-center gap-2">
										{selectedOption?.iconSlug &&
											renderSimpleIcon(selectedOption.iconSlug, "h-4 w-4")}
										<span>{displayLabel}</span>
									</span>
									<Icon name="chevron-down" className="h-4 w-4 shrink-0" />
								</Button.Root>
							</Popover.Trigger>
							<Popover.Content
								align="start"
								showArrow={false}
								unstyled
								style={{ width: "var(--radix-popover-trigger-width)" }}
								className="z-50 flex flex-col rounded-2xl bg-bg-white-0 p-1.5 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
							>
								<div className="flex h-10 items-center gap-2.5 border-stroke-soft-100/80 border-b px-3 pb-1">
									<Icon name="search" className="h-4 w-4 text-text-soft-400" />
									<input
										type="text"
										placeholder="Search sources..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full bg-transparent font-medium text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
										autoFocus
									/>
								</div>
								<div className="scrollbar-hide relative flex max-h-[380px] flex-col overflow-y-auto">
									{filteredOptions.map((option) => {
										const isChecked = referral === option.id;
										return (
											<button
												key={option.id}
												ref={(el) => {
													buttonRefs.current[option.id] = el;
												}}
												type="button"
												onPointerEnter={() => setHoverId(option.id)}
												onPointerLeave={() => setHoverId(undefined)}
												onClick={() => {
													setReferral(option.id);
													setIsOpen(false);
												}}
												className={cn(
													"relative z-10 flex h-12 w-full cursor-pointer items-center justify-between gap-3.5 rounded-lg px-3.5 font-medium text-sm transition-colors",
													"text-text-strong-950",
													isChecked && "bg-neutral-alpha-10",
												)}
											>
												<span className="flex items-center gap-3.5 text-left">
													{option.iconSlug &&
														renderSimpleIcon(option.iconSlug, "h-5 w-5")}
													<span>{option.label}</span>
												</span>
												{isChecked && (
													<Icon
														name="check"
														className="h-4 w-4 shrink-0 text-text-strong-950"
													/>
												)}
											</button>
										);
									})}
									{filteredOptions.length === 0 && (
										<div className="flex flex-col items-center justify-center px-4 py-6 text-center">
											<Icon
												name="search"
												className="mb-1.5 h-6 w-6 text-text-soft-400"
											/>
											<p className="font-medium text-text-soft-400 text-xs">
												No results found
											</p>
										</div>
									)}
									{filteredOptions.length > 0 && (
										<AnimatedHoverBackground
											rect={currentRect}
											tabElement={currentTab}
										/>
									)}
								</div>
							</Popover.Content>
						</Popover.Root>
					</motion.div>
					<AnimatePresence initial={false}>
						{referral === "other" && (
							<motion.div
								layout
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
								className="flex flex-col gap-1 overflow-hidden"
							>
								<Label.Root htmlFor="other-referral">Please specify</Label.Root>
								<Input.Root size="small" className="rounded-xl bg-bg-white-0">
									<Input.Wrapper>
										<Input.Input
											id="other-referral"
											type="text"
											value={otherReferral}
											className="font-medium"
											onChange={(e) => {
												setOtherReferral(e.target.value);
											}}
											placeholder="e.g. Product Hunt, Reddit, etc."
										/>
									</Input.Wrapper>
								</Input.Root>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</motion.div>

			<Button.Root
				variant="neutral"
				className="mt-6 w-full"
				mode="filled"
				onClick={onNext}
				disabled={
					!name || isUploading || (referral === "other" && !otherReferral)
				}
			>
				{orgId ? "Update workspace" : "Create workspace"}
			</Button.Root>
		</div>
	);
};
