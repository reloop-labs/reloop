export const updateContactTopicSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const response = await reloop.audience.subscribe('cont_123456789', {
  topicId: 'top_987654321'
});`,
  },
];
