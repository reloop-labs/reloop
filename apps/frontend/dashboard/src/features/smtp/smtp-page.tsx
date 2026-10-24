import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useCallback, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { DeleteProviderModal } from "./own-smtp/delete-provider-modal";
import { ProviderFormModal } from "./own-smtp/provider-form-modal";
import {
	type SmtpProvider,
	useSmtpProviders,
} from "./own-smtp/use-smtp-providers";
import { SMTP_DOCS_URL, SmtpCodeDrawer } from "./smtp-code-drawer";
import { DEFAULT_SMTP_HOST } from "./smtp-code-examples";
import { ReloopSmtpSection } from "./smtp-servers/reloop-smtp-panel";
import { SmtpServersTable } from "./smtp-servers/smtp-servers-table";

const openDocs = () => window.open(SMTP_DOCS_URL, "_blank");

const darkKbd =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-black/25 dark:bg-black/10 dark:text-black dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)]";

/**
 * One table for every way to send over SMTP: Reloop's built-in relay
 * (always first, so users know we provide SMTP) plus their own servers.
 */
export function SmtpPage({
	smtpHost = DEFAULT_SMTP_HOST,
}: {
	smtpHost?: string;
}) {
	const router = useRouter();
	const { isOrgAdmin } = useOrgPermissions();
	const { data: usage } = useBillingUsage();
	const providersQuery = useSmtpProviders();
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	const [providerId, setProviderId] = useQueryState("id", {
		history: "replace",
	});

	const providers = providersQuery.data?.items ?? [];

	// Derive the targeted provider from the URL so a reload reopens the modal.
	// Keep the last match so the delete modal stays populated if the provider
	// drops out of the list before the modal finishes closing.
	const lastProviderRef = useRef<SmtpProvider | null>(null);
	const matchedProvider = providers.find((p) => p.id === providerId) ?? null;
	if (matchedProvider) lastProviderRef.current = matchedProvider;
	const targetProvider =
		matchedProvider ??
		(providerId && lastProviderRef.current?.id === providerId
			? lastProviderRef.current
			: null);
	const editing = modal === "edit-provider" ? targetProvider : null;
	const deleting = modal === "delete-provider" ? targetProvider : null;

	const openProviderModal = useCallback(
		(name: "edit-provider" | "delete-provider", provider: SmtpProvider) => {
			void setModal(name);
			void setProviderId(provider.id);
		},
		[setModal, setProviderId],
	);
	const closeProviderModal = useCallback(() => {
		void setModal(null);
		void setProviderId(null);
	}, [setModal, setProviderId]);
	const limit = providersQuery.data?.limit;
	const entitled = limit === null || (limit ?? 0) > 0;
	const atLimit = typeof limit === "number" && providers.length >= limit;
	const canAdd = isOrgAdmin && entitled && !atLimit;

	const openAdd = useCallback(() => {
		if (canAdd) router.push("/smtp/add");
	}, [canAdd, router]);
	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			openDocs();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);
	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			openAdd();
		},
		{ enableOnFormTags: false, preventDefault: true },
		[canAdd],
	);

	const actions = useMemo<CommandAction[]>(
		() => [
			...(canAdd
				? [
						{
							id: "add-smtp-server",
							label: "Connect to SMTP Server",
							icon: "plus",
							shortcut: { label: "C", keys: ["c"] },
							onSelect: openAdd,
						},
					]
				: []),
			{
				id: "smtp-code",
				label: "Open SMTP code samples",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "smtp" },
						}),
					),
			},
			{
				id: "smtp-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: openDocs,
			},
		],
		[canAdd, openAdd],
	);
	useRegisterCommandActions("smtp", "SMTP", actions);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2 pb-4 sm:flex-nowrap sm:items-start">
				<div>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						SMTP
					</h1>
				</div>

				<div className="ml-auto flex shrink-0 items-center gap-2">
					<SmtpCodeDrawer
						smtpHost={smtpHost}
						renderTrigger={({ open }) => (
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={open}
								className="gap-1.5 rounded-xl max-sm:hidden"
								aria-keyshortcuts="s"
							>
								<Icon name="code" className="h-4 w-4 text-text-sub-600" />
								Code
								<ActionKbd>S</ActionKbd>
							</Button.Root>
						)}
					/>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={openDocs}
						className="gap-1.5 rounded-xl max-sm:hidden"
						aria-keyshortcuts="d"
					>
						Documentation
						<ActionKbd>D</ActionKbd>
					</Button.Root>
				</div>
			</div>

			<ReloopSmtpSection smtpHost={smtpHost} />

			<section className="space-y-4 pt-4 pb-8">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
							Bring your own SMTP
						</h2>
						<p className="mt-1 max-w-2xl text-text-sub-600 text-xs leading-relaxed">
							Already use SendGrid, Postmark, Microsoft 365 or your own server?
							Send through it and keep templates, tracking, logs and webhooks in
							Reloop. No DNS setup.
						</p>
					</div>
					{isOrgAdmin && entitled ? (
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="small"
							onClick={openAdd}
							disabled={atLimit}
							title={
								atLimit
									? `Your plan includes ${limit} SMTP server${limit === 1 ? "" : "s"}`
									: undefined
							}
							className="gap-1.5 rounded-xl"
							aria-keyshortcuts="c"
						>
							<Icon name="plus" className="h-4 w-4" />
							Connect to SMTP Server
							<ActionKbd className={darkKbd}>C</ActionKbd>
						</FancyButton.Root>
					) : null}
				</div>

				{providersQuery.error ? (
					<p className="mb-3 text-error-base text-paragraph-xs">
						Couldn't load your SMTP servers.{" "}
						<button
							type="button"
							onClick={() => void providersQuery.refetch()}
							className="underline"
						>
							Retry
						</button>
					</p>
				) : null}

				<SmtpServersTable
					providers={providers}
					isLoading={providersQuery.isPending}
					entitled={entitled}
					canManage={Boolean(isOrgAdmin)}
					onAdd={openAdd}
					onEdit={(provider) => openProviderModal("edit-provider", provider)}
					onDelete={(provider) =>
						openProviderModal("delete-provider", provider)
					}
				/>

				{providers.length > 0 ? (
					<p className="text-[12px] text-text-soft-400 leading-relaxed">
						Mail from your own servers still gets Reloop's checks, templates,
						tracking, logs and webhooks. “Delivered” means your server accepted
						the message; later bounces go to your provider.
					</p>
				) : null}
			</section>

			<ProviderFormModal
				open={!!editing}
				provider={editing}
				selfHosted={usage?.selfHosted === true}
				onClose={closeProviderModal}
			/>
			<DeleteProviderModal provider={deleting} onClose={closeProviderModal} />
		</div>
	);
}
