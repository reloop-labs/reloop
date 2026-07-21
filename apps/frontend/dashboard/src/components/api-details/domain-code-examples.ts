/**
 * Domain API samples for the dashboard drawer.
 * Paths must match the Domain service (apps/backend/domain):
 *   POST   /api/domain/v1/create
 *   GET    /api/domain/v1/list
 *   GET    /api/domain/v1/:domain_id
 *   PATCH  /api/domain/v1/:domain_id
 *   DELETE /api/domain/v1/:domain_id
 *   POST   /api/domain/v1/verify/:domain_id
 * There is no collection route at /api/domain/v1/domain.
 */
export const codeExamples = {
	javascript: {
		create: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domain, domainError } = await reloop.domain.create({
  domain: "send.example.com",
  click_tracking: true,
  open_tracking: true,
  tls: "opportunistic",
  sending_email: true,
  receiving_email: false,
});

if (domainError) throw domainError;

console.log(domain.id, domain.domain);`,
		list: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domains, domainError } = await reloop.domain.list({
  page: 1,
  limit: 10,
  status: "active",
});

if (domainError) throw domainError;

console.log(domains.total, domains.domains);`,
		get: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domain, domainError } = await reloop.domain.get("dom_123456789");

if (domainError) throw domainError;

console.log(domain.id, domain.domain, domain.status);`,
		update: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domain, domainError } = await reloop.domain.update("dom_123456789", {
  click_tracking: false,
  open_tracking: true,
  sending_email: true,
});

if (domainError) throw domainError;

console.log(domain.id, domain.isClickTrackingEnabled);`,
		delete: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domain, domainError } = await reloop.domain.delete("dom_123456789");

if (domainError) throw domainError;

console.log(domain.id);`,
		verify: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domain, domainError } = await reloop.domain.verify("dom_123456789");

if (domainError) throw domainError;

console.log(domain.id, domain.status);`,
	},
	python: {
		create: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.create({
    "domain": "send.example.com",
    "click_tracking": True,
    "open_tracking": True,
    "tls": "opportunistic",
    "sending_email": True,
    "receiving_email": False,
})

if result.domain_error:
    raise result.domain_error

print(result.domain["id"], result.domain["domain"])`,
		list: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.list({"page": 1, "limit": 10, "status": "active"})

if result.domain_error:
    raise result.domain_error

print(result.domains["total"], result.domains["domains"])`,
		get: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.get("dom_123456789")

if result.domain_error:
    raise result.domain_error

print(result.domain["id"], result.domain["domain"], result.domain["status"])`,
		update: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.update("dom_123456789", {
    "click_tracking": False,
    "open_tracking": True,
    "sending_email": True,
})

if result.domain_error:
    raise result.domain_error

print(result.domain["id"], result.domain["isClickTrackingEnabled"])`,
		delete: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.delete("dom_123456789")

if result.domain_error:
    raise result.domain_error

print(result.domain["id"])`,
		verify: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.verify("dom_123456789")

if result.domain_error:
    raise result.domain_error

print(result.domain["id"], result.domain["status"])`,
	},
	php: {
		create: `<?php
// Create a domain
$payload = [
    'domain' => 'send.example.com',
    'click_tracking' => true,
    'open_tracking' => true,
    'tls' => 'opportunistic',
    'sending_email' => true,
    'receiving_email' => false,
];

$ch = curl_init('https://reloop.sh/api/domain/v1/create');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: rl_123456789',
    ],
    CURLOPT_RETURNTRANSFER => true,
]);

$domain = curl_exec($ch);
curl_close($ch);
?>`,
		list: `<?php
// List domains
$ch = curl_init('https://reloop.sh/api/domain/v1/list?page=1&limit=10&status=active');
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER => ['x-api-key: rl_123456789'],
    CURLOPT_RETURNTRANSFER => true,
]);

$domains = curl_exec($ch);
curl_close($ch);
?>`,
		get: `<?php
// Get a domain by ID
$ch = curl_init('https://reloop.sh/api/domain/v1/dom_123456789');
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER => ['x-api-key: rl_123456789'],
    CURLOPT_RETURNTRANSFER => true,
]);

$domain = curl_exec($ch);
curl_close($ch);
?>`,
		update: `<?php
// Update domain settings
$payload = [
    'click_tracking' => false,
    'open_tracking' => true,
    'sending_email' => true,
];

$ch = curl_init('https://reloop.sh/api/domain/v1/dom_123456789');
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => 'PATCH',
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: rl_123456789',
    ],
    CURLOPT_RETURNTRANSFER => true,
]);

$domain = curl_exec($ch);
curl_close($ch);
?>`,
		delete: `<?php
// Delete a domain by ID
$ch = curl_init('https://reloop.sh/api/domain/v1/dom_123456789');
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => 'DELETE',
    CURLOPT_HTTPHEADER => ['x-api-key: rl_123456789'],
    CURLOPT_RETURNTRANSFER => true,
]);

$result = curl_exec($ch);
curl_close($ch);
?>`,
		verify: `<?php
// Start DNS verification
$ch = curl_init('https://reloop.sh/api/domain/v1/verify/dom_123456789');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['x-api-key: rl_123456789'],
    CURLOPT_RETURNTRANSFER => true,
]);

$result = curl_exec($ch);
curl_close($ch);
?>`,
	},
};
