import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Tooltip from "@reloop/ui/tooltip";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
	siDotenv,
	siGo,
	siNodedotjs,
	siNpm,
	siPnpm,
	siPython,
	siRust,
	siYarn,
} from "simple-icons";
import { toast } from "sonner";
import * as v from "valibot";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { bunIcon } from "#/features/onboarding/step4/bun-icon";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyWithSecret } from "../types";

const createApiKeySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "API key name is required")),
});

type CreateApiKeyFormValues = {
	name: string;
};

type LanguageId = "nodejs" | "python" | "go" | "rust" | "curl";

const LANGUAGES = [
	{ id: "nodejs" as const, label: "Node.js", simpleIcon: siNodedotjs },
	{ id: "python" as const, label: "Python", simpleIcon: siPython },
	{ id: "go" as const, label: "Go", simpleIcon: siGo },
	{
		id: "rust" as const,
		label: "Rust",
		// Brand hex is #000000 — override so the gear stays visible on dark UI
		simpleIcon: { path: siRust.path, hex: "e24d2b", title: siRust.title },
	},
	{ id: "curl" as const, label: "cURL / REST", iconName: "terminal" },
];

const NODE_PKG_TABS = [
	{ id: "npm", label: "npm", si: siNpm },
	{ id: "pnpm", label: "pnpm", si: siPnpm },
	{ id: "yarn", label: "yarn", si: siYarn },
	{ id: "bun", label: "bun", si: bunIcon },
];

const INSTALL_COMMANDS: Record<LanguageId, Record<string, string>> = {
	nodejs: {
		npm: "npm install reloop-email",
		pnpm: "pnpm add reloop-email",
		yarn: "yarn add reloop-email",
		bun: "bun add reloop-email",
	},
	python: {
		pip: "pip install reloop-email",
	},
	go: {
		"go get": "go get github.com/reloop-labs/reloop-go/v2",
	},
	rust: {
		cargo: "cargo add reloop-email",
	},
	curl: {
		cURL: "curl --version",
	},
};

const LANG_ICONS = {
	nodejs: siNodedotjs,
	python: siPython,
	go: siGo,
	// Brand hex is #000000 — override so the gear stays visible on dark UI
	rust: { path: siRust.path, hex: "e24d2b" },
	curl: undefined,
};

const LANG_FILE_LABELS: Record<LanguageId, string> = {
	nodejs: "index.js",
	python: "main.py",
	go: "main.go",
	rust: "main.rs",
	curl: "cURL",
};

