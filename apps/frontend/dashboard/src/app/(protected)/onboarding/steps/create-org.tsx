"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useRef } from "react";

export const CreateOrgStep = () => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [name, setName] = useQueryState("name", parseAsString.withDefault(""));
	const [slug, setSlug] = useQueryState("slug", parseAsString.withDefault(""));
	const [logoPreview, setLogoPreview] = useQueryState(
		"logoPreview",
		parseAsString.withDefault(""),
	);
	const [referral, setReferral] = useQueryState(
		"referral",
		parseAsString.withDefault(""),
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file size (10MB)
			if (file.size > 10 * 1024 * 1024) {
				alert("File size must be less than 10MB");
				return;
			}
			// Validate file type (images only)
			if (!file.type.startsWith("image/")) {
				alert("Please select an image file");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleFileUploadClick = () => {
		fileInputRef.current?.click();
	};

	const onNext = () => {
		const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
		setSlug(normalizedSlug);
		setStep(step + 1);
	};

	return (
		<div className="fade-in animate-in duration-500">
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
							"flex h-[72px] w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-xl",
							logoPreview
								? "border border-stroke-sub-300 border-solid p-0"
								: "border border-stroke-sub-300 p-1",
						)}
						data-has-logo={!!logoPreview}
						onClick={handleFileUploadClick}
					>
						{logoPreview ? (
							<img
								src={logoPreview}
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
						>
							<Icon name="camera" className="h-4 w-4" />
							Upload Logo
						</Button.Root>
					</div>
				</div>
			</div>
			<div className="space-y-3.5 pt-6">
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="company-name">Company name</Label.Root>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								id="company-name"
								type="text"
								value={name}
								className="font-medium"
								onChange={(e) => {
									const newName = e.target.value;
									setName(newName);
									setSlug(newName.toLowerCase().replace(/\s+/g, "-"));
								}}
								placeholder="e.g. Acme Corp"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="workspace-handle">Workspace handle</Label.Root>
					<Input.Root size="small">
						<Input.Wrapper className="gap-0">
							<Input.InlineAffix className="m">
								reloop.sh/dashboard/
							</Input.InlineAffix>
							<Input.Input
								id="workspace-handle"
								type="text"
								className="font-medium"
								value={slug}
								onChange={(e) =>
									setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
								}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="referral">How did you hear about us?</Label.Root>
					<Select.Root
						size="small"
						value={referral}
						onValueChange={setReferral}
					>
						<Select.Trigger className="font-medium text-sm">
							<Select.Value placeholder="Select an option" />
						</Select.Trigger>
						<Select.Content className="w-[524px]">
							<Select.Item value="social-media" className="h-9 text-sm">
								Social media
							</Select.Item>
							<Select.Item value="friend-colleague" className="h-9 p-2 text-sm">
								Friend/Colleague
							</Select.Item>
							<Select.Item value="search-engine" className="h-9 p-2 text-sm">
								Search engine
							</Select.Item>
							<Select.Item value="advertisement" className="h-9 p-2 text-sm">
								Advertisement
							</Select.Item>
							<Select.Item value="other" className="h-9 p-2 text-sm">
								Other
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<Button.Root
				variant="neutral"
				className="mt-6 w-full"
				mode="filled"
				onClick={onNext}
			>
				Create workspace
			</Button.Root>
		</div>
	);
};
