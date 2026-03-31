"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { LogDetail } from "../components/log-detail";

interface LogData {
	uuid: string;
	service: string;
	event: string;
	level: string;
	message: string | null;
	occurred_at: string;
	properties: Record<string, unknown>;
	metadata: Record<string, unknown>;
	request_id: string | null;
	trace_id: string | null;
}

const LogDetailPage = () => {
	const { log_id } = useParams();
	const { activeOrganization } = useUserOrganization();

	const {
		data: logData,
		error,
		isLoading,
	} = useSWR<LogData>(
		activeOrganization?.id && log_id ? `/api/logs/v1/${log_id}` : null,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	if (error) {
		return (
			<div className="mx-auto max-w-4xl px-4 sm:px-8">
				<SomethingWentWrong />
			</div>
		);
	}

	if (!logData && !isLoading) {
		return (
			<div className="mx-auto max-w-4xl px-4 sm:px-8">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
						Log not found
					</h2>
					<p className="text-text-sub-600">
						The log entry you're looking for doesn't exist or has been expired.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-4 pb-12 sm:px-8">
			<LogDetail log={logData} isLoading={isLoading} />
		</div>
	);
};

export default LogDetailPage;
