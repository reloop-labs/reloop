import { SceneHeader } from "../_shared/scene-header";
import { TransactionalEmailPreview } from "./preview";

export function TransactionalEmailSection() {
	return (
		<article
			id="email-system-transactional"
			data-scene="transactional"
			className="scroll-mt-28 pt-12 sm:pt-16 lg:pt-16"
		>
			<div className="px-4 sm:px-8 lg:px-12">
				<SceneHeader
					icon="send-2"
					color="orange"
					badge="Transactional Email"
					title="It starts with transactional email"
					description="One API, one SMTP relay. Same reliable payload from Node, Python, or a cron on the box."
					ctaLabel="Explore Transactional"
					ctaHref="/docs/transactional"
				/>
			</div>

			<TransactionalEmailPreview />
		</article>
	);
}
