import { config as ai_agent_inbox } from "./ai-agent-inbox";
import { config as automated_email } from "./automated-email";
import { config as email_verification } from "./email-verification";
import { config as inbound_email } from "./inbound-email";
import { config as order_confirmation_email } from "./order-confirmation-email";
import { config as password_reset_email } from "./password-reset-email";
import { config as payment_receipt_email } from "./payment-receipt-email";
import { config as system_monitoring_email } from "./system-monitoring-email";
import { config as transactional_email } from "./transactional-email";
import { config as welcome_email } from "./welcome-email";

export const useCaseConfigs = [
	transactional_email,
	automated_email,
	ai_agent_inbox,
	inbound_email,
	system_monitoring_email,
	password_reset_email,
	welcome_email,
	order_confirmation_email,
	email_verification,
	payment_receipt_email,
];
