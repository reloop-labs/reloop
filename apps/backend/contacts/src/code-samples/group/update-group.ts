export const updateGroupSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const response = await reloop.audience.updateGroup('grp_123456789', {
  name: 'Updated Group Name',
  description: 'Updated group description.'
});`,
  },
];
