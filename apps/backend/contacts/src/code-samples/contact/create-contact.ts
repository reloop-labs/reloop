export const createContactSamples = [
  {
    id: "node",
    lang: "JavaScript",
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
});

console.log(contact);`,
  },
  {
    id: "php",
    lang: "PHP",
    label: "PHP",
    source: `$reloop = new \\Reloop\\Client([
  'url' => 'https://reloop.sh',
  'key' => 're_123456789'
]);

$contact = $reloop->audience->create([
  'email' => 'john.doe@example.com',
  'firstName' => 'John',
  'lastName' => 'Doe',
  'status' => 'subscribed'
]);

echo $contact->id;`,
  },
  {
    id: "ruby",
    lang: "Ruby",
    label: "Ruby",
    source: `require 'reloop'

client = Reloop::Client.new(
  url: 'https://reloop.sh',
  key: 're_123456789'
)

contact = client.audience.create(
  email: 'john.doe@example.com',
  first_name: 'John',
  last_name: 'Doe',
  status: 'subscribed'
)

puts contact.id`,
  },
  {
    id: "python",
    lang: "Python",
    label: "Python",
    source: `from reloop import Reloop

client = Reloop(
    url="https://reloop.sh",
    key="re_123456789"
)

contact = client.audience.create(
    email="john.doe@example.com",
    first_name="John",
    last_name="Doe",
    status="subscribed"
)

print(contact.id)`,
  },
  {
    id: "go",
    lang: "Go",
    label: "Go",
    source: `package main

import (
  "fmt"
  reloop "github.com/reloop-labs/reloop-go"
)

func main() {
  client := reloop.New(&reloop.Config{
    URL: "https://reloop.sh",
    Key: "re_123456789",
  })

  contact, err := client.Audience.Create(&reloop.CreateAudienceRequest{
    Email:     "john.doe@example.com",
    FirstName: "John",
    LastName:  "Doe",
    Status:    "subscribed",
  })

  if err != nil {
    panic(err)
  }

  fmt.Println(contact.ID)
}`,
  },
  {
    id: "rust",
    lang: "Rust",
    label: "Rust",
    source: `use reloop::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new(
        "https://reloop.sh",
        "re_123456789"
    );

    let contact = client
        .audience()
        .create(CreateAudienceRequest {
            email: "john.doe@example.com".into(),
            first_name: Some("John".into()),
            last_name: Some("Doe".into()),
            status: Some("subscribed".into()),
        })
        .await?;

    println!("{}", contact.id);
    Ok(())
}`,
  },
  {
    id: "elixir",
    lang: "Elixir",
    label: "Elixir",
    source: `client = Reloop.new(
  url: "https://reloop.sh",
  key: "re_123456789"
)

{:ok, contact} = Reloop.Audience.create(client, %{
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  status: "subscribed"
})

IO.inspect(contact.id)`,
  },
  {
    id: "java",
    lang: "Java",
    label: "Java",
    source: `import com.reloop.Reloop;
import com.reloop.models.Contact;

Reloop client = new Reloop.Builder()
    .url("https://reloop.sh")
    .key("re_123456789")
    .build();

Contact contact = client.audience().create(
    CreateAudienceRequest.builder()
        .email("john.doe@example.com")
        .firstName("John")
        .lastName("Doe")
        .status("subscribed")
        .build()
);

System.out.println(contact.getId());`,
  },
  {
    id: "dotnet",
    lang: "C#",
    label: ".NET",
    source: `using Reloop;

var client = new ReloopClient(new ReloopConfig
{
    Url = "https://reloop.sh",
    Key = "re_123456789"
});

var contact = await client.Audience.CreateAsync(new CreateAudienceRequest
{
    Email = "john.doe@example.com",
    FirstName = "John",
    LastName = "Doe",
    Status = "subscribed"
});

Console.WriteLine(contact.Id);`,
  },
  {
    id: "curl",
    lang: "Shell",
    label: "cURL",
    source: `curl -X POST https://reloop.sh/api/contacts/v1/contacts/create \\
  -H "Authorization: Bearer re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "subscribed"
  }'`,
  },
];
