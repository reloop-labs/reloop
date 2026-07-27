import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { useEmailDetailQuery } from "#/features/emails/hooks/use-emails-query";
import { useNavigate } from "#/lib/navigation";
import { EmailDetail } from "./email-detail";
import { EmailNotFound } from "./email-not-found";

export function EmailDetailPage({ emailId }: { emailId: string }) {
	const navigate = useNavigate();
	const { data, error, isPending, isFetching } = useEmailDetailQuery(emailId);

	const isLoading = isPending || (isFetching && !data);

	if (error && !data) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<EmailNotFound />
			</div>
		);
	}

	if (!data && !isLoading) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<EmailNotFound />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="pt-10 pb-8">
				<AnimatedBackButton
					onClick={() => void navigate({ to: "/emails/sent" })}
				/>
			</div>
			<EmailDetail email={data} isLoading={isLoading} />
		</div>
	);
}
