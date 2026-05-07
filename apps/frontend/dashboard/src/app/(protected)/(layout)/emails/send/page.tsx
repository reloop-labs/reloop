"use client";
import { toast } from "@reloop/ui/toast";
import { useParams, useRouter } from "next/navigation";

import { useState } from "react";
import { ComposeForm } from "./components/compose-form";
import { ComposeHeader } from "./components/compose-header";

export default function SendEmailPage() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSend = async () => {
		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		setIsLoading(false);
		toast.success("Email sent successfully!");
		router.push("/emails");
	};

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<ComposeHeader />

			<div className="mt-4 pb-20">
				<ComposeForm onSend={handleSend} isLoading={isLoading} />
			</div>
		</div>
	);
}
