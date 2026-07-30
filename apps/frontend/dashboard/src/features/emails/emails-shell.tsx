import { EmailsCommonUseCasesSidebar } from "./common-use-cases-sidebar";
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
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
				<div className="lg:col-span-8 xl:col-span-8">
					<EmailsTabs />
					<div className="mt-4 pb-8">{children}</div>
				</div>
				<div className="lg:col-span-4 xl:col-span-4">
					<EmailsCommonUseCasesSidebar />
				</div>
			</div>
		</div>
	);
}
