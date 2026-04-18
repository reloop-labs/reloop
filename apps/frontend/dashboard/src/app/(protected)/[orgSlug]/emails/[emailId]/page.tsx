"use client";

import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { EmailDetail } from "./components/email-detail";
import { EmailHeader } from "./components/email-header";

interface EmailLogData {
	id: string;
	messageId: string;
	organizationId: string;
	domainId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	ccEmails: string[] | null;
	bccEmails: string[] | null;
	replyTo: string | null;
	subject: string;
	textBody: string | null;
	htmlBody: string | null;
	status: string;
	errorMessage: string | null;
	provider: string;
	size: number;
	headers: Record<string, string> | null;
	createdAt: string;
	updatedAt: string;
}

const EmailDetailPage = () => {
	const { emailId } = useParams();

	const {
		data: emailData,
		error,
		isLoading,
	} = useSWR<EmailLogData>(emailId ? `/api/logs/v1/emails/${emailId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	if (error) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<EmailHeader isLoading={false} />
				<div className="pt-20">
					<SomethingWentWrong />
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<EmailHeader email={emailData} isLoading={isLoading} />
			{!emailData && !isLoading ? null : (
				<EmailDetail email={emailData} isLoading={isLoading} />
			)}
		</div>
	);
};

export default EmailDetailPage;
