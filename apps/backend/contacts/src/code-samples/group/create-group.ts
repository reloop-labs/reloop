export const createGroupSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const group = await reloop.audience.createGroup({
  name: 'Beta Testers',
  description: 'Users who opted in for beta testing.'
});`,
  },
];
