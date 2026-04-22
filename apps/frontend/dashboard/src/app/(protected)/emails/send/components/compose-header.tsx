"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams, useRouter } from "next/navigation";

export const ComposeHeader = () => {
	const router = useRouter();
	const { orgSlug } = useParams();

	return (
		<div className="flex items-center justify-between pt-10 pb-6">
			<div className="flex flex-col gap-1">
				<Button.Root
					onClick={() => router.push(`/${orgSlug}/emails`)}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
					className="w-fit"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<h1 className="font-medium text-2xl text-text-strong-950">
					Send Email
				</h1>
			</div>
		</div>
	);
};
