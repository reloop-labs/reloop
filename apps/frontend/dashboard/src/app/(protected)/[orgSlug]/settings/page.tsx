"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useState } from "react";

const SettingsPage = () => {
	const { activeOrganization } = useUserOrganization();
	const [organizationName, setOrganizationName] = useState(
		activeOrganization.name,
	);
	const [slug, setSlug] = useState(activeOrganization.slug);

	return (
		<div>
			<div className="mb-5 border-stroke-soft-100 border-b p-5 pb-7">
				<div className="flex items-center gap-2">
					<Icon name="gear" className="h-5 w-5" />
					<p className="font-medium text-2xl text-text-strong-950">General</p>
				</div>
				<p className="text-paragraph-sm text-text-sub-600">
					General Change the settings for your current workspace
				</p>
			</div>
			<div className="w-full space-y-5 pt-5">
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
							<Button.Root variant="neutral" size="xxsmall">
								<Icon name="camera" className="h-4 w-4" />
								Upload Logo
							</Button.Root>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-3">
					<div>
						<Label.Root htmlFor="email">Name</Label.Root>
						<Input.Root className="mt-1 w-full">
							<Input.Wrapper className="w-full">
								<Input.Input
									type="text"
									placeholder="Organization Name"
									value={organizationName}
									onChange={(e) => setOrganizationName(e.target.value.trim())}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					<div>
						<Label.Root htmlFor="slug">Slug</Label.Root>
						<Input.Root className="mt-1 w-full">
							<Input.Wrapper>
								<Input.Input
									id="slug"
									type="text"
									placeholder="Organization Slug"
									value={slug}
									onChange={(e) => setSlug(e.target.value.trim())}
								/>
								<button
									type="button"
									className="flex items-center justify-center"
								>
									<Icon
										name="clipboard-copy"
										className="size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
									/>
								</button>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
				<div className="flex justify-end">
					<Button.Root variant="neutral" size="xxsmall">
						Save Changes
					</Button.Root>
				</div>
				<p className="font-medium text-label-md text-text-strong-950">
					Danger zone
				</p>
				<div className="rounded-xl border border-error-light py-2 pr-2.5 pl-3">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-label-sm text-text-strong-950">
								Delete workspace
							</p>
							<p className="text-paragraph-xs text-text-sub-600">
								Delete your workspace and all of its data. This action is
								irreversible.
							</p>
						</div>
						<Button.Root variant="error" size="xsmall">
							<Icon name="trash" className="size-3 text-white" />
							Delete workspace
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
