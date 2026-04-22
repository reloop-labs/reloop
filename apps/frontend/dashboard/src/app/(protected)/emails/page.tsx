"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useParams, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { DocsButton } from "./components/docs-button";
import { EmailList } from "./components/email-list";

const EmailsPage = () => {
	const router = useRouter();
	const { orgSlug } = useParams();

	const handleSendEmail = () => {
		router.push(`/${orgSlug}/emails/send`);
	};

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		handleSendEmail();
	});

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-6">
				<div className="flex flex-col gap-1">
					<h1 className="font-medium text-2xl">Emails</h1>
				</div>
				<div className="flex items-center gap-2 self-end">
					<DocsButton size="xsmall" mode="stroke" />
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={handleSendEmail}
						className="gap-2"
					>
						<Icon name="plus" className="h-4 w-4" />
						Send Email
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
								A
							</span>
						</span>
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xsmall"
						className="aspect-square p-0"
					>
						<Icon name="code" className="h-4 w-4" />
					</Button.Root>
				</div>
			</div>
			<div className="mt-4">
				<EmailList />
			</div>
		</div>
	);
};

export default EmailsPage;
