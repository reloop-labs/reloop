"use client";

import { useOrgStore } from "@dashboard/store/use-org-store";
import * as Button from "@reloop/ui/components/button";
import * as FileUpload from "@reloop/ui/components/file-upload";
import { Icon } from "@reloop/ui/components/icon";
import * as Input from "@reloop/ui/components/input";
import * as Label from "@reloop/ui/components/label";
import * as Modal from "@reloop/ui/components/modal";
import { useState } from "react";

export const CreateOrganizationModal = () => {
	const { open, setState } = useOrgStore();
	const [organizationName, setOrganizationName] = useState("");

	return (
		<Modal.Root open={open} onOpenChange={setState}>
			<Modal.Content className="max-w-[440px]">
				<Modal.Body className="flex w-full items-start gap-4">
					<div className="w-full space-y-5">
						<div className="font-medium text-label-md text-text-strong-950">
							Create Organization
						</div>
						<div>
							<Label.Root htmlFor="email" className="mb-1">
								Logo
							</Label.Root>
							<div className="flex items-center gap-4">
								<FileUpload.Root className="h-20 w-20">
									<FileUpload.Icon
										name="image-upload"
										as={Icon}
										className="h-6 w-6"
									/>
								</FileUpload.Root>
								<div>
									<Button.Root
										variant="neutral"
										mode="stroke"
										size="xxsmall"
										className="px-5"
									>
										Upload
									</Button.Root>
									<p className="ml-0.5 text-paragraph-sm text-text-sub-600">
										Recommended size 1:1, up to 10MB.
									</p>
								</div>
							</div>
						</div>
						<div>
							<Label.Root htmlFor="email">
								Name
								<Label.Asterisk />
							</Label.Root>
							<Input.Root className="w-full">
								<Input.Wrapper className="w-full">
									<Input.Input
										type="text"
										placeholder="Placeholder text..."
										value={organizationName}
										onChange={(e) => setOrganizationName(e.target.value.trim())}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex justify-end">
					<Modal.Close asChild>
						<Button.Root variant="neutral" mode="stroke">
							Cancel
						</Button.Root>
					</Modal.Close>
					<Button.Root variant="neutral">Create</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
