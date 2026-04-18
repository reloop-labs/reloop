"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams, useRouter } from "next/navigation";

interface ComposeHeaderProps {
	onSend: () => void;
	isLoading?: boolean;
}

export const ComposeHeader = ({ onSend, isLoading }: ComposeHeaderProps) => {
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
			<div className="flex items-center gap-3">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={() => router.push(`/${orgSlug}/emails`)}
				>
					Cancel
				</Button.Root>
				<Button.Root
					variant="primary"
					mode="filled"
					size="xsmall"
					onClick={onSend}
					disabled={isLoading}
					className="bg-text-strong-950 text-static-white hover:bg-black"
				>
					<span className="flex items-center gap-2">
						{isLoading && <Spinner size={14} color="#fff" />}
						Send message
					</span>
				</Button.Root>
			</div>
		</div>
	);
};
