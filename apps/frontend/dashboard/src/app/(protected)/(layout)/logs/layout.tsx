"use client";

import { usePathname } from "next/navigation";
import { LogsModals } from "./components/logs-modals";

const LogsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const isLogDetailPage = pathname.match(/\/logs\/([^/]+)/) !== null;

	return (
		<>
			{isLogDetailPage ? (
				<div className="mx-auto max-w-3xl px-6 sm:px-8">{children}</div>
			) : (
				<div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">{children}</div>
			)}

			<LogsModals />
		</>
	);
};

export default LogsLayout;
