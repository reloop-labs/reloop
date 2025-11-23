"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import * as Textarea from "@reloop/ui/textarea";
import { Upload } from "lucide-react";
import type React from "react";

interface CreateOrgStepProps {
	data: {
		name: string;
		url: string;
		logo: File | null;
		logoPreview: string | null;
		country: string;
		referral: string;
	};
	updateData: (newData: Partial<CreateOrgStepProps["data"]>) => void;
}

export const CreateOrgStep = ({ data, updateData }: CreateOrgStepProps) => {
	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				updateData({ logo: file, logoPreview: reader.result as string });
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="fade-in animate-in space-y-8 duration-500">
			{/* Logo Section */}
			<div>
				<label
					htmlFor="logo-upload"
					className="mb-3 block font-semibold text-sm text-text-strong-950"
				>
					Company logo
				</label>
				<div className="flex items-start gap-6">
					<div
						className={`flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-bg-weak-50 ${data.logoPreview ? "border-stroke-soft-200" : "border-stroke-sub-300 border-dashed"}`}
					>
						{data.logoPreview ? (
							<img
								src={data.logoPreview}
								alt="Preview"
								className="h-full w-full object-cover"
							/>
						) : (
							<span className="px-2 text-center font-medium text-text-soft-400 text-xs">
								No image
							</span>
						)}
					</div>
					<div className="flex flex-col gap-2 pt-1">
						<div className="flex items-center gap-3">
							<label htmlFor="logo-upload" className="cursor-pointer">
								<Button.Root variant="neutral" mode="stroke" asChild>
									<div className="flex items-center gap-2">
										<Upload size={16} />
										<span>Replace image</span>
									</div>
								</Button.Root>
								<input
									id="logo-upload"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleLogoChange}
								/>
							</label>
							{data.logoPreview && (
								<Button.Root
									variant="error"
									mode="ghost"
									onClick={() => updateData({ logo: null, logoPreview: null })}
								>
									Remove
								</Button.Root>
							)}
						</div>
						<p className="mt-1 text-text-sub-600 text-xs">
							*.png, *.jpeg files up to 10MB at least 400px by 400px
						</p>
					</div>
				</div>
			</div>

			{/* Form Fields */}
			<div className="space-y-5">
				<div>
					<label
						htmlFor="company-name"
						className="mb-1.5 block font-semibold text-sm text-text-strong-950"
					>
						Company Name
					</label>
					<Input.Root>
						<Input.Wrapper>
							<Input.Input
								id="company-name"
								type="text"
								value={data.name}
								onChange={(e) =>
									updateData({
										name: e.target.value,
										url: e.target.value.toLowerCase().replace(/\s+/g, "-"),
									})
								}
								placeholder="e.g. Acme Corp"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<div>
					<label
						htmlFor="workspace-handle"
						className="mb-1.5 block font-semibold text-sm text-text-strong-950"
					>
						Workspace handle
					</label>
					<div className="flex">
						<span className="inline-flex items-center rounded-l-10 border border-stroke-soft-200 border-r-0 bg-bg-weak-50 px-4 font-medium text-sm text-text-sub-600">
							app.mailinfra.com/
						</span>
						<Input.Root className="rounded-l-none">
							<Input.Wrapper>
								<Input.Input
									id="workspace-handle"
									type="text"
									value={data.url}
									onChange={(e) => updateData({ url: e.target.value })}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>

				<div>
					<label
						htmlFor="billing-country"
						className="mb-1.5 block font-semibold text-sm text-text-strong-950"
					>
						Billing Country
					</label>
					<Select.Root
						value={data.country}
						onValueChange={(value: string) => updateData({ country: value })}
					>
						<Select.Trigger id="billing-country">
							<Select.Value placeholder="Select country" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="US">United States of America</Select.Item>
							<Select.Item value="UK">United Kingdom</Select.Item>
							<Select.Item value="CA">Canada</Select.Item>
							<Select.Item value="EU">European Union</Select.Item>
							<Select.Item value="IN">India</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<label
						htmlFor="referral"
						className="mb-1.5 block font-semibold text-sm text-text-strong-950"
					>
						How did you hear about us?
					</label>
					<Textarea.Root
						id="referral"
						rows={3}
						placeholder="Share how you heard about MailInfra..."
						simple
						value={data.referral}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							updateData({ referral: e.target.value })
						}
					/>
				</div>
			</div>
		</div>
	);
};
