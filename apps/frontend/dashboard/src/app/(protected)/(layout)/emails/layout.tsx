"use client";
import { DocsButton } from "@fe/dashboard/components/docs-button";
import { usePathname } from "next/navigation";
import { EmailsTabs } from "./components/emails-tabs";

const EmailsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();

	const isReceivedPage = pathname.includes("/emails/received");
	const isSentPage = pathname.includes("/emails/sent");
	const isDetailPage =
		!isSentPage &&
		!isReceivedPage &&
		pathname !== "/emails" &&
		pathname !== "/dashboard/emails"; // support local basePaths

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			{!isDetailPage && (
				<div className="flex items-center justify-between pt-10 pb-6">
					<div className="flex flex-col gap-1">
						<h1 className="font-medium text-2xl">Emails</h1>
					</div>
					<div className="flex items-center gap-2 self-end">
						<DocsButton slug="features/emails" size="xsmall" />
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
};

export default EmailsLayout;
