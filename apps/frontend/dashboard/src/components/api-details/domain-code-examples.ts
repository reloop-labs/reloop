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
		create: `// Create a domain
const response = await fetch("https://reloop.sh/api/domain/v1/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "rl_123456789",
  },
  body: JSON.stringify({
    domain: "send.example.com",
    click_tracking: true,
    open_tracking: true,
    tls: "opportunistic",
    sending_email: true,
    receiving_email: false,
  }),
});

const domain = await response.json();`,
		list: `// List domains
const response = await fetch(
  "https://reloop.sh/api/domain/v1/list?page=1&limit=10&status=active",
  {
    headers: {
      "x-api-key": "rl_123456789",
    },
  },
);

const domains = await response.json();`,
		get: `// Get a domain by ID
const response = await fetch(
  "https://reloop.sh/api/domain/v1/dom_123456789",
  {
    headers: {
      "x-api-key": "rl_123456789",
    },
  },
);

const domain = await response.json();`,
		update: `// Update domain settings
const response = await fetch(
  "https://reloop.sh/api/domain/v1/dom_123456789",
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "rl_123456789",
    },
    body: JSON.stringify({
      click_tracking: false,
      open_tracking: true,
      sending_email: true,
    }),
  },
);

const domain = await response.json();`,
		delete: `// Delete a domain by ID
const response = await fetch(
  "https://reloop.sh/api/domain/v1/dom_123456789",
  {
    method: "DELETE",
    headers: {
      "x-api-key": "rl_123456789",
    },
  },
);

const result = await response.json();`,
		verify: `// Start DNS verification
const response = await fetch(
  "https://reloop.sh/api/domain/v1/verify/dom_123456789",
  {
    method: "POST",
    headers: {
      "x-api-key": "rl_123456789",
    },
  },
);

const result = await response.json();`,
	},
	python: {
		create: `# Create a domain
import requests

response = requests.post(
    "https://reloop.sh/api/domain/v1/create",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "rl_123456789",
    },
    json={
        "domain": "send.example.com",
        "click_tracking": True,
        "open_tracking": True,
        "tls": "opportunistic",
        "sending_email": True,
        "receiving_email": False,
    },
)

domain = response.json()`,
		list: `# List domains
import requests

response = requests.get(
    "https://reloop.sh/api/domain/v1/list",
    params={"page": 1, "limit": 10, "status": "active"},
    headers={"x-api-key": "rl_123456789"},
)

domains = response.json()`,
		get: `# Get a domain by ID
import requests

response = requests.get(
    "https://reloop.sh/api/domain/v1/dom_123456789",
    headers={"x-api-key": "rl_123456789"},
)

domain = response.json()`,
		update: `# Update domain settings
import requests

response = requests.patch(
    "https://reloop.sh/api/domain/v1/dom_123456789",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "rl_123456789",
    },
    json={
        "click_tracking": False,
        "open_tracking": True,
        "sending_email": True,
    },
)

domain = response.json()`,
		delete: `# Delete a domain by ID
import requests

response = requests.delete(
    "https://reloop.sh/api/domain/v1/dom_123456789",
    headers={"x-api-key": "rl_123456789"},
)

result = response.json()`,
		verify: `# Start DNS verification
import requests

response = requests.post(
    "https://reloop.sh/api/domain/v1/verify/dom_123456789",
    headers={"x-api-key": "rl_123456789"},
)

result = response.json()`,
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
