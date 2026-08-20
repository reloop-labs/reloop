import { AboutFounders } from "./about-founders";
import { AboutPhilosophyCompass } from "./about-philosophy-compass";
import { AboutStory } from "./about-story";

export { AboutFounders, AboutPhilosophyCompass, AboutStory };

export function AboutUsSection() {
	return (
		<>
			<AboutStory />
			<AboutFounders />
			<AboutPhilosophyCompass />
		</>
	);
}
