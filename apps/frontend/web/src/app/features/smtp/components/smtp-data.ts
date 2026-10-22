/** Public SMTP relay settings, kept in sync with apps/backend/smtp/init.lua. */
export const SMTP_HOST = "smtp.reloop.sh";
/** The relay authenticates on the password alone; any username works. */
export const SMTP_USER = "reloop";
export const SMTP_PORT = 587;

export const SMTP_PORTS: { port: number; mode: string; note: string }[] = [
	{ port: 587, mode: "STARTTLS", note: "Recommended for most mailers." },
	{ port: 465, mode: "SSL/TLS", note: "Implicit TLS from the first byte." },
	{ port: 2587, mode: "STARTTLS", note: "When your host blocks 587." },
	{ port: 2465, mode: "SSL/TLS", note: "When your host blocks 465." },
];
