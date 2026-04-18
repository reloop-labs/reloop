"use client";

const EmailsLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-6">
				<h1 className="font-medium text-2xl">Email Logs</h1>
			</div>
			<div>{children}</div>
		</div>
	);
};

export default EmailsLayout;
