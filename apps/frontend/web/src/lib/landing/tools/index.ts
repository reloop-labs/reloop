import { config as auth_checker } from "./auth-checker";
import { config as blocklist_checker } from "./blocklist-checker";
import { config as deliverability_tester } from "./deliverability-tester";
import { config as dns_lookup } from "./dns-lookup";
import { config as email_spam_words_checker } from "./email-spam-words-checker";
import { config as email_validator } from "./email-validator";
import { config as mobile_preview } from "./mobile-preview";
import { config as spoof_checker } from "./spoof-checker";
import { config as subject_tester } from "./subject-tester";
import { config as temp_email_checker } from "./temp-email-checker";
import { config as template_generator } from "./template-generator";

export const toolConfigs = [
	dns_lookup,
	spoof_checker,
	email_spam_words_checker,
	blocklist_checker,
	temp_email_checker,
	email_validator,
	deliverability_tester,
	template_generator,
	auth_checker,
	subject_tester,
	mobile_preview,
];


