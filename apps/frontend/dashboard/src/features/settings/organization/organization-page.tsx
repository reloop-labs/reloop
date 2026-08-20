import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import {
	ORGANIZATION_NAME_MAX_LENGTH,
	organizationNameMaxLengthMessage,
} from "@reloop/auth/organization-limits";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import {
	type Organization,
	useActiveOrganization,
} from "#/features/dashboard/page-header/use-active-organization";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { queryKeys } from "#/lib/query-keys";
import { OrganizationDangerZone } from "./organization-danger-zone";
import { OrganizationHeader } from "./organization-header";
import { OrganizationLogoUpload } from "./organization-logo-upload";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const organizationSchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(1, "Name is required"),
		v.maxLength(
			ORGANIZATION_NAME_MAX_LENGTH,
			organizationNameMaxLengthMessage(),
		),
	),
	logo: v.string(),
});

type OrganizationFormValues = v.InferOutput<typeof organizationSchema>;

function SettingsSkeleton() {
	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<Skeleton className="mb-1 h-5 w-24" />
					<Skeleton className="h-4 w-52" />
				</div>

				<div className="w-full space-y-5">
					<div className="flex items-center gap-4">
						<Skeleton className="h-[72px] w-[72px] flex-shrink-0 rounded-xl" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-3.5 w-44" />
							<Skeleton className="h-7 w-24 rounded-lg" />
						</div>
					</div>

					<div>
						<Skeleton className="mb-1 h-4 w-28" />
						<Skeleton className="h-9 w-full rounded-lg" />
						<Skeleton className="mt-1 h-3.5 w-64" />
					</div>

					<div className="flex justify-end">
						<Skeleton className="h-8 w-40 rounded-lg" />
					</div>

					<div>
						<Skeleton className="mb-3 h-5 w-24" />
						<div className="rounded-xl border border-error-light py-2 pr-2.5 pl-3">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-72" />
								</div>
								<Skeleton className="h-8 w-36 rounded-lg" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function OrganizationForm({
	activeOrganization,
}: {
	activeOrganization: Organization;
}) {
	const queryClient = useQueryClient();
	const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<OrganizationFormValues>({
		resolver: valibotResolver(organizationSchema),
		values: {
			name: activeOrganization.name,
			logo: activeOrganization.logo || "",
		},
	});

	const nameValue = watch("name");
	const logoValue = watch("logo");

	const hasChanges =
		nameValue !== activeOrganization.name ||
		logoValue !== (activeOrganization.logo || "");

	const handleSaveChanges = async (data: OrganizationFormValues) => {
		setStatus("saving");
		try {
			const { error } = await authClient.organization.update({
				organizationId: activeOrganization.id,
				data: {
					name: data.name,
					logo: data.logo || undefined,
				},
			});

			if (error) {
				toast.error(error.message || "Failed to update organization");
				setStatus("idle");
				return;
			}
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.organizations(),
			});
			setStatus("success");
			setTimeout(() => {
				setStatus("idle");
			}, 1500);
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Failed to update organization");
			setStatus("idle");
		}
	};

	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<OrganizationHeader />
				<form
					onSubmit={handleSubmit(handleSaveChanges)}
					className="w-full space-y-5"
				>
					<OrganizationLogoUpload
						organizationId={activeOrganization.id}
						initialLogoUrl={activeOrganization.logo || ""}
						onLogoChange={(url) => setValue("logo", url, { shouldDirty: true })}
					/>
					<div>
						<Label.Root htmlFor="name">Organization Name</Label.Root>
						<Input.Root
							className="mt-1 w-full"
							size="medium"
							hasError={!!errors.name}
						>
							<Input.Wrapper className="w-full">
								<Input.Input
									id="name"
									type="text"
									placeholder="Organization Name"
									maxLength={ORGANIZATION_NAME_MAX_LENGTH}
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
								This is the display name shown across your organization
							</p>
						)}
					</div>
					<div className="flex justify-end">
						<FancyButton.Root
							variant={status === "success" ? "success" : "blue"}
							size="small"
							type="submit"
							className={cn(
								"min-w-[140px] justify-center overflow-hidden transition-all duration-200",
								status === "saving" && "opacity-90",
							)}
							disabled={!hasChanges || status === "saving"}
						>
							<AnimatePresence mode="popLayout" initial={false}>
								<motion.span
									key={status}
									transition={{
										type: "spring",
										duration: 0.25,
										bounce: 0,
									}}
									initial={{ opacity: 0, y: -14 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 14 }}
									className="flex items-center justify-center gap-1.5 font-medium text-xs"
								>
									{status === "saving" ? (
										<>
											<Spinner size={12} color="var(--static-white)" />
											<span>Saving...</span>
										</>
									) : status === "success" ? (
										<>
											<Icon name="check-circle" className="h-3.5 w-3.5" />
											<span>Updated</span>
										</>
									) : (
										<>
											<span>Save Changes</span>
											<ActionKbd className={actionKbdOnBlueClassName}>
												↵
											</ActionKbd>
										</>
									)}
								</motion.span>
							</AnimatePresence>
						</FancyButton.Root>
					</div>
					<OrganizationDangerZone />
				</form>
			</div>
		</div>
	);
}

export function OrganizationPage() {
	const router = useRouter();
	const { activeOrganization, isPending, hasInitialized } =
		useActiveOrganization();
	const { canManageWorkspace, isPending: rolePending } = useOrgPermissions();

	useEffect(() => {
		if (!rolePending && !canManageWorkspace) {
			router.push(SETTINGS_MEMBER_HOME);
		}
	}, [canManageWorkspace, rolePending, router]);

	if (rolePending || !canManageWorkspace) {
		return null;
	}

	if (isPending || !hasInitialized || !activeOrganization) {
		return <SettingsSkeleton />;
	}

	return <OrganizationForm activeOrganization={activeOrganization} />;
}
