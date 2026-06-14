export const codeExamples = {
  javascript: {
    create: `const response = await fetch("https://reloop.sh/webhook/v1/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({
    url: "https://example.com/webhook",
    events: ["contact.created", "contact.updated"],
  }),
});

const webhook = await response.json();`,
    list: `const response = await fetch(
  "https://reloop.sh/webhook/v1/?page=1&limit=10",
  {
    credentials: "include",
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  },
);

const webhooks = await response.json();`,
    delete: `const response = await fetch(
  "https://reloop.sh/webhook/v1/webhook_id",
  {
    method: "DELETE",
    credentials: "include",
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  },
);

const result = await response.json();`,
  },
  python: {
    create: `import requests

response = requests.post(
    "https://reloop.sh/webhook/v1/",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY",
    },
    json={
        "url": "https://example.com/webhook",
        "events": ["contact.created", "contact.updated"],
    },
)

webhook = response.json()`,
    list: `import requests

response = requests.get(
    "https://reloop.sh/webhook/v1/?page=1&limit=10",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
    },
)

webhooks = response.json()`,
    delete: `import requests

response = requests.delete(
    "https://reloop.sh/webhook/v1/webhook_id",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
    },
)

result = response.json()`,
  },
  php: {
    create: `<?php
$payload = [
    "url" => "https://example.com/webhook",
    "events" => ["contact.created", "contact.updated"],
];

$ch = curl_init("https://reloop.sh/webhook/v1/");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$webhook = curl_exec($ch);
curl_close($ch);
?>`,
    list: `<?php
$ch = curl_init("https://reloop.sh/webhook/v1/?page=1&limit=10");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$webhooks = curl_exec($ch);
curl_close($ch);
?>`,
    delete: `<?php
$ch = curl_init("https://reloop.sh/webhook/v1/webhook_id");
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
  },
};
