import { config as auth_checker } from "./auth-checker";
import { config as deliverability_tester } from "./deliverability-tester";
import { config as email_validator } from "./email-validator";
import { config as mobile_preview } from "./mobile-preview";
import { config as subject_tester } from "./subject-tester";
import { config as template_generator } from "./template-generator";

export const toolConfigs = [
	email_validator,
	deliverability_tester,
	template_generator,
	auth_checker,
	subject_tester,
	mobile_preview,
];
