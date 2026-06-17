"use client";
import { DocsButton } from "@fe/dashboard/components/docs-button";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname, useRouter } from "next/navigation";
import { EmailsTabs } from "./components/emails-tabs";

const EmailsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const router = useRouter();

	const isReceivedPage = pathname.includes("/emails/received");
	const isSentPage = pathname.includes("/emails/sent");
	const isComposePage = pathname.includes("/emails/send");
	const isDetailPage =
		!isSentPage &&
		!isReceivedPage &&
		!isComposePage &&
		pathname !== "/emails" &&
		pathname !== "/dashboard/emails"; // support local basePaths

	return (
		<>
			<div className="mx-auto max-w-3xl sm:px-8">
				{!isDetailPage && !isComposePage && (
					<div className="flex items-center justify-between pt-10 pb-6">
						<div className="flex flex-col gap-1">
							<h1 className="font-medium text-2xl">Emails</h1>
						</div>
						<div className="flex items-center gap-2 self-end">
							<DocsButton slug="features/emails" size="xsmall" />
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={() => router.push("/emails/send")}
								className="gap-2"
							>
								<Icon name="plus" className="h-4 w-4" />
								Compose
							</Button.Root>
						</div>
					</div>
				)}

				{!isDetailPage && !isComposePage && (
					<div className="mt-2">
						<EmailsTabs />
					</div>
				)}
				<div className={!isDetailPage && !isComposePage ? "mt-4" : ""}>
					{children}
				</div>
			</div>
		</>
	);
};

export default EmailsLayout;
