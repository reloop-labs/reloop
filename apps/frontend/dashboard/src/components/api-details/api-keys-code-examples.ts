export const codeExamples = {
  javascript: {
    create: `const response = await fetch("https://reloop.sh/api-key/v1/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({
    name: "Production key",
    enabled: true,
  }),
});

const apiKey = await response.json();`,
    list: `const response = await fetch(
  "https://reloop.sh/api-key/v1/?page=1&limit=10",
  {
    credentials: "include",
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  },
);

const apiKeys = await response.json();`,
    rotate: `const response = await fetch(
  "https://reloop.sh/api-key/v1/api_key_id/rotate",
  {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  },
);

const rotatedKey = await response.json();`,
    disable: `const response = await fetch(
  "https://reloop.sh/api-key/v1/api_key_id/disable",
  {
    method: "POST",
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
    "https://reloop.sh/api-key/v1/",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY",
    },
    json={
        "name": "Production key",
        "enabled": True,
    },
)

api_key = response.json()`,
    list: `import requests

response = requests.get(
    "https://reloop.sh/api-key/v1/?page=1&limit=10",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
    },
)

api_keys = response.json()`,
    rotate: `import requests

response = requests.post(
    "https://reloop.sh/api-key/v1/api_key_id/rotate",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
    },
)

rotated_key = response.json()`,
    disable: `import requests

response = requests.post(
    "https://reloop.sh/api-key/v1/api_key_id/disable",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
    },
)

result = response.json()`,
  },
  php: {
    create: `<?php
$payload = [
    "name" => "Production key",
    "enabled" => true,
];

$ch = curl_init("https://reloop.sh/api-key/v1/");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$apiKey = curl_exec($ch);
curl_close($ch);
?>`,
    list: `<?php
$ch = curl_init("https://reloop.sh/api-key/v1/?page=1&limit=10");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$apiKeys = curl_exec($ch);
curl_close($ch);
?>`,
    rotate: `<?php
$ch = curl_init("https://reloop.sh/api-key/v1/api_key_id/rotate");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$rotatedKey = curl_exec($ch);
curl_close($ch);
?>`,
    disable: `<?php
$ch = curl_init("https://reloop.sh/api-key/v1/api_key_id/disable");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
  },
};
