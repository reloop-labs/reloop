import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { toast } from "sonner";
import { useSessionQuery } from "#/features/auth/session-query";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import type { Domain } from "#/features/domain/types";
import { useSendFirstEmail } from "#/features/home/hooks/use-send-first-email";

type SendFirstEmailModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Prefer this domain when the modal opens (e.g. first active domain). */
	preferredDomainId?: string | null;
};

function activeDomains(domains: Domain[]) {
	return domains.filter((d) => d.status === "active");
}

export function SendFirstEmailModal({
	open,
	onOpenChange,
	preferredDomainId,
}: SendFirstEmailModalProps) {
	const { data: session } = useSessionQuery();
	const recipientEmail = session?.user?.email ?? "";

	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 50,
		status: "active",
		q: "",
		enabled: open,
	});

	const domains = useMemo(
		() => activeDomains(domainsQuery.data?.domains ?? []),
		[domainsQuery.data?.domains],
	);

	const [domainId, setDomainId] = useState("");
	const [localPart, setLocalPart] = useState("hello");
	const [fromName, setFromName] = useState("");
	const sendMutation = useSendFirstEmail();

	useEffect(() => {
		if (!open) return;
		const preferred =
			(preferredDomainId &&
				domains.find((d) => d.id === preferredDomainId)?.id) ||
			domains[0]?.id ||
			"";
		setDomainId(preferred);
		setLocalPart("hello");
		setFromName(session?.user?.name?.trim() || "");
	}, [open, domains, preferredDomainId, session?.user?.name]);

	useEffect(() => {
		if (open) sendMutation.reset();
		// Only reset mutation state when the modal opens.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const selectedDomain = domains.find((d) => d.id === domainId);
	const previewFrom = selectedDomain
		? fromName.trim()
			? `${fromName.trim()} <${localPart || "hello"}@${selectedDomain.domain}>`
			: `${localPart || "hello"}@${selectedDomain.domain}`
		: null;

	const canSubmit =
		Boolean(domainId && localPart.trim() && recipientEmail) &&
		!sendMutation.isPending &&
		domains.length > 0;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit || !domainId) return;

		try {
			const result = await sendMutation.mutateAsync({
				domainId,
				localPart: localPart.trim().toLowerCase(),
				fromName: fromName.trim() || undefined,
			});
			toast.success("Test email sent", {
				description: `Delivered to ${result.to} from ${result.from}`,
			});
			onOpenChange(false);
		} catch (err) {
			const error = err as Error & { why?: string; fix?: string };
			toast.error(error.message || "Failed to send test email", {
				description: error.fix || error.why,
			});
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="w-full max-w-[440px] overflow-hidden p-0">
				<form onSubmit={handleSubmit}>
					<div className="border-stroke-soft-100 border-b px-5 pt-5 pb-4 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-2.5 pr-8">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-weak-50 dark:bg-white/[0.06]">
								<Icon
									name="mail-send"
									className="h-4 w-4 text-text-strong-950"
								/>
							</div>
							<div>
								<Modal.Title className="font-semibold text-text-strong-950 text-title-h6">
									Send first email
								</Modal.Title>
								<Modal.Description className="mt-0.5 text-paragraph-sm text-text-sub-600">
									Send a test message to yourself from your verified domain.
								</Modal.Description>
							</div>
						</div>
					</div>

					<div className="space-y-4 px-5 py-5">
						<div className="space-y-1.5">
							<Label.Root className="text-label-sm text-text-sub-600">
								To
							</Label.Root>
							<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 px-3 py-2.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
								<Icon name="mail-single" className="h-4 w-4 text-text-soft-400" />
								<span className="truncate font-medium text-paragraph-sm text-text-strong-950">
									{recipientEmail || "No email on your account"}
								</span>
							</div>
							<p className="text-paragraph-xs text-text-soft-400">
								Always your signed-in account — not editable for security.
							</p>
						</div>

						{domainsQuery.isPending ? (
							<div className="flex h-20 items-center justify-center rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
								<Spinner size={20} />
							</div>
						) : domains.length === 0 ? (
							<div className="rounded-xl border border-warning-light bg-warning-lighter px-4 py-3">
								<p className="font-medium text-label-sm text-warning-base">
									No active domains
								</p>
								<p className="mt-1 text-paragraph-sm text-text-sub-600">
									Verify a domain first, then you can send from it.
								</p>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									asChild
									className="mt-3 rounded-xl"
								>
									<Link href="/domain">Go to Domains</Link>
								</Button.Root>
							</div>
						) : (
							<>
								<div className="space-y-1.5">
									<Label.Root
										htmlFor="send-first-domain"
										className="text-label-sm text-text-sub-600"
									>
										From domain
									</Label.Root>
									<Select.Root
										value={domainId}
										onValueChange={setDomainId}
									>
										<Select.Trigger
											id="send-first-domain"
											className="w-full rounded-xl"
										>
											<Select.Value placeholder="Select a domain" />
										</Select.Trigger>
										<Select.Content>
											{domains.map((d) => (
												<Select.Item key={d.id} value={d.id}>
													{d.domain}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>
								</div>

								<div className="space-y-1.5">
									<Label.Root
										htmlFor="send-first-local"
										className="text-label-sm text-text-sub-600"
									>
										From address
									</Label.Root>
									<div className="flex items-stretch gap-0 overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
										<Input.Root
											size="medium"
											className="min-w-0 flex-1 rounded-none border-0 shadow-none before:hidden"
										>
											<Input.Wrapper>
												<Input.Input
													id="send-first-local"
													value={localPart}
													onChange={(e) => setLocalPart(e.target.value)}
													placeholder="hello"
													autoComplete="off"
													spellCheck={false}
													required
												/>
											</Input.Wrapper>
										</Input.Root>
										<div className="flex shrink-0 items-center border-stroke-soft-100 border-l bg-bg-weak-50/60 px-3 font-medium text-paragraph-sm text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
											@{selectedDomain?.domain ?? "domain.com"}
										</div>
									</div>
								</div>

								<div className="space-y-1.5">
									<Label.Root
										htmlFor="send-first-name"
										className="text-label-sm text-text-sub-600"
									>
										Display name{" "}
										<span className="font-normal text-text-soft-400">
											(optional)
										</span>
									</Label.Root>
									<Input.Root size="medium" className="rounded-xl">
										<Input.Wrapper>
											<Input.Input
												id="send-first-name"
												value={fromName}
												onChange={(e) => setFromName(e.target.value)}
												placeholder="Acme"
												autoComplete="off"
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>

								{previewFrom ? (
									<div
										className={cn(
											"rounded-xl border border-stroke-soft-100 bg-bg-weak-50/40 px-3 py-2.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
										)}
									>
										<p className="font-medium text-[10px] text-text-soft-400 uppercase tracking-wider">
											Preview
										</p>
										<p className="mt-1 font-medium text-paragraph-sm text-text-strong-950">
											{previewFrom}
										</p>
										<p className="mt-0.5 text-paragraph-xs text-text-soft-400">
											→ {recipientEmail}
										</p>
									</div>
								) : null}
							</>
						)}
					</div>

					<div className="flex items-center justify-end gap-2 border-stroke-soft-100 border-t px-5 py-4 dark:border-stroke-soft-100/40">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							className="rounded-xl"
							onClick={() => onOpenChange(false)}
							disabled={sendMutation.isPending}
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="submit"
							variant="blue"
							size="small"
							className="gap-1.5 rounded-xl"
							disabled={!canSubmit}
						>
							{sendMutation.isPending ? (
								<>
									<Spinner size={14} />
									Sending…
								</>
							) : (
								<>
									<Icon name="send" className="h-3.5 w-3.5" />
									Send test email
								</>
							)}
						</FancyButton.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}
