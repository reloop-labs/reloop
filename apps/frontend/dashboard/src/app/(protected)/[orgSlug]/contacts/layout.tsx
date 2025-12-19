"use client";
import { ContactsApiDetails } from "@fe/dashboard/components/api-details/contacts";
import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";

const openDocs = () => window.open("https://reloop.sh/docs/contacts", "_blank");

const ContactsLayout = ({ children }: { children: React.ReactNode }) => {
	useHotkeys("d", openDocs);

	return (
		<div>
			<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-2">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<Icon name="users" className="h-4 w-4" />
						<p className="font-medium text-sm">Contacts</p>
					</div>
					<div className="flex items-center justify-end">
						<FeedbackPopover />
						<ContactsApiDetails />
						<Button.Root
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							onClick={openDocs}
							className="gap-1.5"
						>
							<Icon name="book-closed" className="h-4 w-4" />
							Docs
							<Kbd.Root className="bg-bg-weak-50 text-[10px]">D</Kbd.Root>
						</Button.Root>
					</div>
				</div>
			</div>
			<div>
				<div>{children}</div>
			</div>
		</div>
	);
};

export default ContactsLayout;
