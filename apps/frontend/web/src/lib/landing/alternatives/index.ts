import { config as resend } from "./resend";
import { config as sendgrid } from "./sendgrid";
import { config as mailgun } from "./mailgun";
import { config as aws_ses } from "./aws-ses";
import { config as postmark } from "./postmark";
import { config as mailchimp } from "./mailchimp";
import { config as loops } from "./loops";

export const alternativeConfigs = [
	resend,
	sendgrid,
	mailgun,
	aws_ses,
	postmark,
	mailchimp,
	loops,
];
