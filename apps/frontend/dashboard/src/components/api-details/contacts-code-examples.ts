export const codeExamples = {
	nodejs: {
		add: {
			filename: "add_contact.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: contact, error } = await reloop.contacts.create({
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  status: "subscribed",
  properties: { company: "Reloop", role: "Developer" },
  groupIds: ["grp_123456789"],
  channels: [{ channelId: "chn_123456789", subscription: "opt_in" }],
});
if (error) throw error;`,
		},
		get: {
			filename: "get_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response: contact, error } = await reloop.contacts().get('cont_123456789');
if (error) throw error;`,
		},
		list: {
			filename: "list_contact.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: contacts, error } = await reloop.contacts.list({
  page: 1,
  limit: 10,
  status: "subscribed",
});
if (error) throw error;`,
		},
		update: {
			filename: "update_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response: contact, error } = await reloop.contacts().update('cont_123456789', {
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Designer',
  },
});
if (error) throw error;`,
		},
		delete: {
			filename: "delete_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response, error } = await reloop.contacts().delete('cont_123456789');
if (error) throw error;`,
		},
		addChannel: {
			filename: "add_contact_channel.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.addContact(
  "chn_123456789",
  { contact_id: "con_123456789", subscription: "opt_in" },
);

if (channelError) throw channelError;

console.log(channel.subscriptionId, channel.contact.id);`,
		},
		updateChannel: {
			filename: "update_contact_channel.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.updateSubscription(
  "chn_123456789",
  { contact_id: "con_123456789", subscription: "opt_out" },
);

if (channelError) throw channelError;

console.log(channel.status, channel.success);`,
		},
		addGroup: {
			filename: "add_contact_group.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { group, groupError } = await reloop.contacts.groups.addContact(
  "grp_123456789",
  { contact_id: "con_123456789" },
);

if (groupError) throw groupError;

console.log(group.id, group.success);`,
		},
		deleteGroup: {
			filename: "delete_contact_group.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { group, groupError } = await reloop.contacts.groups.removeContact(
  "grp_123456789",
  { contact_id: "con_123456789" },
);

if (groupError) throw groupError;

