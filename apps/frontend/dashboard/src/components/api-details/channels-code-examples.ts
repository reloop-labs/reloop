export const codeExamples = {
	javascript: {
		add: `// Create a new channel
const response = await fetch('/api/contacts/v1/channels/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'Newsletter',
    description: 'Weekly newsletter subscribers'
  })
});

const result = await response.json();`,
		list: `// List all channels
const response = await fetch('/api/contacts/v1/channels/list?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const channels = await response.json();`,
		delete: `// Delete a channel
const response = await fetch('/api/contacts/v1/channels/channel_123', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const result = await response.json();`,
		subscribe: `// Subscribe contact to channel
const response = await fetch('/api/contacts/v1/subscriptions/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    contactId: 'contact_123',
    channelId: 'channel_123'
  })
});

const result = await response.json();`,
	},
	python: {
		add: `# Create a new channel
import requests

response = requests.post('/api/contacts/v1/channels/create',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'name': 'Newsletter',
    'description': 'Weekly newsletter subscribers'
  }
)

result = response.json()`,
		list: `# List all channels
import requests

response = requests.get('/api/contacts/v1/channels/list?page=1&limit=10',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

channels = response.json()`,
		delete: `# Delete a channel
import requests

response = requests.delete('/api/contacts/v1/channels/channel_123',
  headers={
    'Authorization': 'Bearer YOUR_API_KEY'
  }
)

result = response.json()`,
		subscribe: `# Subscribe contact to channel
import requests

response = requests.post('/api/contacts/v1/subscriptions/subscribe',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'contactId': 'contact_123',
    'channelId': 'channel_123'
  }
)

result = response.json()`,
	},
	php: {
		add: `<?php
// Create a new channel
$data = [
    'name' => 'Newsletter',
    'description' => 'Weekly newsletter subscribers'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/channels/create');
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
// List all channels
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/channels/list?page=1&limit=10');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$channels = curl_exec($ch);
curl_close($ch);
?>`,
		delete: `<?php
// Delete a channel
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/channels/channel_123');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
		subscribe: `<?php
// Subscribe contact to channel
$data = [
    'contactId' => 'contact_123',
    'channelId' => 'channel_123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/subscriptions/subscribe');
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
	},
};
