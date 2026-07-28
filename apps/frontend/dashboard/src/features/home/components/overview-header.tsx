import Link from "next/link";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";

const DOCS_URL = "https://reloop.sh/docs";

export function OverviewHeader({
	organizationName,
	canSendFirstEmail,
	onSendFirstEmail,
}: {
	organizationName?: string | null;
	/** True when the workspace has at least one active domain. */
	canSendFirstEmail?: boolean;
	onSendFirstEmail?: () => void;
}) {
	return (
		<div className="flex flex-col gap-4 pt-2 pb-2 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="home"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Overview
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					{organizationName
						? `Workspace health and recent activity for ${organizationName}.`
						: "Workspace health and recent activity."}
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					asChild
					className="rounded-xl"
				>
					<a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
						Documentation
					</a>
				</Button.Root>
				{canSendFirstEmail && onSendFirstEmail ? (
					<FancyButton.Root
						type="button"
						variant="blue"
						size="small"
						className="gap-1.5 rounded-xl"
						onClick={onSendFirstEmail}
					>
						<Icon name="mail-send" className="h-4 w-4" />
						Send test email
					</FancyButton.Root>
				) : (
					<FancyButton.Root
						variant="blue"
						size="small"
						asChild
						className="gap-1.5 rounded-xl"
					>
						<Link href="/api-keys">
							<Icon name="key-new" className="h-4 w-4" />
							API keys
						</Link>
					</FancyButton.Root>
				)}
			</div>
		</div>
	);
}
