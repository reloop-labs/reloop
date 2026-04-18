"use client";

import { EmailList } from "./components/email-list";

const EmailsPage = () => {
	return (
		<div className="mx-auto max-w-4xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-6">
				<h1 className="font-medium text-2xl">Emails</h1>
			</div>
			<EmailList />
		</div>
	);
};

export default EmailsPage;
