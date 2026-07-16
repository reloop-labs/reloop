import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useRouterState } from "@tanstack/react-router";
import { EmailsTabs } from "./components/emails-tabs";

export function EmailsShell({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const isReceivedPage = pathname.includes("/emails/received");
	const isSentPage =
		pathname.includes("/emails/sent") || pathname.endsWith("/emails");
	const isDetailPage = !isSentPage && !isReceivedPage;

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
			{!isDetailPage && (
				<div className="flex items-center justify-between pb-6">
					<div className="flex flex-col gap-1">
						<h1 className="font-medium text-2xl">Emails</h1>
					</div>
					<div className="flex items-center gap-2 self-end">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() =>
								window.open("https://reloop.sh/docs/features/emails", "_blank")
							}
							className="gap-1.5"
						>
							<Icon name="file-text" className="h-4 w-4" />
							Docs
						</Button.Root>
					</div>
				</div>
			)}

			{!isDetailPage && (
				<div className="mt-2">
					<EmailsTabs />
				</div>
			)}
			<div className={!isDetailPage ? "mt-4" : ""}>{children}</div>
		</div>
	);
}
