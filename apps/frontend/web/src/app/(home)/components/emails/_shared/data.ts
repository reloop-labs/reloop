export interface EmailItem {
	id: string;
	to: string;
	subject: string;
	status: string;
	time: string;
}

export const emailGridStyle = {
	gridTemplateColumns:
		"32px minmax(0, 1.2fr) minmax(0, 1.8fr) 120px 110px 32px",
};

export const INITIAL_EMAILS: EmailItem[] = [
	{
		id: "em_01",
		to: "maya@northwind.io",
		subject: "Welcome to Acme",
		status: "delivered",
		time: "2 min ago",
	},
	{
		id: "em_02",
		to: "alex@orbit.dev",
		subject: "Reset your password",
		status: "opened",
		time: "11 min ago",
	},
	{
		id: "em_03",
		to: "billing@northwind.io",
		subject: "Invoice #1024 is ready",
		status: "delivered",
		time: "28 min ago",
	},
	{
		id: "em_04",
		to: "team@lumen.app",
		subject: "Confirm your email",
		status: "clicked",
		time: "1 hour ago",
	},
	{
		id: "em_05",
		to: "jordan@harbor.co",
		subject: "Your order has shipped",
		status: "delivered",
		time: "2 hours ago",
	},
	{
		id: "em_06",
		to: "priya@folio.io",
		subject: "Weekly usage report",
		status: "sent",
		time: "4 hours ago",
	},
	{
		id: "em_07",
		to: "nina@stackline.dev",
		subject: "Security alert for your account",
		status: "bounced",
		time: "6 hours ago",
	},
	{
		id: "em_08",
		to: "hello@pixeland.co",
		subject: "Payment receipt",
		status: "failed",
		time: "1 day ago",
	},
	{
		id: "em_09",
		to: "sam@harbor.co",
		subject: "Your trial ends tomorrow",
		status: "opened",
		time: "1 day ago",
	},
	{
		id: "em_10",
		to: "ops@reloop.sh",
		subject: "Domain verified — mail.acme.com",
		status: "delivered",
		time: "2 days ago",
	},
];

export const INCOMING_STREAM_POOL: Omit<EmailItem, "id" | "time">[] = [
	{
		to: "sarah@vertex.io",
		subject: "Your API key has been created",
		status: "delivered",
	},
	{
		to: "dev@linear.app",
		subject: "Security alert: New login from macOS",
		status: "opened",
	},
	{
		to: "mira@hyper.co",
		subject: "Invoice #2049 has been paid",
		status: "delivered",
	},
	{
		to: "lucas@supabase.io",
		subject: "Confirm your magic link to log in",
		status: "clicked",
	},
	{
		to: "kate@resend.com",
		subject: "Domain verified — mail.acme.com",
		status: "delivered",
	},
	{
		to: "liam@cursor.sh",
		subject: "Weekly usage summary: 2.4M sends",
		status: "sent",
	},
	{
		to: "elena@clerk.dev",
		subject: "One-time passcode: 849-201",
		status: "delivered",
	},
	{
		to: "hugo@prisma.io",
		subject: "Subscription upgraded to Pro",
		status: "opened",
	},
	{
		to: "zoe@stripe.com",
		subject: "Payment of $14,280.00 confirmed",
		status: "delivered",
	},
	{
		to: "noah@vercel.com",
		subject: "Production deployment finished",
		status: "clicked",
	},
	{
		to: "chloe@raycast.com",
		subject: "Welcome to Acme Enterprise",
		status: "delivered",
	},
	{
		to: "felix@posthog.com",
		subject: "Monthly event limit threshold (80%)",
		status: "opened",
	},
];

const AVATAR_GRADIENTS = [
	"from-rose-500 to-pink-600",
	"from-pink-500 to-fuchsia-600",
	"from-fuchsia-500 to-purple-600",
	"from-purple-500 to-indigo-600",
	"from-indigo-500 to-blue-600",
	"from-blue-500 to-cyan-600",
	"from-cyan-500 to-teal-600",
	"from-teal-500 to-emerald-600",
	"from-emerald-500 to-green-600",
	"from-green-500 to-lime-600",
	"from-lime-500 to-yellow-600",
	"from-yellow-500 to-amber-600",
	"from-amber-500 to-orange-600",
	"from-orange-500 to-red-600",
	"from-red-500 to-rose-600",
	"from-sky-500 to-blue-600",
	"from-violet-500 to-purple-600",
	"from-slate-500 to-gray-600",
] as const;

function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return Math.abs(hash);
}

export function getAvatarGradient(seed: string): string {
	const index = hashString(seed) % AVATAR_GRADIENTS.length;
	return `bg-gradient-to-br ${AVATAR_GRADIENTS[index]}`;
}

export function getAvatarInitial(email: string): string {
	const prefix = email.split("@")[0];
	return prefix ? prefix.charAt(0).toUpperCase() : "?";
}

export function getEmailStatusColorClass(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base";
		case "pending":
			return "text-warning-base";
		case "opened":
			return "text-information-base";
		case "clicked":
			return "text-feature-base";
		default:
			return "text-text-sub-600";
	}
}

export function getEmailStatusIcon(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "check-circle";
		case "failed":
		case "bounced":
		case "spam":
			return "minus-circle";
		case "pending":
			return "clock";
		case "opened":
			return "eye-outline";
		case "clicked":
			return "cursor-click";
		default:
			return "mail-single";
	}
}

export function getEmailStatusLabel(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
			return "Delivered";
		case "sent":
			return "Sent";
		case "failed":
			return "Failed";
		case "bounced":
			return "Bounced";
		case "spam":
			return "Spam";
		case "pending":
			return "Pending";
		case "opened":
			return "Opened";
		case "clicked":
			return "Clicked";
		default:
			return status;
	}
}
