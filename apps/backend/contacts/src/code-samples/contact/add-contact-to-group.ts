export const addContactToGroupSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const response = await reloop.audience.groups.addContact(
  'grp_987654321',
  {
    contactId: 'cont_123456789'
  }
);`,
  },
];
