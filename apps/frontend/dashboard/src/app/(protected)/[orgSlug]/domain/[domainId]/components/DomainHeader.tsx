"use client";

import { getStatusColorClass, getStatusIcon } from "@dashboard/utils/domain";
import type { Domain, DomainStatus } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { DeleteDomainModal } from "../../components/delete-domain";

interface DomainHeaderProps {
	domainId: string;
	lastUpdated?: string;
	status?: DomainStatus;
	isLoading?: boolean;
	isFailed?: boolean;
}

export const DomainHeader = ({
	domainId,
	lastUpdated,
	status = "start-verify",
	isLoading,
	isFailed,
}: DomainHeaderProps) => {
	const { back } = useRouter();
	const [, setDeleteId] = useQueryState("delete");

	return (
		<div className="pt-10 pb-8">
			<Button.Root
				onClick={() => back()}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<div className="flex items-end justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-12 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<div className="flex items-center gap-1">
								<Skeleton className="h-3.5 w-3.5 rounded-full" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								Domain{" "}
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								{isFailed ? "---" : lastUpdated}
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<div
								className={`flex items-center gap-1 ${getStatusColorClass(status)}`}
							>
								<Icon name={getStatusIcon(status)} className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-sm capitalize">
									{status}
								</p>
							</div>
						</div>
					)}
					<h1 className="font-medium text-title-h4 leading-8">{domainId}</h1>
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-9 w-32 rounded-lg" />
							<Skeleton className="h-9 w-9 rounded-lg" />
						</>
					) : isFailed ? (
						<Button.Root variant="error" size="small" mode="lighter">
							Try Again
						</Button.Root>
					) : (
						<>
							<Button.Root
								variant="neutral"
								size="small"
								className="font-semibold"
							>
								Verify DNS Records
							</Button.Root>
							<PopoverRoot>
								<PopoverTrigger asChild>
									<Button.Root variant="neutral" mode="stroke" size="xsmall">
										<Icon name="more-vertical" className="h-4 w-4 rotate-90" />
									</Button.Root>
								</PopoverTrigger>
								<PopoverContent align="end" className="w-48 p-2">
									<div className="flex flex-col gap-1">
										<Button.Root
											variant="neutral"
											mode="ghost"
											size="small"
											onClick={() =>
												window.open("https://reloop.sh/docs/domain", "_blank")
											}
											className="w-full justify-start"
										>
											<Icon name="file-text" className="h-4 w-4" />
											Go to docs
										</Button.Root>
										<Button.Root
											variant="error"
											mode="ghost"
											size="small"
											onClick={() => setDeleteId(domainId)}
											className="w-full justify-start text-red-600 hover:bg-red-50"
										>
											<Icon name="trash" className="h-4 w-4" />
											Remove domain
										</Button.Root>
									</div>
								</PopoverContent>
							</PopoverRoot>
						</>
					)}
				</div>
			</div>
			<DeleteDomainModal
				domains={[
					{
						id: domainId,
						domain: domainId,
						organizationId: "",
						userId: "",
						domainType: "custom" as const,
						status: "active" as const,
						userVerified: false,
						systemVerified: false,
						dnsConfigured: false,
						nameservers: null,
						spfRecord: null,
						dkimRecord: null,
						dkimSelector: "reloop",
						dmarcRecord: null,
						dmarcPolicy: "none",
						trackingDomain: false,
						verificationFailedReason: null,
						deletedAt: null,
						lastVerifiedAt: null,
						createdAt: "",
						updatedAt: "",
					} satisfies Domain,
				]}
			/>
		</div>
	);
};
