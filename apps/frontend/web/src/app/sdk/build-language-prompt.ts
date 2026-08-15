import type { LanguageDefinition } from "./languages";

/** AI editor prompt for installing Reloop in a specific language SDK. */
export function buildLanguagePrompt(language: LanguageDefinition): string {
	return `Integrate Reloop email into this ${language.name} project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Install the SDK: ${language.installCommand}
2. Wire the key from env and send a test transactional email.
3. Prefer this shape when possible:

${language.sendCode}

4. Follow this repo's conventions and handle errors cleanly.

Useful docs:
- ${language.name} docs: https://reloop.sh${language.docsPath}
- Send email: https://reloop.sh/docs/api/mail/post-api-mail-v1send
- API keys: https://reloop.sh/docs/learn/api-keys

Show only the files/code I need to add or change.`;
}
