"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import type { SimpleIcon } from "simple-icons";
import {
	siCurl,
	siDotnet,
	siElixir,
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { LanguageIcon } from "@reloop/web/app/sdk/components/language-icon";
import { SdkCodeBlock } from "@reloop/web/app/sdk/components/sdk-code-block";
import { apiResponseSample } from "./content";

export interface ToolLanguage {
	slug: string;
	name: string;
	icon: SimpleIcon;
	fileName: string;
	code: string;
}

const TOOL_LANGUAGES: ToolLanguage[] = [
	{
		slug: "curl",
		name: "cURL",
		icon: siCurl,
		fileName: "terminal.sh",
		code: `# 1. Create a temporary test address
curl -X POST https://reloop.sh/api/tools/v1/deliverability-test

# Response:
# {
#   "token": "test-8f3b2c1a",
#   "address": "test-8f3b2c1a@mail-test.reloop.email",
#   "pollUrl": "https://reloop.sh/api/tools/v1/deliverability-test/test-8f3b2c1a"
# }

# 2. Send your email to the address, then poll for results:
curl https://reloop.sh/api/tools/v1/deliverability-test/test-8f3b2c1a`,
	},
	{
		slug: "nodejs",
		name: "Node.js",
		icon: siNodedotjs,
		fileName: "test-deliverability.ts",
		code: `// 1. Create test session
const createRes = await fetch("https://reloop.sh/api/tools/v1/deliverability-test", {
  method: "POST"
});
const { token, address } = await createRes.json();

console.log(\`Send test email to: \${address}\`);

// 2. Poll for incoming test report
const pollInterval = setInterval(async () => {
  const res = await fetch(\`https://reloop.sh/api/tools/v1/deliverability-test/\${token}\`);
  const data = await res.json();
  
  if (data.status === "received") {
    clearInterval(pollInterval);
    console.log(\`Score: \${data.report.score}/10 (Grade: \${data.report.grade})\`);
    console.log(\`Verdict: \${data.report.verdictLabel}\`);
  }
}, 3000);`,
	},
	{
		slug: "python",
		name: "Python",
		icon: siPython,
		fileName: "test_deliverability.py",
		code: `import requests
import time

# 1. Create test session
res = requests.post("https://reloop.sh/api/tools/v1/deliverability-test").json()
token = res["token"]
address = res["address"]

print(f"Send test email to: {address}")

# 2. Poll for report
while True:
    time.sleep(3)
    data = requests.get(f"https://reloop.sh/api/tools/v1/deliverability-test/{token}").json()
    if data.get("status") == "received":
        report = data["report"]
        print(f"Score: {report['score']}/10 ({report['grade']})")
        print(f"Verdict: {report['verdictLabel']}")
        break`,
	},
	{
		slug: "go",
		name: "Go",
		icon: siGo,
		fileName: "main.go",
		code: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SessionResponse struct {
	Token   string \`json:"token"\`
	Address string \`json:"address"\`
	Status  string \`json:"status"\`
}

func main() {
	resp, _ := http.Post("https://reloop.sh/api/tools/v1/deliverability-test", "application/json", nil)
	defer resp.Body.Close()

	var session SessionResponse
	json.NewDecoder(resp.Body).Decode(&session)
	fmt.Printf("Send test email to: %s\\n", session.Address)
}`,
	},
	{
		slug: "php",
		name: "PHP",
		icon: siPhp,
		fileName: "test.php",
		code: `<?php
$ch = curl_init("https://reloop.sh/api/tools/v1/deliverability-test");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);

echo "Send test email to: " . $res['address'] . "\\n";
?>`,
	},
	{
		slug: "ruby",
		name: "Ruby",
		icon: siRuby,
		fileName: "deliverability.rb",
		code: `require 'net/http'
require 'json'
require 'uri'

uri = URI('https://reloop.sh/api/tools/v1/deliverability-test')
res = Net::HTTP.post(uri, '')
session = JSON.parse(res.body)

puts "Send test email to: #{session['address']}"`,
	},
	{
		slug: "dotnet",
		name: ".NET",
		icon: siDotnet,
		fileName: "Program.cs",
		code: `using System.Net.Http.Json;

using var client = new HttpClient();
var session = await client.PostAsJsonAsync("https://reloop.sh/api/tools/v1/deliverability-test", new { });
var data = await session.Content.ReadFromJsonAsync<Dictionary<string, string>>();

Console.WriteLine($"Send test email to: {data?["address"]}");`,
	},
	{
		slug: "rust",
		name: "Rust",
		icon: siRust,
		fileName: "main.rs",
		code: `use reqwest;
use serde_json::Value;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let res: Value = client.post("https://reloop.sh/api/tools/v1/deliverability-test")
        .send()
        .await?
        .json()
        .await?;

    println!("Send test email to: {}", res["address"]);
    Ok(())
}`,
	},
	{
		slug: "elixir",
		name: "Elixir",
		icon: siElixir,
		fileName: "deliverability.exs",
		code: `{:ok, response} = Req.post("https://reloop.sh/api/tools/v1/deliverability-test")
address = response.body["address"]

IO.puts("Send test email to: #{address}")`,
	},
];

export function ApiSection() {
	const [activeTab, setActiveTab] = useState<string>("nodejs");
	const [copied, setCopied] = useState(false);

	const activeLang =
		TOOL_LANGUAGES.find((l) => l.slug === activeTab) ?? TOOL_LANGUAGES[0]!;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(activeLang.code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	};

	return (
		<div className="grid grid-cols-1 gap-6 border-t border-stroke-soft-200 p-6 sm:p-8 lg:grid-cols-2 dark:border-white/10">
			{/* Left Column: Request Code */}
			<div className="flex flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-white/10 dark:bg-[#121212]">
				{/* Language Selector Bar */}
				<div className="flex items-center justify-between border-b border-stroke-soft-200 bg-bg-weak-50/70 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.02]">
					<div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
						{TOOL_LANGUAGES.map((lang) => {
							const isActive = lang.slug === activeTab;
							return (
								<button
									key={lang.slug}
									type="button"
									onClick={() => setActiveTab(lang.slug)}
									className={cn(
										"flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] transition-colors",
										isActive
											? "bg-bg-white-0 font-medium text-text-strong-950 shadow-sm dark:bg-white/10 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
									)}
								>
									<LanguageIcon icon={lang.icon} className="size-3.5" />
									{lang.name}
								</button>
							);
						})}
					</div>

					<button
						type="button"
						onClick={handleCopy}
						className="flex items-center gap-1 text-[12px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
					>
						<Icon name={copied ? "check" : "copy-01"} className="size-3.5" />
						{copied ? "Copied" : "Copy"}
					</button>
				</div>

				<div className="flex-1 p-4 font-mono text-[13px]">
					<SdkCodeBlock
						code={activeLang.code}
						slug={activeLang.slug === "curl" ? "bash" : activeLang.slug}
						path={activeLang.fileName}
					/>
				</div>
			</div>

			{/* Right Column: Sample JSON Response */}
			<div className="flex flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-white/10 dark:bg-[#121212]">
				<div className="flex items-center justify-between border-b border-stroke-soft-200 bg-bg-weak-50/70 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.02]">
					<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/45">
						JSON Response (200 OK)
					</span>
					<span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
						Unauthenticated
					</span>
				</div>

				<div className="flex-1 p-4 font-mono text-[12px]">
					<SdkCodeBlock code={apiResponseSample} slug="json" path="response.json" />
				</div>
			</div>
		</div>
	);
}
