import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useCurrentEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import { mapTemplateVariables } from "#/features/templates/lib/template-variables";

interface PanelProps {
	onOpenChange?: (open: boolean) => void;
	onClose: () => void;
}

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

interface RecentSend {
	email: string;
	timestamp: Date;
	status: "success" | "error";
	error?: string;
}

interface MappedVariable {
	name: string;
	type: "string" | "number";
	defaultValue: string | null;
}

function formatRelativeTime(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "just now";
	if (minutes < 60) {
		return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
	}
	if (hours < 24) {
		return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
	}
	if (days === 1) {
		return "Yesterday";
	}
	if (days < 7) {
		return `${days} days ago`;
	}

	const day = date.getDate();
	const month = date.toLocaleDateString("en-US", { month: "short" });
	const year = date.getFullYear();
	const currentYear = now.getFullYear();

	if (year === currentYear) {
		return `${day} ${month}`;
	}
	return `${day} ${month}, ${year}`;
}

export function TestPanel({ onClose }: PanelProps) {
	const templateId = useTemplateId();

	const { editor } = useCurrentEditor();
	const { subject, fromEmail } = useEditorStore();

	const [testEmail, setTestEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [recentSends, setRecentSends] = useState<RecentSend[]>([]);

	// Fetch template data to read variables
	const { data: templateData } = useSWR<any>(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);

	const rawVars = templateData?.variables ?? [];
	const detectedVars: MappedVariable[] = mapTemplateVariables(rawVars);

	// State for variable values entered by the user
	const [variableValues, setVariableValues] = useState<Record<string, string>>(
		{},
	);

	// Initialize variableValues with default values when templateData is fetched
	useEffect(() => {
		if (detectedVars && detectedVars.length > 0) {
			const initialValues: Record<string, string> = {};
			for (const v of detectedVars) {
				if (variableValues[v.name] === undefined) {
					initialValues[v.name] = v.defaultValue ?? "";
				} else {
					initialValues[v.name] = variableValues[v.name] ?? "";
				}
			}
			setVariableValues(initialValues);
		}
	}, [templateData]);

	const handleVariableChange = (name: string, value: string) => {
		setVariableValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSendTest = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!testEmail) {
			toast.error("Please enter a valid email address");
			return;
		}

		if (!templateId) {
			toast.error("Template ID not found");
			return;
		}

		setSending(true);

		try {
			// Compile current visual editor content to HTML if editor is present
			const currentHtml = editor ? editor.getHTML() : undefined;

			// Send POST request to backend test endpoint
			const response = await fetch(`/api/template/v1/${templateId}/test`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to: testEmail,
					fromEmail: fromEmail || undefined,
					subject: subject || undefined,
					html: currentHtml,
					variables: variableValues,
				}),
				credentials: "include",
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.why || result.message || "Failed to send test email",
				);
			}

			setRecentSends((prev) => [
				{ email: testEmail, timestamp: new Date(), status: "success" },
				...prev.slice(0, 2),
			]);
			toast.success(`Test email sent successfully to ${testEmail}`);
			setTestEmail("");
		} catch (error: any) {
			console.error("Error sending test email:", error);
			const errMsg = error.message || "Failed to send test email";
			setRecentSends((prev) => [
				{
					email: testEmail,
					timestamp: new Date(),
					status: "error",
					error: errMsg,
				},
				...prev.slice(0, 2),
			]);
			toast.error(errMsg);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
			{/* ── Header ── */}
			<div className="flex shrink-0 items-center justify-between pt-3 pr-4 pb-3 pl-6">
				<h2 className="font-semibold text-label-lg text-text-strong-950">
					Send Test Email
				</h2>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-text-soft-400 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
				>
					<Icon name="cross" className="h-[18px] w-[18px]" />
				</button>
			</div>

			<div className="flex flex-1 flex-col justify-between overflow-y-auto px-5 pb-5">
				<div className="space-y-5">
					<p className="text-paragraph-sm text-text-sub-600 leading-normal">
						Verify exactly how this email template will render across different
						client mailboxes by sending a live test copy.
					</p>

					<form onSubmit={handleSendTest} className="space-y-5">
						{!fromEmail ? (
							<div className="flex flex-col gap-2.5 rounded-2xl border border-error-base/20 bg-error-lighter p-3.5">
								<div className="flex items-start gap-2.5">
									<Icon
										name="alert-circle"
										className="mt-0.5 h-4 w-4 shrink-0 text-error-base"
									/>
									<div className="flex flex-col gap-1">
										<span className="font-semibold text-error-base text-xs">
											Missing From Address
										</span>
										<p className="text-[11px] text-error-base/90 leading-normal">
											You must configure a valid "From Email" in the Send
											Details panel before you can send a test email.
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-col gap-1.5">
								<Label.Root htmlFor="recipient-address">
									Recipient Address
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Input
											id="recipient-address"
											type="email"
											required
											placeholder="e.g. name@domain.com"
											value={testEmail}
											onChange={(e) => setTestEmail(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						)}

						{detectedVars.length > 0 && (
							<div className="space-y-4 border-stroke-soft-200 border-t pt-4 dark:border-stroke-soft-100/40">
								<span className="block font-bold text-[10px] text-text-sub-600 uppercase tracking-wider">
									Template Variables
								</span>
								<div className="max-h-[250px] space-y-3.5 overflow-y-auto pr-1">
									{detectedVars.map((v) => (
										<div key={v.name} className="flex flex-col gap-1.5">
											<div className="flex items-center justify-between">
												<Label.Root
													htmlFor={v.name}
													className="font-semibold text-text-strong-950 text-xs"
												>
													{v.name}
												</Label.Root>
												<Badge.Root
													size="small"
													variant="lighter"
													color={v.type === "number" ? "purple" : "blue"}
													className="h-[18px] rounded-full px-1.5 font-semibold text-[10px] capitalize"
												>
													{v.type}
												</Badge.Root>
											</div>
											<Input.Root size="small" className="rounded-xl">
												<Input.Wrapper>
													<Input.Input
														id={v.name}
														type={v.type === "number" ? "number" : "text"}
														placeholder={
															v.defaultValue
																? `Default: ${v.defaultValue}`
																: "Enter value..."
														}
														value={variableValues[v.name] ?? ""}
														onChange={(e) =>
															handleVariableChange(v.name, e.target.value)
														}
													/>
												</Input.Wrapper>
											</Input.Root>
										</div>
									))}
								</div>
							</div>
						)}

						<FancyButton.Root
							type="submit"
							variant="neutral"
							size="small"
							disabled={sending || !fromEmail}
							className="w-full justify-center gap-1.5"
						>
							{sending ? (
								<>
									<Spinner size={13} color="#fff" />
									Sending...
								</>
							) : (
								<>
									<FancyButton.Icon as={Icon} name="send" />
									Send Test Email
								</>
							)}
						</FancyButton.Root>
					</form>
				</div>

				{/* Send Log History */}
				{recentSends.length > 0 && (
					<div className="mt-6 border-stroke-soft-200 border-t pt-4 dark:border-stroke-soft-100/20">
						<span className="mb-2.5 block font-bold text-[10px] text-text-sub-600 uppercase tracking-wider">
							Recent Sends
						</span>
						<div className="space-y-2">
							{recentSends.map((send, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-2.5 dark:border-stroke-soft-100/40"
								>
									<div className="flex min-w-0 flex-col">
										<span className="truncate font-medium text-text-strong-950 text-xs">
											{send.email}
										</span>
										<span
											className={cn(
												"flex items-center gap-1 font-semibold text-[9px]",
												send.status === "success"
													? "text-success-base"
													: "text-error-base",
											)}
										>
											{send.status === "success" ? (
												<>
													<Icon
														name="check-circle"
														className="h-2.5 w-2.5 shrink-0"
													/>
													Delivered successfully
												</>
											) : (
												<>
													<Icon
														name="alert-circle"
														className="h-2.5 w-2.5 shrink-0"
													/>
													{send.error || "Failed to send"}
												</>
											)}
										</span>
									</div>
									<span className="shrink-0 text-[9px] text-text-soft-400">
										{formatRelativeTime(send.timestamp.toISOString())}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
