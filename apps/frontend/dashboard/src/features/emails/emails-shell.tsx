import { EmailsTabs } from "./components/emails-tabs";
import { EmailsListHeader } from "./emails-list-header";

/**
 * List chrome for the mail home routes only (`/` sent + `/receive`).
 * Mounted exclusively via the `(mail)` route layout — never on email detail.
 */
export function EmailsShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<EmailsListHeader />
			<div>
				<EmailsTabs />
				<div className="mt-4 pb-8">{children}</div>
			</div>
		</div>
	);
}
