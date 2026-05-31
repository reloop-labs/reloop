"use client";

import { EmailList } from "./components/email-list";

const EmailsPage = () => {
	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-3">
				<div className="flex flex-col gap-1">
					<h1 className="font-medium text-2xl">Emails</h1>
				</div>
			</div>
			<div className="mt-4">
				<EmailList />
			</div>
		</div>
	);
};

export default EmailsPage;
