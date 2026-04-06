"use client";

import { usePathname } from "next/navigation";
import { DocsButton } from "./components/docs-button";
import { LogsApiDetails } from "./components/logs-api-details";
import { LogsModals } from "./components/logs-modals";

const LogsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const isLogDetailPage = pathname.match(/\/logs\/([^/]+)/) !== null;

	return (
		<>
			<div className="mx-auto max-w-3xl sm:px-8">
				{!isLogDetailPage && (
					<div className="flex items-center justify-between pt-10 pb-6">
						<div className="flex flex-col gap-1">
							<h1 className="font-medium text-2xl">Logs</h1>
						</div>
						<div className="flex items-center gap-2 self-end">
							<DocsButton size="xsmall" mode="stroke" />
							<LogsApiDetails size="xsmall" mode="ghost" />
						</div>
					</div>
				)}

				<div className={!isLogDetailPage ? "mt-4" : ""}>{children}</div>
			</div>

			<LogsModals />
		</>
	);
};

export default LogsLayout;
