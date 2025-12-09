"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import Spinner from "@reloop/ui/spinner";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import {
  ApiPreview,
  DnsConfigPreview,
  DomainPreview,
  SidebarPreview,
} from "./components/previews";
import { SplitLayout } from "./components/split-layout";
import { AddDomainStep } from "./steps/add-domain";
import { ConfigureDnsStep } from "./steps/configure-dns";
import { CreateOrgStep } from "./steps/create-org";
import { GenerateApiKeyStep } from "./steps/generate-api-key";

export const OnBoardingContent = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [step] = useQueryState("step", parseAsInteger.withDefault(1));
  const [name] = useQueryState("name", parseAsString.withDefault(""));
  const [slug] = useQueryState("slug", parseAsString.withDefault(""));
  const [logoPreview] = useQueryState(
    "logoPreview",
    parseAsString.withDefault(""),
  );
  const [logoUrl] = useQueryState("logoUrl", parseAsString.withDefault(""));
  const [apiKey] = useQueryState("apiKey", parseAsString.withDefault(""));
  const [domain] = useQueryState("domain", parseAsString.withDefault(""));

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

  // Configuration for each step
  const stepsConfig = {
    1: {
      stepIndicator: "1/4",
      title: "Create your workspace",
      component: <CreateOrgStep />,
      preview: (
        <SidebarPreview name={name} slug={slug} logo={logoPreview || null} />
      ),
      fullWidth: false,
    },
    2: {
      stepIndicator: "2/4",
      title: "Add Domain",
      component: <AddDomainStep />,
      preview: <DomainPreview domain={domain} logoUrl={logoUrl} />,
      fullWidth: false,
    },
    3: {
      stepIndicator: "3/4",
      title: "Configure DNS",
      component: <ConfigureDnsStep />,
      preview: <DnsConfigPreview domain={domain} />,
      fullWidth: true,
    },
    4: {
      stepIndicator: "4/4",
      title: "Generate API Credentials",
      component: <GenerateApiKeyStep />,
      preview: <ApiPreview apiKey={apiKey} />,
      fullWidth: false,
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
    >
      {currentConfig.component}
    </SplitLayout>
  );
};
