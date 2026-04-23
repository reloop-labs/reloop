"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { mutate } from "swr";
import * as v from "valibot";
import { WorkspaceDangerZone } from "./components/workspace-danger-zone";
import { WorkspaceHeader } from "./components/workspace-header";
import { WorkspaceLogoUpload } from "./components/workspace-logo-upload";
import { WorkspaceSlugInput } from "./components/workspace-slug-input";

const workspaceSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name is required")),
	slug: v.pipe(
		v.string(),
		v.minLength(2, "Slug must be at least 2 characters"),
	),
	logo: v.string(),
});

type WorkspaceFormValues = v.InferOutput<typeof workspaceSchema>;

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

const SettingsPage = () => {
	const { activeOrganization, mutateOrganizations } = useUserOrganization();
	const [isSaving, setIsSaving] = useState(false);
	const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<WorkspaceFormValues>({
		resolver: valibotResolver(workspaceSchema),
		defaultValues: {
			name: activeOrganization.name,
			slug: activeOrganization.slug,
			logo: activeOrganization.logo || "",
		},
	});

	const nameValue = watch("name");
	const slugValue = watch("slug");
	const logoValue = watch("logo");

	// Check if there are any changes (isDirty from RHF is usually enough, but we want to be explicit relative to activeOrganization if needed)
	const hasChanges =
		nameValue !== activeOrganization.name ||
		slugValue !== activeOrganization.slug ||
		logoValue !== (activeOrganization.logo || "");

	const handleSaveChanges = async (data: WorkspaceFormValues) => {
		if (slugStatus === "taken") {
			toast.error("Please choose a different slug");
			return;
		}
		if (slugStatus === "checking") {
			toast.error("Please wait for slug validation to complete");
			return;
		}
		setIsSaving(true);
		try {
			const normalizedSlug = data.slug.toLowerCase().replace(/\s+/g, "-");
			const { error } = await authClient.organization.update({
				organizationId: activeOrganization.id,
				data: {
					name: data.name,
					slug: normalizedSlug,
					logo: data.logo || undefined,
				},
			});

			if (error) {
				toast.error(error.message || "Failed to update workspace");
				return;
			}
			await mutate("organizations");
			mutateOrganizations();
			toast.success("Workspace updated successfully");
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Failed to update workspace");
		} finally {
			setIsSaving(false);
		}
	};

	useHotkeys(
		"mod+enter",
		() => {
			if (
				hasChanges &&
				slugStatus !== "taken" &&
				slugStatus !== "checking" &&
				!isSaving
			) {
				handleSubmit(handleSaveChanges)();
			}
		},
		{
			enableOnFormTags: true,
		},
	);

	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<WorkspaceHeader />
				<form
					onSubmit={handleSubmit(handleSaveChanges)}
					className="w-full space-y-5"
				>
					<WorkspaceLogoUpload
						initialLogoUrl={activeOrganization.logo || ""}
						onLogoChange={(url) => setValue("logo", url, { shouldDirty: true })}
					/>
					<div className="grid grid-cols-1 gap-3">
						<div>
							<Label.Root htmlFor="name">Workspace Name</Label.Root>
							<Input.Root
								className="mt-1 w-full"
								size="small"
								hasError={!!errors.name}
							>
								<Input.Wrapper className="w-full">
									<Input.Input
										id="name"
										type="text"
										placeholder="Organization Name"
										{...register("name")}
									/>
								</Input.Wrapper>
							</Input.Root>
							{errors.name ? (
								<p className="mt-1 text-paragraph-xs text-red-500">
									{errors.name.message}
								</p>
							) : (
								<p className="mt-1 font-medium text-paragraph-xs text-text-sub-600">
									This is the display name show accross you workspace
								</p>
							)}
						</div>
						<WorkspaceSlugInput
							initialSlug={activeOrganization.slug}
							currentOrgSlug={activeOrganization.slug}
							onSlugChange={(newSlug, status) => {
								setValue("slug", newSlug, { shouldDirty: true });
								setSlugStatus(status);
							}}
						/>
					</div>
					<div className="flex justify-end">
						<Button.Root
							variant="neutral"
							size="xsmall"
							type="submit"
							className="w-40"
							disabled={
								!hasChanges ||
								slugStatus === "taken" ||
								slugStatus === "checking" ||
								isSaving
							}
						>
							{isSaving ? (
								<Spinner size={14} color="var(--text-strong-950)" />
							) : (
								<>
									Save Changes
									<span className="inline-flex items-center gap-0.5">
										<Icon
											name="command"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
										<Icon
											name="enter"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
									</span>
								</>
							)}
						</Button.Root>
					</div>
					<WorkspaceDangerZone />
				</form>
			</div>
		</div>
	);
};

export default SettingsPage;
