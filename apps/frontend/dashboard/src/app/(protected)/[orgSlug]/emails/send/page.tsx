"use client";

import { toast } from "@reloop/ui/toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ComposeForm } from "./components/compose-form";
import { ComposeHeader } from "./components/compose-header";
import { ComposeSidebar } from "./components/compose-sidebar";

export default function SendEmailPage() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { orgSlug } = useParams();

	const handleSend = async () => {
		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		setIsLoading(false);
		toast.success("Email sent successfully!");
		router.push(`/${orgSlug}/emails`);
	};

	return (
		<div className="mx-auto max-w-4xl sm:px-8">
			<ComposeHeader onSend={handleSend} isLoading={isLoading} />

			<div className="mt-4 grid grid-cols-1 gap-8 pb-20 lg:grid-cols-12">
				<ComposeForm />
				<ComposeSidebar />
			</div>
		</div>
	);
}
