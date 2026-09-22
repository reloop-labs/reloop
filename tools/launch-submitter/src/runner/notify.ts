import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function notifyHuman(title: string, body: string) {
	const message = `${title}: ${body}`;
	console.log(`\n🔔 ${message}\n`);

	if (process.platform === "darwin") {
		const script = `display notification ${JSON.stringify(body)} with title ${JSON.stringify(title)} sound name "Glass"`;
		try {
			await execFileAsync("osascript", ["-e", script]);
		} catch {
			// notification is best-effort
		}
		try {
			await execFileAsync("afplay", ["/System/Library/Sounds/Glass.aiff"]);
		} catch {
			// audio is best-effort
		}
	}
}