export function CreateApiKeyPage() {
	const router = useRouter();
	const { activeOrganization } = useActiveOrganization();
	const invalidate = useInvalidateApiKeys();
	const [isLoading, setIsLoading] = useState(false);
	const [createdApiKey, setCreatedApiKey] = useState<ApiKeyWithSecret | null>(
		null,
	);

	// Environment selection state
	const [selectedLang, setSelectedLang] = useState<LanguageId>("nodejs");
	const [selectedPkg, setSelectedPkg] = useState<string>("npm");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateApiKeyFormValues>({
		resolver: valibotResolver(createApiKeySchema),
		defaultValues: { name: "" },
	});

	// cacheComponents keeps this route mounted under React <Activity>.
	// Effects clean up/re-run when the page is hidden/shown, but useState does
	// not — so without an explicit reset, a prior success step (and secret key)
	// would reappear on the next visit.
	useEffect(() => {
		setCreatedApiKey(null);
		setIsLoading(false);
		setSelectedLang("nodejs");
		setSelectedPkg("npm");
		reset({ name: "" });

		return () => {
			setCreatedApiKey(null);
			setIsLoading(false);
		};
	}, [reset]);

	const handleCancel = () => {
		setCreatedApiKey(null);
		router.push("/api-keys");
	};

	const handleContinue = () => {
		const apiKeyId = createdApiKey?.id;
		setCreatedApiKey(null);
		if (apiKeyId) {
			router.push(`/api-keys/${apiKeyId}`);
		} else {
			router.push("/api-keys");
		}
	};

	const handleLangChange = (langId: LanguageId) => {
		setSelectedLang(langId);
		if (langId === "nodejs") {
			setSelectedPkg("npm");
		} else if (langId === "python") {
			setSelectedPkg("pip");
		} else if (langId === "go") {
			setSelectedPkg("go get");
		} else if (langId === "rust") {
			setSelectedPkg("cargo");
		} else {
			setSelectedPkg("cURL");
		}
	};

	const onSubmit = async (data: CreateApiKeyFormValues) => {
		if (!activeOrganization?.id) return;
		try {
			setIsLoading(true);
			const response = await axios.post<ApiKeyWithSecret>(
				"/api/api-key/v1/",
				{ name: data.name },
				{ withCredentials: true },
			);
			await invalidate();
			setCreatedApiKey(response.data);
			toast.success("API key created successfully");
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to create API key"
				: "Failed to create API key";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	const installCommands = INSTALL_COMMANDS[selectedLang];
	const currentInstallCmd =
		installCommands[selectedPkg] ??
		Object.values(installCommands)[0] ??
		"npm install reloop-email";

	const activeKeyValue = createdApiKey?.key || "rl_live_your_api_key_here";

	const getCodeSnippet = (): string => {
		switch (selectedLang) {
			case "nodejs":
				return `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "${activeKeyValue}" });

await reloop.emails.send({
  from: "onboarding@reloop.sh",
  to: "user@example.com",
  subject: "Hello from Reloop",
  html: "<p>Welcome to Reloop!</p>"
});`;
			case "python":
				return `import os
from reloop import Reloop

reloop = Reloop(api_key="${activeKeyValue}")

reloop.emails.send(
    from_email="onboarding@reloop.sh",
    to=["user@example.com"],
    subject="Hello from Reloop",
    html="<p>Welcome to Reloop!</p>"
)`;
			case "go":
				return `package main

import (
    "github.com/reloop-labs/reloop-go/v2"
)

func main() {
    client := reloop.NewClient("${activeKeyValue}")
    _, err := client.Emails.Send(&reloop.SendEmailRequest{
        From:    "onboarding@reloop.sh",
        To:      []string{"user@example.com"},
        Subject: "Hello from Reloop",
        Text:    "Welcome to Reloop!",
    })
}`;
			case "rust":
				return `use reloop_email::Reloop;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std.error::Error>> {
    let client = Reloop::new("${activeKeyValue}");
    client.emails().send(
        "onboarding@reloop.sh",
        "user@example.com",
        "Hello from Reloop",
        "Welcome to Reloop!"
    ).await?;
    Ok(())
}`;
			case "curl":
			default:
				return `curl -X POST https://api.reloop.sh/v1/emails \\
  -H "Authorization: Bearer ${activeKeyValue}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "onboarding@reloop.sh",
    "to": "user@example.com",
    "subject": "Hello from Reloop",
    "html": "<p>Welcome to Reloop!</p>"
  }'`;
		}
	};

	return (
		<div className="mx-auto max-w-xl px-6 py-12">
			{!createdApiKey ? (
				/* Phase 1: Create Form */
				<form onSubmit={handleSubmit(onSubmit)}>
					{/* Header Section */}
					<div>
						<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Create an API key
						</h1>
						<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
							Create keys to send email from your app over the API or SMTP.{" "}
						</p>
					</div>

					{/* Field */}
					<div className="space-y-2 pt-7">
						<div className="flex items-center gap-1.5">
							<Label.Root htmlFor="api-key-name">
								API key name
								<Label.Asterisk />
							</Label.Root>
							<Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger type="button" tabIndex={-1}>
										<Icon
											name="info"
											className="h-4 w-4 text-text-soft-400 transition-colors hover:text-text-sub-600"
										/>
									</Tooltip.Trigger>
									<Tooltip.Content side="top" size="small">
										Enter a unique name to identify this key
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>
						</div>

						<Input.Root size="medium" hasError={!!errors.name}>
							<Input.Wrapper>
								<Input.Input
									id="api-key-name"
									placeholder="Enter API key name"
									autoFocus
									{...register("name")}
									disabled={isLoading}
								/>
							</Input.Wrapper>
						</Input.Root>

						{errors.name && (
							<p className="text-error-base text-paragraph-xs">
								{errors.name.message}
							</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-3 pt-5">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							disabled={isLoading}
							className="rounded-xl"
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="submit"
							variant="blue"
							size="small"
							disabled={isLoading}
							className={cn(
								"min-w-[134px] justify-center overflow-hidden rounded-xl transition-all duration-200",
								isLoading && "pointer-events-none opacity-90",
							)}
						>
							<AnimatePresence mode="popLayout" initial={false}>
								<motion.span
									key={isLoading ? "creating" : "idle"}
									transition={{
										type: "spring",
										duration: 0.25,
										bounce: 0,
									}}
									initial={{
										opacity: 0,
										y: -14,
									}}
									animate={{
										opacity: 1,
										y: 0,
									}}
									exit={{
										opacity: 0,
										y: 14,
									}}
									className="flex items-center justify-center gap-1.5"
								>
									{isLoading ? (
										<>
											<Spinner size={14} color="currentColor" />
											<span>Creating...</span>
										</>
									) : (
										"Create API key"
									)}
								</motion.span>
							</AnimatePresence>
						</FancyButton.Root>
					</div>
				</form>
			) : (
				/* Phase 2: After Creation Setup Screen */
				<div className="space-y-7">
					{/* Header */}
					<div className="space-y-2">
						<div>
							<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								API Key
							</h1>
							<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
								Your key is generated. Save this secret key now — for security,
								you won't be able to see it again after leaving this page.
							</p>
						</div>

						{/* Secret Key Display Box using CopyCodeBlock */}
						<CopyCodeBlock
							code={createdApiKey.key}
							lang="bash"
							copyValue={createdApiKey.key}
							label="secret key"
							minHeight="auto"
						/>
					</div>

					{/* Timeline Steps */}
					<div className="space-y-6">
						{/* Step 1: Language selection */}
						<div className="space-y-2">
							<h3 className="font-medium text-sm text-text-strong-950">
								Choose your language
							</h3>
							<div className="flex flex-wrap gap-2 pt-1">
								{LANGUAGES.map((lang) => {
									const isSelected = selectedLang === lang.id;
									return isSelected ? (
										<FancyButton.Root
											key={lang.id}
											type="button"
											variant="blue"
											size="xsmall"
											onClick={() => handleLangChange(lang.id)}
											className="gap-1.5 rounded-xl"
										>
											{lang.simpleIcon ? (
												<svg
													role="img"
													viewBox="0 0 24 24"
													width={13}
													height={13}
													aria-hidden
													className="shrink-0"
													fill="#FFFFFF"
												>
													<path d={lang.simpleIcon.path} />
												</svg>
											) : (
												<Icon
													name={lang.iconName || "terminal"}
													className="h-3.5 w-3.5 shrink-0 text-white"
												/>
											)}
											{lang.label}
										</FancyButton.Root>
									) : (
										<Button.Root
											key={lang.id}
											type="button"
											variant="neutral"
											mode="stroke"
											size="xsmall"
											onClick={() => handleLangChange(lang.id)}
											className="gap-1.5 rounded-xl"
										>
											{lang.simpleIcon ? (
												<svg
													role="img"
													viewBox="0 0 24 24"
													width={13}
													height={13}
													aria-hidden
													className="shrink-0 text-text-strong-950 dark:text-white"
													fill="currentColor"
												>
													<path d={lang.simpleIcon.path} />
												</svg>
											) : (
												<Icon
													name={lang.iconName || "terminal"}
													className="h-3.5 w-3.5 shrink-0 text-text-strong-950 dark:text-white"
												/>
											)}
											{lang.label}
										</Button.Root>
									);
								})}
							</div>
						</div>

						{/* Step 2: Install SDK with Package Manager tabs inside CopyCodeBlock */}
						<div className="space-y-2">
							<h3 className="font-medium text-sm text-text-strong-950">
								Install the Reloop SDK
							</h3>
							<CopyCodeBlock
								code={currentInstallCmd}
								lang="bash"
								label={selectedLang === "nodejs" ? undefined : selectedPkg}
								tabs={selectedLang === "nodejs" ? NODE_PKG_TABS : undefined}
								activeTab={selectedLang === "nodejs" ? selectedPkg : undefined}
								onTabChange={
									selectedLang === "nodejs"
										? (id) => setSelectedPkg(id)
										: undefined
								}
								minHeight="auto"
							/>
						</div>

						{/* Step 3: Add API key to .env */}
						<div className="space-y-2">
							<h3 className="font-medium text-sm text-text-strong-950">
								Add your API key to .env
							</h3>
							<CopyCodeBlock
								code={`RELOOP_API_KEY=${createdApiKey.key}`}
								lang="bash"
								copyValue={`RELOOP_API_KEY=${createdApiKey.key}`}
								label=".env"
								si={siDotenv}
								minHeight="auto"
							/>
						</div>

						{/* Step 4: Code snippet */}
						<div className="space-y-2">
							<h3 className="font-medium text-sm text-text-strong-950">
								Send your first request
							</h3>
							<CopyCodeBlock
								code={getCodeSnippet()}
								lang={
									selectedLang === "nodejs"
										? "javascript"
										: selectedLang === "curl"
											? "bash"
											: selectedLang
								}
								label={LANG_FILE_LABELS[selectedLang]}
								si={LANG_ICONS[selectedLang]}
								minHeight="auto"
							/>
						</div>
					</div>

					{/* Action Bar Footer */}
					<div className="flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							className="rounded-xl"
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="blue"
							size="small"
							onClick={handleContinue}
							className="rounded-xl"
						>
							Continue
						</FancyButton.Root>
					</div>
				</div>
			)}
		</div>
	);
}
