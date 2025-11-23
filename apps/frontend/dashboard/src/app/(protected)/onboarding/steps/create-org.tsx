"use client";

import * as Button from "@reloop/ui/button";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { parseAsInteger, useQueryState } from "nuqs";
import type React from "react";

interface CreateOrgStepProps {
	data: {
		name: string;
		slug: string;
		logo: File | null;
		logoPreview: string | null;
		country: string;
		referral: string;
	};
	updateData: (newData: Partial<CreateOrgStepProps["data"]>) => void;
}

export const CreateOrgStep = ({ data, updateData }: CreateOrgStepProps) => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));

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

	const onNext = () => {
		setStep(step + 1);
		updateData({
			name: data.name,
			slug: data.slug.toLowerCase().replace(/\s+/g, "-"),
		});
	};

	return (
		<div className="fade-in animate-in duration-500">
			<div>
				<div className="flex items-center gap-4">
					<FileUpload.Root className="h-20 w-20">
						<FileUpload.Icon
							name="image-upload"
							as={Icon}
							className="h-6 w-6"
						/>
					</FileUpload.Root>
					<div>
						<Label.Root htmlFor="email">Workspace logo</Label.Root>
						<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
							Recommended size 1:1, up to 10MB.
						</p>
						<Button.Root variant="neutral" mode="stroke" size="xxsmall">
							<Icon name="camera" className="h-4 w-4" />
							Upload Logo
						</Button.Root>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-1 pt-6">
				<Label.Root htmlFor="company-name">Company name</Label.Root>
				<Input.Root size="small">
					<Input.Wrapper>
						<Input.Input
							id="company-name"
							type="text"
							value={data.name}
							className="font-semibold"
							onChange={(e) =>
								updateData({
									name: e.target.value,
									slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
								})
							}
							placeholder="e.g. Acme Corp"
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="flex flex-col gap-1 pt-3 pb-6">
				<Label.Root htmlFor="workspace-handle">Workspace handle</Label.Root>
				<Input.Root size="small">
					<Input.Wrapper className="gap-0">
						<Input.InlineAffix className="m">
							reloop.sh/dashboard/
						</Input.InlineAffix>
						<Input.Input
							id="workspace-handle"
							type="text"
							className="font-semibold"
							value={data.slug}
							onChange={(e) =>
								updateData({
									slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
								})
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<Button.Root
				variant="neutral"
				className="w-full"
				mode="filled"
				onClick={onNext}
			>
				Create workspace
			</Button.Root>
		</div>
	);
};
