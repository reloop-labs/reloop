"use client";

import { EmailList } from "./components/email-list";

const EmailsPage = () => {
	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-6">
				<h1 className="font-medium text-2xl">Email Logs</h1>
			</div>
			<EmailList />
		</div>
	);
};

export default EmailsPage;
