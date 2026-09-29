import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import styles from "./landing-grid.module.css";

function GridCells({ count }: { count: number }) {
	return Array.from({ length: count }, (_, index) => (
		<div key={index}>
			<div data-grid-content />
		</div>
	));
}

export function GridHero() {
	return (
		<section
			id="features"
			aria-labelledby="home-heading"
			className={`${styles.surface} ${styles.hero}`}
		>
			<div className={styles.gridBackdrop}>
				<div className={styles.frame}>
					<div className={styles.grid}>
						<div aria-hidden="true" className={styles.texture} />
						<div aria-hidden="true" className={styles.band}>
							<GridCells count={10} />
						</div>
						<div className={styles.middle}>
							<div aria-hidden="true" className={styles.side}>
								<GridCells count={4} />
							</div>
							<div className={styles.center}>
								<div data-grid-content className={styles.content}>
									<div className={styles.copy}>
										<h1 id="home-heading" className={styles.title}>
											Email for your app.
											<br />
											And your agents.
										</h1>
										<p className={styles.description}>
											Send transactional emails, run campaigns, and give AI
											agents their own inboxes—all with Reloop.
										</p>
										<div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
											<FancyButton.Root
												asChild
												variant="neutral"
												size="medium"
												className="h-11 rounded-xl px-6 font-medium text-[15.5px] dark:bg-white dark:text-black dark:hover:bg-white/90"
											>
												<a href={hostedSignupHref}>Get Started</a>
											</FancyButton.Root>
											<FancyButton.Root
												asChild
												variant="basic"
												size="medium"
												className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
											>
												<Link href="/self-host">Self-host Reloop</Link>
											</FancyButton.Root>
										</div>
										<span className={styles.note}>
											3,000 emails for free
											<span aria-hidden="true"> · </span>
											No credit card required.
										</span>
									</div>
								</div>
							</div>
							<div aria-hidden="true" className={styles.side}>
								<GridCells count={4} />
							</div>
						</div>
						<div aria-hidden="true" className={styles.band}>
							<GridCells count={10} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
