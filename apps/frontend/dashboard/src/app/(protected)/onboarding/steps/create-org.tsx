"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const CreateOrgStep = () => {
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
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const referralOptions = [
		{ id: "social-media", label: "Social media" },
		{ id: "friend-colleague", label: "Friend/Colleague" },
		{ id: "search-engine", label: "Search engine" },
		{ id: "advertisement", label: "Advertisement" },
		{ id: "other", label: "Other" },
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const displayLabel =
		referralOptions.find((o) => o.id === referral)?.label || "Select an option";

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
			logo: logoToUse,
			metadata: { referral: referral === "other" ? otherReferral : referral },
		});
		if (error) {
			toast.error(error.message || "Failed to create organization");
			return;
		}
		if (organization) {
			// Set orgId in query state
			setOrgId(organization.id);
			await authClient.updateUser({ activeOrganizationId: organization.id });
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
						<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
							<Dropdown.Trigger asChild>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="small"
									className="w-full justify-between gap-1.5 rounded-xl font-medium text-sm"
								>
									<span>{displayLabel}</span>
									<Icon name="chevron-down" className="h-4 w-4 shrink-0" />
								</Button.Root>
							</Dropdown.Trigger>
							<Dropdown.Content
								align="start"
								style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
								className="p-2"
							>
								<div className="relative flex flex-col">
									{referralOptions.map((option, idx) => {
										const isChecked = referral === option.id;
										return (
											<button
												key={option.id}
												ref={(el) => {
													if (el) buttonRefs.current[idx] = el;
												}}
												type="button"
												onPointerEnter={() => setHoverIdx(idx)}
												onPointerLeave={() => setHoverIdx(undefined)}
												onClick={() => {
													setReferral(option.id);
													setIsOpen(false);
												}}
												className={cn(
													"flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 font-medium text-sm transition-colors",
													"text-text-strong-950",
													isChecked && "bg-neutral-alpha-10",
												)}
											>
												<span>{option.label}</span>
												{isChecked && (
													<Icon
														name="check"
														className="h-4 w-4 text-text-strong-950"
													/>
												)}
											</button>
										);
									})}
									<AnimatedHoverBackground
										rect={currentRect}
										tabElement={currentTab}
									/>
								</div>
							</Dropdown.Content>
						</Dropdown.Root>
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
