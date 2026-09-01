import { config as auth_checker } from "./auth-checker";
import { config as bimi_checker } from "./bimi-checker";
import { config as blocklist_checker } from "./blocklist-checker";
import { config as deliverability_tester } from "./deliverability-tester";
import { config as dkim_generator } from "./dkim-generator";
import { config as dmarc_generator } from "./dmarc-generator";
import { config as dns_lookup } from "./dns-lookup";
import { config as email_spam_words_checker } from "./email-spam-words-checker";
import { config as email_validator } from "./email-validator";
import { config as mobile_preview } from "./mobile-preview";
import { config as spf_generator } from "./spf-generator";
import { config as subject_tester } from "./subject-tester";
import { config as temp_email_checker } from "./temp-email-checker";
import { config as template_generator } from "./template-generator";

export const toolConfigs = [
	dns_lookup,
	email_spam_words_checker,
	blocklist_checker,
	temp_email_checker,
	email_validator,
	deliverability_tester,
	auth_checker,
	bimi_checker,
	spf_generator,
	dkim_generator,
	dmarc_generator,
	template_generator,
	subject_tester,
	mobile_preview,
];
