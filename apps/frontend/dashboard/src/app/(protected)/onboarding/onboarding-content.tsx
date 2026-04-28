"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import Spinner from "@reloop/ui/spinner";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useEffect } from "react";

import { DomainPreview } from "./components/domain-preview";
import { SidebarPreview } from "./components/sidebar-preview";

import { SplitLayout } from "./components/split-layout";
import { AddDomainStep } from "./steps/add-domain";
import { ConfigureDnsStep } from "./steps/configure-dns";
import { CreateOrgStep } from "./steps/create-org";
import { GenerateApiKeyStep } from "./steps/generate-api-key/generate-api-key";

export const OnBoardingContent = () => {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();
	const [step] = useQueryState("step", parseAsInteger.withDefault(1));
	const [name] = useQueryState("name", parseAsString.withDefault(""));
	const [logoPreview] = useQueryState(
		"logoPreview",
		parseAsString.withDefault(""),
	);
	const [logoUrl] = useQueryState("logoUrl", parseAsString.withDefault(""));
	const [domain, setDomain] = useQueryState("domain", parseAsString.withDefault(""));
	const [domainId, setDomainId] = useQueryState("domainId", parseAsString.withDefault(""));
	const [, setApiKey] = useQueryState("apiKey", parseAsString.withDefault(""));
	const [, setLang] = useQueryState("lang", parseAsString.withDefault(""));

	useEffect(() => {
		if (!isPending && !session) {
			router.push("/login");
		}
	}, [session, isPending, router]);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner size={32} />
			</div>
		);
	}

	// Don't render content if not authenticated
	if (!session) {
		return null;
	}

	// Params to clear when navigating back from each step
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
		},
	};

	const stepsConfig: Record<
		number,
		{
			stepIndicator: string;
			title?: string;
			component: React.ReactNode;
			preview: React.ReactNode;
			fullWidth: boolean;
			maxWidth?: "3xl" | "4xl" | "5xl";
		}
	> = {
		1: {
			stepIndicator: "Step 1 of 4",
			title: "Create your workspace",
			component: <CreateOrgStep />,
			preview: <SidebarPreview name={name} logo={logoPreview || null} />,
			fullWidth: false,
		},
		2: {
			stepIndicator: "Step 2 of 4",
			title: "Add Domain",
			component: <AddDomainStep />,
			preview: <DomainPreview domain={domain} logoUrl={logoUrl} />,
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
			component: <GenerateApiKeyStep />,
			preview: null,
			fullWidth: true,
			maxWidth: "3xl",
		},
	};

	if (step === 5) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bg-white-0 p-4">
				<div className="zoom-in max-w-md animate-in text-center duration-500">
					<div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-success-lighter text-success-base">
						<CheckCircle2 size={48} />
					</div>
					<h2 className="mb-4 font-bold text-3xl text-text-strong-950">
						Setup Complete!
					</h2>
					<p className="mb-8 text-lg text-text-sub-600">
						Your workspace{" "}
						<span className="font-semibold text-text-strong-950">{name}</span>{" "}
						is ready. Redirecting you to the dashboard...
					</p>
					<Button.Root variant="neutral" mode="filled" className="w-full">
						Go to Dashboard
					</Button.Root>
				</div>
			</div>
		);
	}

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
		>
			{currentConfig.component}
		</SplitLayout>
	);
};
