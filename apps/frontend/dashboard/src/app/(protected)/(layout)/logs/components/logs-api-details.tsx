"use client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";
import { useApiLanguage } from "@fe/dashboard/hooks/use-api-language";
import { useHotkeys } from "react-hotkeys-hook";
import {
	siCurl,
	siDotnet,
	siGo,
	siNodedotjs,
	siOpenjdk,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { toast } from "sonner";

const langIcons: Record<string, { svg: string }> = {
	nodejs: siNodedotjs,
	ruby: siRuby,
	php: siPhp,
	python: siPython,
	go: siGo,
	rust: siRust,
	java: siOpenjdk,
	dotnet: siDotnet,
	curl: siCurl,
};

const codeExamples = {
	nodejs: {
		list: {
			filename: "list_logs.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop({ key: 're_xxxxxxxx' });

const { data } = await reloop.logs.list({
  page: 1,
  limit: 25,
  service: 'api-gateway'
});`,
		},
		get: {
			filename: "get_log.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop({ key: 're_xxxxxxxx' });

const { data } = await reloop.logs.get('log_xxxxxxxx');`,
		},
	},
	python: {
		list: {
			filename: "list_logs.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key='re_xxxxxxxx')

data = reloop.logs.list(
    page=1,
    limit=25,
    service='api-gateway'
)`,
		},
		get: {
			filename: "get_log.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key='re_xxxxxxxx')

data = reloop.logs.get('log_xxxxxxxx')`,
		},
	},
	curl: {
		list: {
			filename: "list_logs.sh",
			code: `curl "https://api.reloop.sh/api/logs/v1/list?page=1&limit=25" \\
  -H "Authorization: Bearer re_xxxxxxxx"`,
		},
		get: {
			filename: "get_log.sh",
			code: `curl https://api.reloop.sh/api/logs/v1/log_xxxxxxxx \\
  -H "Authorization: Bearer re_xxxxxxxx"`,
		},
	},
};

const operations = [
	{ id: "list", label: "List Logs" },
	{ id: "get", label: "Get Log" },
] as const;

const languages = [
	{ id: "nodejs", label: "Node.js", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "curl", label: "cURL", shikiLang: "bash" },
] as const;

type Language = keyof typeof codeExamples;

export const LogsApiDetails = (
	props: React.ComponentPropsWithoutRef<typeof Button.Root>,
) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useApiLanguage<Language>(
		languages.map((l) => l.id),
		"nodejs",
	);
	const [copiedOp, setCopiedOp] = useState<string | null>(null);

	useHotkeys("a", (e) => {
		e.preventDefault();
		setIsOpen(true);
	});

	const {
		variant = "neutral",
		mode = "ghost",
		size = "xxsmall",
		className,
		...rest
	} = props;



	const copySnippet = useCallback(
		async (operationId: string) => {
			try {
				const example =
					codeExamples[selectedLanguage][
						operationId as keyof (typeof codeExamples)[Language]
					];
				await navigator.clipboard.writeText(example.code);
				setCopiedOp(operationId);
				setTimeout(() => setCopiedOp(null), 2000);
			} catch {
				toast.error("Failed to copy code snippet");
			}
		},
		[selectedLanguage],
	);

	return (
		<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<Drawer.Trigger asChild>
							<Button.Root
								variant={variant}
								size={size}
								mode={mode}
								className={cn(
									"aspect-square p-0",
									isOpen && "bg-bg-weak-50",
									className,
								)}
								{...rest}
							>
								<Icon name="code" className="h-4 w-4" />
							</Button.Root>
						</Drawer.Trigger>
					</Tooltip.Trigger>
					<Tooltip.Content className="flex items-center gap-2 rounded-lg">
						<p className="font-medium text-label-sm">Logs API</p>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							A
						</span>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<Drawer.Content className="max-w-[560px]">
				<Drawer.Header
					className="border-stroke-soft-200 border-b"
					showCloseButton={false}
				>
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Logs API</Drawer.Title>
						<p className="text-paragraph-xs text-text-sub-600">
							Search and retrieve logs programmatically.
						</p>
					</div>
					<Drawer.Close asChild>
						<button
							type="button"
							className="self-start rounded-lg border border-stroke-soft-200 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
							aria-label="Close"
						>
							<Icon name="cross" className="h-4 w-4" />
						</button>
					</Drawer.Close>
				</Drawer.Header>

				<Drawer.Body className="flex flex-col gap-8 p-6">


					<div className="flex gap-2 overflow-x-auto">
						{languages.map((lang) => {
							const icon = langIcons[lang.id];
							return (
								<button
									type="button"
									key={lang.id}
									onClick={() => setSelectedLanguage(lang.id)}
									className={cn(
										"flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium text-[13px] transition-all duration-200",
										selectedLanguage === lang.id
											? "border-text-strong-950 bg-text-strong-950 text-static-white shadow-sm"
											: "border-stroke-soft-200 text-text-sub-600 hover:border-stroke-strong-950 hover:text-text-strong-950",
									)}
								>
									{icon && (
										<span
											className="flex h-4 w-4 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5"
											dangerouslySetInnerHTML={{
												__html: icon.svg.replace(
													"<svg",
													'<svg fill="currentColor"',
												),
											}}
										/>
									)}
									{lang.label}
								</button>
							);
						})}
					</div>

					{operations.map((op) => {
						const example =
							codeExamples[selectedLanguage][
								op.id as keyof (typeof codeExamples)[Language]
							];
						const isCopied = copiedOp === op.id;

						return (
							<div key={op.id} className="flex flex-col gap-3">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold text-sm text-text-strong-950">
										{op.label}
									</h4>
									<button
										type="button"
										onClick={() => copySnippet(op.id)}
										className="flex items-center gap-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
									>
										<Icon
											name={isCopied ? "check" : "copy"}
											className={cn(
												"h-3.5 w-3.5",
												isCopied && "text-success-base",
											)}
										/>
										{isCopied ? "Copied" : "Copy"}
									</button>
								</div>
								<CodeBlock
									code={example?.code || ""}
									lang={
										languages.find((l) => l.id === selectedLanguage)
											?.shikiLang || "javascript"
									}
								/>
							</div>
						);
					})}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
