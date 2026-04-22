"use client";

import { Icon } from "@reloop/ui/icon";
import * as Button from "@reloop/ui/button";
import Link from "next/link";
import { CenterHeader } from "./components/center-header";
import { EmailEditor } from "@react-email/editor";

// Important: these styles provide the inspector and bubble menu UI for the native editor.
import "@react-email/editor/styles/bubble-menu.css";
import "@react-email/editor/styles/slash-command.css";
import "@react-email/editor/styles/inspector.css";
import "@react-email/editor/themes/default.css";

const Page = () => {
	return (
		<div className="flex h-screen flex-col overflow-hidden bg-neutral-alpha-100">
			{/* Simple top navigation that replaces the complex sidebars */}
			<header className="flex h-14 items-center justify-between border-stroke-soft-200 border-b bg-white px-4">
				<div className="flex items-center gap-3">
					<Button.Root asChild mode="ghost" variant="neutral" size="small">
						<Link href="/templates">
							<Button.Icon as={Icon} name="chevron-left" />
							Back
						</Link>
					</Button.Root>
					<div className="h-4 w-[1px] bg-stroke-soft-200" />
					<span className="font-medium text-sm text-text-strong-950">
						Template Editor
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button.Root variant="primary" size="small">
						Save & Publish
					</Button.Root>
				</div>
			</header>

			<main className="flex flex-1 flex-col overflow-hidden">
				<CenterHeader />
				<div className="flex-1 overflow-auto p-4 sm:p-8">
					<div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-sm h-full min-h-[600px] border border-stroke-soft-200 overflow-hidden flex flex-col">
						<EmailEditor 
							placeholder="Press '/' for commands..."
							content="<p></p>"
							className="w-full flex-1 h-full prose max-w-none focus:outline-none p-8"
						/>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Page;
