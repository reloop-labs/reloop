"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as CompactButton from "@reloop/ui/compact-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Popover from "@reloop/ui/popover";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ForwardDNSRecordsButtonProps {
	domainId: string;
}

export const ForwardDNSRecordsButton = ({
	domainId,
}: ForwardDNSRecordsButtonProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setEmail("");
			setIsSending(false);
		}
	}, [isOpen]);

	const handleForward = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !domainId) return;

		setIsSending(true);
		try {
			await axios.post(
				`/api/domain/v1/verify/${domainId}/forward-dns`,
				{ email },
				{ headers: { credentials: "include" } },
			);
			toast.success("DNS records forwarded successfully");
			setIsOpen(false);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to forward DNS records"
				: "Failed to forward DNS records";
			toast.error(errorMessage);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn("gap-1.5", isOpen && "bg-bg-weak-50")}
				>
					<Icon name="mail-single" className="h-4 w-4" />
					Forward records
				</Button.Root>
			</Popover.Trigger>
			<Popover.Content
				align="end"
				sideOffset={8}
				showArrow={false}
				className="w-[280px] p-4"
			>
				<form onSubmit={handleForward} className="flex flex-col gap-2">
					<div className="space-y-1">
						<h3 className="font-semibold text-sm text-text-strong-950">
							Forward DNS records
						</h3>
					</div>
					<Input.Root size="small" className="w-full">
						<Input.Wrapper>
							<Input.Icon
								as={Icon}
								name="mail-single"
								className="text-text-soft-400"
							/>
							<Input.Input
								type="email"
								placeholder="Enter email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isSending}
							/>
							<CompactButton.Root
								type="submit"
								variant="ghost"
								size="medium"
								disabled={isSending || !email.trim()}
								className="text-text-sub-600 transition duration-150 disabled:text-text-disabled-300"
							>
								{isSending ? (
									<Spinner size={14} color="currentColor" />
								) : (
									<Icon name="send-1" className="h-4 w-4" />
								)}
							</CompactButton.Root>
						</Input.Wrapper>
					</Input.Root>
				</form>
			</Popover.Content>
		</Popover.Root>
	);
};
