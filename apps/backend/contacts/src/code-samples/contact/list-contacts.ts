export const listContactsSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const contacts = await reloop.audience.list({
  limit: 10,
  page: 1
});`,
  },
];
