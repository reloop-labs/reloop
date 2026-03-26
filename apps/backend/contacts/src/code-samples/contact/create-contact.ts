export const createContactSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const contact = await reloop.audience.create({
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'subscribed'
});`,
  },
];
