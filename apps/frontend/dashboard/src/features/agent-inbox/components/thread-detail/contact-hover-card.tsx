import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { toast } from "sonner";
import { HoverPopover } from "./hover-popover";

export function ContactHoverCard({
	name,
	email,
	isYou,
	children,
}: {
	name: string;
	email: string;
	isYou?: boolean;
	children: ReactNode;
}) {
	const displayName = name.trim() || email.split("@")[0] || email;
	const domain = email.includes("@") ? email.split("@")[1] : "";

	const copyEmail = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(email);
			toast.success("Email copied");
		} catch {
			toast.error("Couldn't copy email");
		}
	};

	return (
		<HoverPopover
			align="start"
			side="bottom"
			sideOffset={-3}
			contentClassName="w-72 p-0"
			trigger={
				<button
					type="button"
					className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20"
					aria-label={`Contact details for ${displayName}`}
					tabIndex={0}
				>
					{children}
				</button>
			}
		>
			<div className="flex flex-col">
				<div className="flex items-start gap-3 px-4 pt-4 pb-3">
					<div
						className={cn(
							"flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold text-base text-white uppercase",
							getAvatarGradient(email || displayName),
						)}
					>
						{getAvatarInitial(name || null, email || displayName)}
					</div>
					<div className="min-w-0 flex-1 pt-0.5">
						<div className="flex flex-wrap items-center gap-1.5">
							<p className="truncate font-semibold text-mail-foreground text-sm leading-snug">
								{displayName}
							</p>
							{isYou && (
								<span className="inline-flex shrink-0 items-center rounded-md bg-[var(--inbox-muted-bg)] px-1.5 py-0.5 font-medium text-[10px] text-mail-muted ring-1 ring-mail-border/40 ring-inset">
									You
								</span>
							)}
						</div>
						{domain ? (
							<p className="mt-0.5 truncate text-mail-muted text-xs">{domain}</p>
						) : null}
					</div>
				</div>

				<div className="mx-4 border-mail-border/40 border-t" />

				<div className="space-y-2 px-4 py-3">
					<div className="flex items-start gap-2.5">
						<Icon
							name="mail"
							className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mail-muted"
						/>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-[11px] text-mail-muted">Email</p>
							<p className="truncate text-mail-foreground text-sm">{email}</p>
						</div>
						<button
							type="button"
							onClick={copyEmail}
							className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-mail-muted transition-colors hover:bg-[var(--inbox-hover)] hover:text-mail-foreground"
							aria-label="Copy email"
						>
							<Icon name="copy" className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</div>
		</HoverPopover>
	);
}