console.log(group.id, group.success);`,
		},
	},
	python: {
		add: {
			filename: "add_contact.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

contact = reloop.contacts.create(
    email="john.doe@example.com",
    first_name="John",
    last_name="Doe",
    status="subscribed",
    properties={"company": "Reloop", "role": "Developer"},
    group_ids=["grp_123456789"],
    channels=[{"channel_id": "chn_123456789", "subscription": "opt_in"}],
)`,
		},
		get: {
			filename: "get_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().get("cont_123456789")`,
		},
		list: {
			filename: "list_contact.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

contacts = reloop.contacts.list(page=1, limit=10, status="subscribed")`,
		},
		update: {
			filename: "update_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().update(
    "cont_123456789",
    first_name="Jane",
    last_name="Smith",
    unsubscribed=False,
    properties={
        "company": "Reloop",
        "role": "Designer",
    },
)`,
		},
		delete: {
			filename: "delete_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().delete("cont_123456789")`,
		},
		addChannel: {
			filename: "add_contact_channel.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.channels.add_contact("chn_123456789", contact_id="con_123456789", subscription="opt_in")`,
		},
		updateChannel: {
			filename: "update_contact_channel.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.channels.update_subscription("chn_123456789", contact_id="con_123456789", subscription="opt_out")`,
		},
		addGroup: {
			filename: "add_contact_group.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.groups.add_contact("grp_123456789", contact_id="con_123456789")`,
		},
		deleteGroup: {
			filename: "delete_contact_group.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.groups.remove_contact("grp_123456789", contact_id="con_123456789")`,
		},
	},
	php: {
		add: {
			filename: "add_contact.php",
			code: `$reloop = Reloop::client('rl_123456789');

$contact = $reloop->contacts->create([
    'email' => 'john.doe@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'status' => 'subscribed',
    'properties' => ['company' => 'Reloop', 'role' => 'Developer'],
    'group_ids' => ['grp_123456789'],
    'channels' => [['channel_id' => 'chn_123456789', 'subscription' => 'opt_in']],
]);`,
		},
		get: {
			filename: "get_contact.php",
			code: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->get('cont_123456789');`,
		},
		list: {
			filename: "list_contact.php",
			code: `$reloop = Reloop::client('rl_123456789');

$contacts = $reloop->contacts->list(['page' => 1, 'limit' => 10, 'status' => 'subscribed']);`,
		},
		update: {
			filename: "update_contact.php",
			code: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->update(
  'cont_123456789',
  parameters: [
      'first_name' => 'Jane',
      'last_name' => 'Smith',
      'unsubscribed' => false,
      'properties' => [
          'company' => 'Reloop',
          'role' => 'Designer',
      ],
  ],
);`,
		},
		delete: {
			filename: "delete_contact.php",
			code: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->delete('cont_123456789');`,
		},
		addChannel: {
			filename: "add_contact_channel.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->channels->addContact('chn_123456789', ['contact_id' => 'con_123456789', 'subscription' => 'opt_in']);`,
		},
		updateChannel: {
			filename: "update_contact_channel.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->channels->updateSubscription('chn_123456789', ['contact_id' => 'con_123456789', 'subscription' => 'opt_out']);`,
		},
		addGroup: {
			filename: "add_contact_group.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->groups->addContact('grp_123456789', ['contact_id' => 'con_123456789']);`,
		},
		deleteGroup: {
			filename: "delete_contact_group.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->groups->removeContact('grp_123456789', ['contact_id' => 'con_123456789']);`,
		},
	},
	go: {
		add: {
			filename: "add_contact.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

contact, _ := client.Contacts.Create(map[string]interface{}{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "subscribed",
})`,
		},
		get: {
			filename: "get_contact.go",
			code: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Get("cont_123456789")
}`,
		},
		list: {
			filename: "list_contact.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

contacts, _ := client.Contacts.List(map[string]interface{}{
    "page": 1,
    "limit": 10,
    "status": "subscribed",
})`,
		},
		update: {
			filename: "update_contact.go",
			code: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Update("cont_123456789", map[string]interface{}{
        "first_name": "Jane",
        "last_name": "Smith",
        "unsubscribed": false,
        "properties": map[string]interface{}{"company": "Reloop", "role": "Designer"}
    })
}`,
		},
		delete: {
			filename: "delete_contact.go",
			code: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Delete("cont_123456789")
}`,
		},
		addChannel: {
			filename: "add_contact_channel.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Channels.AddContact("chn_123456789", map[string]interface{"contact_id": "con_123456789", "subscription": "opt_in"})`,
		},
		updateChannel: {
			filename: "update_contact_channel.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Channels.UpdateSubscription("chn_123456789", map[string]interface{"contact_id": "con_123456789", "subscription": "opt_out"})`,
		},
		addGroup: {
			filename: "add_contact_group.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Groups.AddContact("grp_123456789", map[string]interface{"contact_id": "con_123456789"})`,
		},
		deleteGroup: {
			filename: "delete_contact_group.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Groups.RemoveContact("grp_123456789", map[string]interface{"contact_id": "con_123456789"})`,
		},
	},
	ruby: {
		add: {
			filename: "add_contact.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

contact = reloop.contacts.create(
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  status: "subscribed",
  properties: { company: "Reloop", role: "Developer" },
  group_ids: ["grp_123456789"],
  channels: [{ channel_id: "chn_123456789", subscription: "opt_in" }],
)`,
		},
		get: {
			filename: "get_contact.rb",
			code: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/retrieve/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Get.new(uri)
request['x-api-key'] = 're_123456789'

response = http.request(request)
contact = JSON.parse(response.body)`,
		},
		list: {
			filename: "list_contact.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

contacts = reloop.contacts.list(page: 1, limit: 10, status: "subscribed")`,
		},
		update: {
			filename: "update_contact.rb",
			code: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Designer',
  },
}.to_json

response = http.request(request)
contact = JSON.parse(response.body)`,
		},
		delete: {
			filename: "delete_contact.rb",
			code: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(uri)
request['x-api-key'] = 're_123456789'

response = http.request(request)
result = JSON.parse(response.body)`,
		},
		addChannel: {
			filename: "add_contact_channel.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.channels.add_contact("chn_123456789", contact_id: "con_123456789", subscription: "opt_in")`,
		},
		updateChannel: {
			filename: "update_contact_channel.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.channels.update_subscription("chn_123456789", contact_id: "con_123456789", subscription: "opt_out")`,
		},
		addGroup: {
			filename: "add_contact_group.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.groups.add_contact("grp_123456789", contact_id: "con_123456789")`,
		},
		deleteGroup: {
			filename: "delete_contact_group.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.groups.remove_contact("grp_123456789", contact_id: "con_123456789")`,
		},
	},
	rust: {
		add: {
			filename: "add_contact.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().create(CreateContactParams {
        email: "john.doe@example.com".to_string(),
        first_name: Some("John".to_string()),
        last_name: Some("Doe".to_string()),
        status: Some(ContactStatus::Subscribed),
        ..Default::default()
    }).await?;

    Ok(())
}`,
		},
		get: {
			filename: "get_contact.rs",
			code: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().get("cont_123456789").await?;

    Ok(())
}`,
		},
		list: {
			filename: "list_contact.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().list(Some(ListContactsParams {
        page: Some(1),
        limit: Some(10),
        status: Some(ContactStatus::Subscribed),
        ..Default::default()
    })).await?;

    Ok(())
}`,
		},
		update: {
			filename: "update_contact.rs",
			code: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().update("cont_123456789", json!({
        "first_name": "Jane",
        "last_name": "Smith",
        "unsubscribed": false,
        "properties": {
        "company": "Reloop",
        "role": "Designer",
    },
    })).await?;

    Ok(())
}`,
		},
		delete: {
			filename: "delete_contact.rs",
			code: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().delete("cont_123456789").await?;

    Ok(())
}`,
		},
		addChannel: {
			filename: "add_contact_channel.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().add_contact("chn_123456789", AddContactToChannelParams { contact_id: Some("con_123456789".to_string()), subscription: Some("opt_in".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
		},
		updateChannel: {
			filename: "update_contact_channel.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().update_subscription("chn_123456789", UpdateContactChannelParams { contact_id: Some("con_123456789".to_string()), subscription: "opt_out".to_string(), ..Default::default() }).await?;

    Ok(())
}`,
		},
		addGroup: {
			filename: "add_contact_group.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().groups().add_contact("grp_123456789", AddContactToGroupParams { contact_id: Some("con_123456789".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
		},
		deleteGroup: {
			filename: "delete_contact_group.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().groups().remove_contact("grp_123456789", RemoveContactFromGroupParams { contact_id: Some("con_123456789".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
		},
	},
	java: {
		add: {
			filename: "AddContact.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

Contact contact = reloop.contacts.create(Map.of(
    "email", "john.doe@example.com",
    "firstName", "John",
    "lastName", "Doe",
    "status", "subscribed"
));`,
		},
		get: {
			filename: "GetContact.java",
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

reloop.contacts().get("cont_123456789");`,
		},
		list: {
			filename: "ListContact.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

ContactListResponse contacts = reloop.contacts.list(Map.of("page", 1, "limit", 10, "status", "subscribed"));`,
		},
		update: {
			filename: "UpdateContact.java",
			code: `import sh.reloop.email.ReloopEmail;
import java.util.*;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

reloop.contacts().update("cont_123456789", Map.of("first_name", "Jane", "last_name", "Smith", "unsubscribed", false, "properties", Map.of("company", "Reloop", "role", "Designer")));`,
		},
		delete: {
			filename: "DeleteContact.java",
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

reloop.contacts().delete("cont_123456789");`,
		},
		addChannel: {
			filename: "AddContactChannel.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.addContact("chn_123456789", Map.of("contact_id", "con_123456789", "subscription", "opt_in"));`,
		},
		updateChannel: {
			filename: "UpdateContactChannel.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.updateSubscription("chn_123456789", Map.of("contact_id", "con_123456789", "subscription", "opt_out"));`,
		},
		addGroup: {
			filename: "AddContactGroup.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.groups.addContact("grp_123456789", Map.of("contact_id", "con_123456789"));`,
		},
		deleteGroup: {
			filename: "DeleteContactGroup.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.groups.removeContact("grp_123456789", Map.of("contact_id", "con_123456789"));`,
		},
	},
	dotnet: {
		add: {
			filename: "AddContact.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var contact = await reloop.Contacts.CreateAsync(new Dictionary<string, object?>
{
    ["email"] = "john.doe@example.com",
    ["firstName"] = "John",
    ["lastName"] = "Doe",
    ["status"] = "subscribed",
});`,
		},
		get: {
			filename: "GetContact.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().GetAsync("cont_123456789");`,
		},
		list: {
			filename: "ListContact.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var contacts = await reloop.Contacts.ListAsync(new Dictionary<string, object?>
{
    ["page"] = 1,
    ["limit"] = 10,
    ["status"] = "subscribed",
});`,
		},
		update: {
			filename: "UpdateContact.cs",
			code: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

var parameters = new Dictionary<string, object?>();
parameters["first_name"] = "Jane";
parameters["last_name"] = "Smith";
parameters["unsubscribed"] = false;
parameters["properties"] = new Dictionary<string, object?>
{
    ["company"] = "Reloop",
    ["role"] = "Designer",
};
await reloop.Contacts().UpdateAsync("cont_123456789", parameters);`,
		},
		delete: {
			filename: "DeleteContact.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().DeleteAsync("cont_123456789");`,
		},
		addChannel: {
			filename: "AddContactChannel.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.AddContactAsync("chn_123456789", new Dictionary<string, object?> { ["contact_id"] = "con_123456789", ["subscription"] = "opt_in" });`,
		},
		updateChannel: {
			filename: "UpdateContactChannel.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.UpdateSubscriptionAsync("chn_123456789", new Dictionary<string, object?> { ["contact_id"] = "con_123456789", ["subscription"] = "opt_out" });`,
		},
		addGroup: {
			filename: "AddContactGroup.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Groups.AddContactAsync("grp_123456789", new Dictionary<string, object?> { ["contact_id"] = "con_123456789" });`,
		},
		deleteGroup: {
			filename: "DeleteContactGroup.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Groups.RemoveContactAsync("grp_123456789", new Dictionary<string, object?> { ["contact_id"] = "con_123456789" });`,
		},
	},
	curl: {
		add: {
			filename: "add_contact.sh",
			code: `curl -X POST https://reloop.sh/api/contacts/create \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"email": "john.doe@example.com","firstName": "John","lastName": "Doe","status": "subscribed","properties": {"company": "Reloop","role": "Developer"},"groupIds": ["grp_123456789"],"channels": [{"channelId": "chn_123456789","subscription": "opt_in"}]}'`,
		},
		get: {
			filename: "get_contact.sh",
			code: `curl https://reloop.sh/api/contacts/retrieve/cont_123456789 \\
  -H "x-api-key: re_123456789"`,
		},
		list: {
			filename: "list_contact.sh",
			code: `curl "https://reloop.sh/api/contacts/list?page=1&limit=10&status=subscribed" \\\\
  -H "x-api-key: rl_123456789"`,
		},
		update: {
			filename: "update_contact.sh",
			code: `curl -X PATCH https://reloop.sh/api/contacts/cont_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
  "firstName": "Jane",
  "lastName": "Smith",
  "status": "subscribed",
  "properties": {
    "company": "Reloop",
    "role": "Designer"
  }
}'`,
		},
		delete: {
			filename: "delete_contact.sh",
			code: `curl -X DELETE https://reloop.sh/api/contacts/cont_123456789 \\
  -H "x-api-key: re_123456789"`,
		},
		addChannel: {
			filename: "add_contact_channel.sh",
			code: `curl -X POST https://reloop.sh/api/contacts/channel/chn_123456789 \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"contact_id": "con_123456789","subscription": "opt_in"}'`,
		},
		updateChannel: {
			filename: "update_contact_channel.sh",
			code: `curl -X PATCH https://reloop.sh/api/contacts/channel/chn_123456789 \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"contact_id": "con_123456789","subscription": "opt_out"}'`,
		},
		addGroup: {
			filename: "add_contact_group.sh",
			code: `curl -X POST https://reloop.sh/api/contacts/group/grp_123456789 \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"contact_id": "con_123456789"}'`,
		},
		deleteGroup: {
			filename: "delete_contact_group.sh",
			code: `curl -X DELETE https://reloop.sh/api/contacts/group/grp_123456789 \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"contact_id": "con_123456789"}'`,
		},
	},
};
