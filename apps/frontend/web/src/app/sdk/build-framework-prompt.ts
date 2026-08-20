import type { FrameworkDefinition } from "./frameworks";

/** AI editor prompt for installing Reloop in a specific framework. */
export function buildFrameworkPrompt(framework: FrameworkDefinition): string {
	return `Integrate Reloop email into this ${framework.name} (${framework.languageName}) project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Install the SDK: ${framework.installCommand}
2. Wire the key from env and send a test transactional email using the ${framework.name} patterns for ${framework.runtimeHint}.
3. Prefer this shape when possible:

${framework.sendCode}

4. Follow this repo's conventions and handle errors cleanly.

Useful docs:
- ${framework.languageName} docs: https://reloop.sh${framework.docsPath}
- Send email: https://reloop.sh/docs/api/mail/post-api-mail-v1send
- API keys: https://reloop.sh/docs/learn/api-keys

Show only the files/code I need to add or change.`;
}
