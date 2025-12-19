"use client";

import { CenterActions } from "./components/center-actions";
import { CenterHeader } from "./components/center-header";
import { LeftSidebar } from "./components/left-sidebar";
import { RightSidebar } from "./components/right-sidebar";

const Page = () => {
	return (
		<div className="flex min-h-screen">
			<LeftSidebar />
			<main className="flex-1">
				<CenterHeader />
				<CenterActions />
			</main>
			<RightSidebar />
		</div>
	);
};

export default Page;
