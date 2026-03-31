"use client";
import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname, useRouter } from "next/navigation";
import { DocsButton } from "./components/docs-button";
import { LogsApiDetails } from "./components/logs-api-details";
import { LogsModals } from "./components/logs-modals";

const LogsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const router = useRouter();

	const isLogDetailPage = pathname.match(/\/logs\/([^/]+)/) !== null;

	const getHeaderConfig = () => {
		if (isLogDetailPage) return { title: "Log Details", showBack: true };
		return { title: "Logs", showBack: false };
	};

	const { title, showBack } = getHeaderConfig();

	return (
		<div>
			<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 pr-2 pl-3 dark:border-stroke-soft-100/40">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<Icon name="file-text" className="h-4 w-4" />
						<p className="font-medium text-sm">Logs</p>
					</div>
					<FeedbackPopover />
				</div>
			</div>
			<div className="mx-auto max-w-3xl sm:px-8">
				<div className="flex items-center justify-between pt-10 pb-6">
					<div className="flex flex-col gap-1">
						{showBack && (
							<Button.Root
								onClick={() => router.back()}
								variant="neutral"
								mode="stroke"
								size="xxsmall"
								className="w-fit"
							>
								<Button.Icon>
									<Icon name="chevron-left" className="h-4 w-4" />
								</Button.Icon>
								Back
							</Button.Root>
						)}
						<h1 className="font-medium text-2xl">{title}</h1>
					</div>
					{!isLogDetailPage && (
						<div className="flex items-center gap-2 self-end">
							<DocsButton size="xsmall" mode="stroke" />
							<LogsApiDetails size="xsmall" mode="ghost" />
						</div>
					)}
				</div>

				<div className="mt-4">{children}</div>
			</div>

			<LogsModals />
		</div>
	);
};

export default LogsLayout;
