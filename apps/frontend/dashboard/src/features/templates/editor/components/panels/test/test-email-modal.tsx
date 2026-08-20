import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useCurrentEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import { getRenderedEmailHtml } from "#/features/templates/editor/utils/get-rendered-email-html";
import { mapTemplateVariables } from "#/features/templates/lib/template-variables";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

interface MappedVariable {
	name: string;
	type: "string" | "number";
	defaultValue: string | null;
}

export function TestEmailModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const templateId = useTemplateId();
	const { editor } = useCurrentEditor();
	const { subject, fromEmail, previewText } = useEditorStore();

	const [testEmail, setTestEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [variableValues, setVariableValues] = useState<Record<string, string>>(
		{},
	);

	const { data: templateData } = useSWR(
		isOpen && templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);

	const detectedVars: MappedVariable[] = mapTemplateVariables(
		templateData?.variables ?? [],
	);

	useEffect(() => {
		if (!isOpen || detectedVars.length === 0) return;
		setVariableValues((prev) => {
			const next: Record<string, string> = {};
			for (const v of detectedVars) {
				next[v.name] = prev[v.name] ?? v.defaultValue ?? "";
			}
			return next;
		});
	}, [isOpen, templateData]);

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
			const html = editor
				? await getRenderedEmailHtml(editor, previewText)
				: undefined;
			const response = await fetch(`/api/template/v1/${templateId}/test`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					to: testEmail,
					fromEmail: fromEmail || undefined,
					subject: subject || undefined,
					html,
					variables: variableValues,
				}),
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error(
					result.why || result.message || "Failed to send test email",
				);
			}
			toast.success(`Test email sent to ${testEmail}`);
			setTestEmail("");
			onClose();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to send test email",
			);
		} finally {
			setSending(false);
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans sm:max-w-[440px]"
				showClose
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="play" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Send test email</Modal.Title>
						</div>
					</Modal.Header>

					<form onSubmit={handleSendTest}>
						<Modal.Body className="space-y-4">
							<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
								Send a live copy to see how this template renders in a real
								inbox.
							</p>

							{fromEmail ? (
								<div className="flex flex-col gap-1.5">
									<Label.Root htmlFor="test-recipient">
										Recipient
										<Label.Asterisk />
									</Label.Root>
									<Input.Root size="small" className="rounded-xl">
										<Input.Wrapper>
											<Input.Input
												id="test-recipient"
												type="email"
												required
												placeholder="name@domain.com"
												value={testEmail}
												onChange={(e) => setTestEmail(e.target.value)}
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							) : (
								<div className="flex items-start gap-2.5 rounded-xl border border-error-base/20 bg-error-lighter p-3">
									<Icon
										name="alert-circle"
										className="mt-0.5 h-4 w-4 shrink-0 text-error-base"
									/>
									<p className="text-error-base text-paragraph-xs leading-relaxed">
										Add a From address in send details before sending a test.
									</p>
								</div>
							)}

							{detectedVars.length > 0 ? (
								<div className="space-y-3">
									<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
										Variables
									</p>
									<div className="max-h-48 space-y-3 overflow-y-auto pr-1">
										{detectedVars.map((v) => (
											<div key={v.name} className="flex flex-col gap-1.5">
												<div className="flex items-center justify-between gap-2">
													<Label.Root
														htmlFor={`test-var-${v.name}`}
														className="font-medium text-text-strong-950 text-xs"
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
															id={`test-var-${v.name}`}
															type={v.type === "number" ? "number" : "text"}
															placeholder={
																v.defaultValue
																	? `Default: ${v.defaultValue}`
																	: "Enter value"
															}
															value={variableValues[v.name] ?? ""}
															onChange={(e) =>
																setVariableValues((prev) => ({
																	...prev,
																	[v.name]: e.target.value,
																}))
															}
														/>
													</Input.Wrapper>
												</Input.Root>
											</div>
										))}
									</div>
								</div>
							) : null}
						</Modal.Body>

						<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={onClose}
							>
								Cancel
								<KbdEsc />
							</Button.Root>
							<FancyButton.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={sending || !fromEmail}
								className="gap-1.5"
							>
								{sending ? (
									<>
										<Spinner size={13} />
										Sending...
									</>
								) : (
									"Send test"
								)}
							</FancyButton.Root>
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
