import type { ComponentType } from "react";
import { AiGenerateTransactionalEmailTemplatesArt } from "./ai-generate-transactional-email-templates";
import { BimiEmailSetupGuideArt } from "./bimi-email-setup-guide";
import { BuildAiAgentSendsEmailsArt } from "./build-ai-agent-sends-emails";
import { BuildingInPublicLessonsArt } from "./building-in-public-lessons";
import { BuildingWebhookDeliverySystemArt } from "./building-webhook-delivery-system";
import { EmailBounceProcessingAutomationArt } from "./email-bounce-processing-automation";
import { EmailProviderComparison2026Art } from "./email-provider-comparison-2026";
import { EmailReduceChurnSequencesArt } from "./email-reduce-churn-sequences";
import { HowWeBuiltEmailDeliveryQueueBullmqArt } from "./how-we-built-email-delivery-queue-bullmq";
import { IpWarmingGuideArt } from "./ip-warming-guide";
import { MigratingFromSendgridArt } from "./migrating-from-sendgrid";
import { ReloopCoolifySetupArt } from "./reloop-coolify-setup";
import { ReloopFlyioDeploymentArt } from "./reloop-flyio-deployment";
import { SelfHostEmail5DollarsArt } from "./self-host-email-5-dollars";
import { SelfHostedEmailInfrastructureArt } from "./self-hosted-email-infrastructure";
import { SendEmailCloudflareWorkersArt } from "./send-email-cloudflare-workers";
import { SendEmailNextjsAppRouterArt } from "./send-email-nextjs-app-router";
import { SendEmailRemixArt } from "./send-email-remix";
import { SendEmailSveltekitArt } from "./send-email-sveltekit";
import { SpfDkimDmarcSetupGuideArt } from "./spf-dkim-dmarc-setup-guide";
import { TransactionalEmailAsGrowthChannelArt } from "./transactional-email-as-growth-channel";
import { TransactionalEmailBestPracticesArt } from "./transactional-email-best-practices";
import type { BlogPostArtProps } from "./types";
import { VercelAiSdkReloopNotificationsArt } from "./vercel-ai-sdk-reloop-notifications";
import { WelcomeEmailSequencesThatConvertArt } from "./welcome-email-sequences-that-convert";
import { WhyEmailsLandInSpamFixArt } from "./why-emails-land-in-spam-fix";
import { WhyWeOpenSourcedEmailInfrastructureArt } from "./why-we-open-sourced-email-infrastructure";

export const blogPostArtRegistry: Record<
	string,
	ComponentType<BlogPostArtProps>
> = {
	"ai-generate-transactional-email-templates":
		AiGenerateTransactionalEmailTemplatesArt,
	"bimi-email-setup-guide": BimiEmailSetupGuideArt,
	"build-ai-agent-sends-emails": BuildAiAgentSendsEmailsArt,
	"building-in-public-lessons": BuildingInPublicLessonsArt,
	"building-webhook-delivery-system": BuildingWebhookDeliverySystemArt,
	"email-bounce-processing-automation": EmailBounceProcessingAutomationArt,
	"email-provider-comparison-2026": EmailProviderComparison2026Art,
	"email-reduce-churn-sequences": EmailReduceChurnSequencesArt,
	"how-we-built-email-delivery-queue-bullmq":
		HowWeBuiltEmailDeliveryQueueBullmqArt,
	"ip-warming-guide": IpWarmingGuideArt,
	"migrating-from-sendgrid": MigratingFromSendgridArt,
	"reloop-coolify-setup": ReloopCoolifySetupArt,
	"reloop-flyio-deployment": ReloopFlyioDeploymentArt,
	"self-host-email-5-dollars": SelfHostEmail5DollarsArt,
	"self-hosted-email-infrastructure": SelfHostedEmailInfrastructureArt,
	"send-email-cloudflare-workers": SendEmailCloudflareWorkersArt,
	"send-email-nextjs-app-router": SendEmailNextjsAppRouterArt,
	"send-email-remix": SendEmailRemixArt,
	"send-email-sveltekit": SendEmailSveltekitArt,
	"spf-dkim-dmarc-setup-guide": SpfDkimDmarcSetupGuideArt,
	"transactional-email-as-growth-channel":
		TransactionalEmailAsGrowthChannelArt,
	"transactional-email-best-practices": TransactionalEmailBestPracticesArt,
	"vercel-ai-sdk-reloop-notifications": VercelAiSdkReloopNotificationsArt,
	"welcome-email-sequences-that-convert": WelcomeEmailSequencesThatConvertArt,
	"why-emails-land-in-spam-fix": WhyEmailsLandInSpamFixArt,
	"why-we-open-sourced-email-infrastructure":
		WhyWeOpenSourcedEmailInfrastructureArt,
};

export function getBlogPostArt(slug: string) {
	return blogPostArtRegistry[slug] ?? null;
}
