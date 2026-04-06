"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { LogDetail } from "../components/log-detail";
import { LogHeader } from "../components/log-header";

interface LogData {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
	metadata: Record<string, unknown>;
	requestDetails: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		[key: string]: unknown;
	};
	trace_id: string | null;
}

const LogDetailPage = () => {
	const { log_id } = useParams();

	const {
		data: logData,
		error,
		isLoading,
	} = useSWR<LogData>(log_id ? `/api/logs/v1/${log_id}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	if (error) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<LogHeader isLoading={false} />
				<div className="pt-20">
					<SomethingWentWrong />
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<LogHeader log={logData} isLoading={isLoading} />
			{!logData && !isLoading ? null : (
				<LogDetail log={logData} isLoading={isLoading} />
			)}
		</div>
	);
};

export default LogDetailPage;
