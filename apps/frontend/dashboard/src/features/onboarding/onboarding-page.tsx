import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useEffect } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { useSessionQuery } from "#/features/auth/session-query";
import { DomainPreview } from "./domain-preview";
import { SidebarPreview } from "./sidebar-preview";
import { SplitLayout } from "./split-layout";
import { CreateOrgStep } from "./step1/create-org-step";
import { AddDomainStep } from "./step2/add-domain-step";
import { ConfigureDnsStep } from "./step3/configure-dns-step";
import { GenerateApiKeyStep } from "./step4/generate-api-key-step";

export function OnboardingPage() {
	const navigate = useNavigate();
	const { data: session, isPending } = useSessionQuery();
	const [step] = useQueryState("step", parseAsInteger.withDefault(1));
	const [name] = useQueryState("name", parseAsString.withDefault(""));
	const [logoUrl] = useQueryState("logoUrl", parseAsString.withDefault(""));
	const [domain, setDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [, setDomainId] = useQueryState(
		"domainId",
		parseAsString.withDefault(""),
	);
	const [, setApiKey] = useQueryState("apiKey", parseAsString.withDefault(""));
	const [, setLang] = useQueryState("lang", parseAsString.withDefault(""));
	const [, setMode] = useQueryState("mode", parseAsString.withDefault(""));
	const [skippedDns, setSkippedDns] = useQueryState(
		"skippedDns",
		parseAsString.withDefault(""),
	);

	useEffect(() => {
		if (isPending) return;
		if (!session) {
			void navigate({ to: "/login", search: { inviteId: undefined } });
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return (
			<SplitLayout
				stepIndicator="Step 1 of 4"
				title="Create your workspace"
				previewContent={
					<div className="flex h-full flex-col gap-4 p-8">
						<Skeleton className="h-8 w-1/3 rounded-lg" />
						<Skeleton className="h-full w-full rounded-2xl" />
					</div>
				}
			>
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Skeleton className="h-[72px] w-[72px] rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-32 rounded" />
							<Skeleton className="h-3 w-48 rounded" />
						</div>
					</div>
					<div className="space-y-3.5 pt-6">
						<div className="flex flex-col gap-1">
							<Skeleton className="h-4 w-24 rounded" />
							<Skeleton className="h-10 w-full rounded-lg" />
						</div>
						<div className="flex flex-col gap-1">
							<Skeleton className="h-4 w-32 rounded" />
							<Skeleton className="h-10 w-full rounded-lg" />
						</div>
					</div>
					<Skeleton className="mt-6 h-11 w-full rounded-xl" />
				</div>
			</SplitLayout>
		);
	}

	if (!session) {
		return <AuthSessionLoader />;
	}

	const stepCleanup: Record<number, () => void> = {
		2: () => {
			setDomain(null);
			setDomainId(null);
		},
		3: () => {
			setDomainId(null);
		},
		4: () => {
			setApiKey(null);
			setLang(null);
			setMode(null);
			setSkippedDns(null);
		},
	};

	const backStep = step === 4 && skippedDns === "true" ? 2 : undefined;

	const stepsConfig: Record<
		number,
		{
			stepIndicator: string;
			title?: string;
			component: React.ReactNode;
			preview: React.ReactNode;
			fullWidth: boolean;
			maxWidth?: "3xl" | "4xl" | "5xl";
			verticalAlign?: "center" | "start";
		}
	> = {
		1: {
			stepIndicator: "Step 1 of 4",
			title: "Create your workspace",
			component: <CreateOrgStep />,
			preview: <SidebarPreview name={name} logo={logoUrl || null} />,
			fullWidth: false,
		},
		2: {
			stepIndicator: "Step 2 of 4",
			title: "Add Domain",
			component: <AddDomainStep />,
			preview: <DomainPreview domain={domain} logoUrl={logoUrl || undefined} />,
			fullWidth: false,
		},
		3: {
			stepIndicator: "Step 3 of 4",
			title: "Configure DNS",
			component: <ConfigureDnsStep />,
			preview: null,
			fullWidth: true,
			maxWidth: "3xl",
		},
		4: {
			stepIndicator: "Step 4 of 4",
			title: "Generate API key",
			component: <GenerateApiKeyStep />,
			preview: null,
			fullWidth: true,
			maxWidth: "3xl",
			verticalAlign: "start",
		},
	};

	const currentConfig = stepsConfig[step as keyof typeof stepsConfig];

	if (!currentConfig) {
		return null;
	}

	return (
		<SplitLayout
			stepIndicator={currentConfig.stepIndicator}
			title={currentConfig.title}
			previewContent={currentConfig.preview}
			fullWidth={currentConfig.fullWidth}
			previewSize="medium"
			maxWidth={currentConfig.maxWidth}
			onBack={stepCleanup[step]}
			backStep={backStep}
			verticalAlign={currentConfig.verticalAlign}
		>
			{currentConfig.component}
		</SplitLayout>
	);
}
