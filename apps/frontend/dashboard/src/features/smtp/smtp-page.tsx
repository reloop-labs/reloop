import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useCallback, useMemo, useState } from "react";
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
import { DEFAULT_SMTP_HOST } from "./smtp-code-examples";
import { SmtpServersTable } from "./smtp-servers/smtp-servers-table";

const DOCS_URL = "https://reloop.sh/docs/examples/smtp/introduction";
const openDocs = () => window.open(DOCS_URL, "_blank");

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
	const { isOrgAdmin } = useOrgPermissions();
	const { data: usage } = useBillingUsage();
	const providersQuery = useSmtpProviders();
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<SmtpProvider | null>(null);
	const [deleting, setDeleting] = useState<SmtpProvider | null>(null);

	const providers = providersQuery.data?.items ?? [];
	const limit = providersQuery.data?.limit;
	const entitled = limit === null || (limit ?? 0) > 0;
	const atLimit = typeof limit === "number" && providers.length >= limit;
	const canAdd = isOrgAdmin && entitled && !atLimit;

	const openAdd = useCallback(() => {
		if (!canAdd) return;
		setEditing(null);
		setFormOpen(true);
	}, [canAdd]);
	const openEdit = (provider: SmtpProvider) => {
		setEditing(provider);
		setFormOpen(true);
	};
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
							label: "Add SMTP server",
							icon: "plus",
							shortcut: { label: "C", keys: ["c"] },
							onSelect: openAdd,
						},
					]
				: []),
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
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						SMTP
					</h1>
					<p className="mt-1 text-sm text-text-sub-600">
						Send with Reloop's SMTP relay, or connect your own server.
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={openDocs}
						className="gap-1.5 rounded-xl"
						aria-keyshortcuts="d"
					>
						Documentation
						<ActionKbd>D</ActionKbd>
					</Button.Root>
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
							Add SMTP server
							<ActionKbd className={darkKbd}>C</ActionKbd>
						</FancyButton.Root>
					) : null}
				</div>
			</div>

			<div className="pb-8">
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
					smtpHost={smtpHost}
					providers={providers}
					isLoading={providersQuery.isPending}
					entitled={entitled}
					canManage={Boolean(isOrgAdmin)}
					onAdd={openAdd}
					onEdit={openEdit}
					onDelete={setDeleting}
				/>

				{providers.length > 0 ? (
					<p className="mt-3 text-[12px] text-text-soft-400 leading-relaxed">
						Mail from your own servers still gets Reloop's checks, templates,
						tracking, logs and webhooks. “Delivered” means your server accepted
						the message; later bounces go to your provider.
					</p>
				) : null}
			</div>

			<ProviderFormModal
				open={formOpen}
				provider={editing}
				selfHosted={usage?.selfHosted === true}
				onClose={() => setFormOpen(false)}
			/>
			<DeleteProviderModal
				provider={deleting}
				onClose={() => setDeleting(null)}
			/>
		</div>
	);
}
