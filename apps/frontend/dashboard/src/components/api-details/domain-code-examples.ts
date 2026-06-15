export const codeExamples = {
	javascript: {
		add: `// Add a new domain
const response = await fetch('https://reloop.sh/api/v1/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    domain: 'example.com',
    serverIP: '192.168.1.100',
    adminEmail: 'admin@example.com',
    adminPassword: 'securepassword123',
    adminFullName: 'Admin User',
    mailboxes: 100,
    mailboxQuota: 10737418240, // 10GB
    quota: 21474836480, // 20GB
    rateLimit: 20
  })
});

const result = await response.json();`,
		list: `// List all domains
const response = await fetch('https://reloop.sh/api/v1/list?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const domains = await response.json();`,
		delete: `// Delete a domain
const response = await fetch('https://reloop.sh/api/v1/delete', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    domain: 'example.com'
  })
});

const result = await response.json();`,
		details: `// Get domain details
const response = await fetch('https://reloop.sh/api/v1/details?domain=example.com', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const domainDetails = await response.json();`,
	},
	python: {
		add: `# Add a new domain
import requests

response = requests.post('https://reloop.sh/api/v1/add',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'domain': 'example.com',
    'serverIP': '192.168.1.100',
    'adminEmail': 'admin@example.com',
    'adminPassword': 'securepassword123',
    'adminFullName': 'Admin User',
    'mailboxes': 100,
    'mailboxQuota': 10737418240,
    'quota': 21474836480,
    'rateLimit': 20
  }
)

result = response.json()`,
		list: `# List all domains
import requests

response = requests.get('https://reloop.sh/api/v1/list?page=1&limit=10',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

domains = response.json()`,
		delete: `# Delete a domain
import requests

response = requests.delete('https://reloop.sh/api/v1/delete',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={'domain': 'example.com'}
)

result = response.json()`,
		details: `# Get domain details
import requests

response = requests.get('https://reloop.sh/api/v1/details?domain=example.com',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

domain_details = response.json()`,
	},
	php: {
		add: `<?php
// Add a new domain
$data = [
    'domain' => 'example.com',
    'serverIP' => '192.168.1.100',
    'adminEmail' => 'admin@example.com',
    'adminPassword' => 'securepassword123',
    'adminFullName' => 'Admin User',
    'mailboxes' => 100,
    'mailboxQuota' => 10737418240,
    'quota' => 21474836480,
    'rateLimit' => 20
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://reloop.sh/api/v1/add');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
		list: `<?php
// List all domains
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://reloop.sh/api/v1/list?page=1&limit=10');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$domains = curl_exec($ch);
curl_close($ch);
?>`,
		delete: `<?php
// Delete a domain
$data = ['domain' => 'example.com'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://reloop.sh/api/v1/delete');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
		details: `<?php
// Get domain details
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://reloop.sh/api/v1/details?domain=example.com');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$domainDetails = curl_exec($ch);
curl_close($ch);
?>`,
	},
};
