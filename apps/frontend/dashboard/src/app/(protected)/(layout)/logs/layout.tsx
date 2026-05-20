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
				<div className="mx-auto w-full max-w-6xl px-6">{children}</div>
			)}

			<LogsModals />
		</>
	);
};

export default LogsLayout;
