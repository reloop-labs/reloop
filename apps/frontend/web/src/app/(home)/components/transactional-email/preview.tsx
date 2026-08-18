import { IncomingEmails } from "./incoming-emails";
import { SendCode } from "./send-code";
import { TemplatePane } from "./template-pane";

export function TransactionalEmailPreview() {
	return (
		<div className="border-stroke-soft-200 border-t dark:border-white/10">
			<div className="grid lg:grid-cols-2 lg:divide-x lg:divide-stroke-soft-200 dark:lg:divide-white/10">
				<IncomingEmails />
				<div className="border-stroke-soft-200 border-t lg:border-t-0 dark:border-white/10">
					<TemplatePane />
				</div>
			</div>
			<div className="border-stroke-soft-200 border-t dark:border-white/10">
				<SendCode />
			</div>
		</div>
	);
}
