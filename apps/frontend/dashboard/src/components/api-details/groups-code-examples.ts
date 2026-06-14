export const codeExamples = {
	nodejs: {
		add: {
			filename: "create_group.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: group, error } = await reloop.contacts.createGroup({ name: "Beta Testers" });
if (error) throw error;`,
		},
		get: {
			filename: "get_group.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: group, error } = await reloop.contacts.getGroup("grp_123456789");
if (error) throw error;`,
		},
		list: {
			filename: "list_groups.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: groups, error } = await reloop.contacts.listGroups({ page: 1, limit: 10 });
if (error) throw error;`,
		},
		update: {
			filename: "update_group.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: group, error } = await reloop.contacts.updateGroup("grp_123456789", { name: "Loyal Customers" });
if (error) throw error;`,
		},
		delete: {
			filename: "delete_group.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, error } = await reloop.contacts.deleteGroup("grp_123456789");
if (error) throw error;`,
		},
		getContacts: {
			filename: "get_group_contacts.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, error } = await reloop.contacts.groups.listContacts("grp_123456789", {
  page: 1,
  limit: 10,
});
if (error) throw error;`,
		},
	},
	python: {
		add: {
			filename: "create_group.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

group = reloop.contacts.create_group(name="Beta Testers")`,
		},
		get: {
			filename: "get_group.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

group = reloop.contacts.get_group("grp_123456789")`,
		},
		list: {
			filename: "list_groups.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

groups = reloop.contacts.list_groups(page=1, limit=10)`,
		},
		update: {
			filename: "update_group.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

group = reloop.contacts.update_group("grp_123456789", name="Loyal Customers")`,
		},
		delete: {
			filename: "delete_group.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.delete_group("grp_123456789")`,
		},
		getContacts: {
			filename: "get_group_contacts.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.groups.list_contacts("grp_123456789", page=1, limit=10)`,
		},
	},
	php: {
		add: {
			filename: "create_group.php",
			code: `$reloop = Reloop::client('rl_123456789');

$group = $reloop->contacts->createGroup(['name' => 'Beta Testers']);`,
		},
		get: {
			filename: "get_group.php",
			code: `$reloop = Reloop::client('rl_123456789');

$group = $reloop->contacts->getGroup('grp_123456789');`,
		},
		list: {
			filename: "list_groups.php",
			code: `$reloop = Reloop::client('rl_123456789');

$groups = $reloop->contacts->listGroups(['page' => 1, 'limit' => 10]);`,
		},
		update: {
			filename: "update_group.php",
			code: `$reloop = Reloop::client('rl_123456789');

$group = $reloop->contacts->updateGroup('grp_123456789', ['name' => 'Loyal Customers']);`,
		},
		delete: {
			filename: "delete_group.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->deleteGroup('grp_123456789');`,
		},
		getContacts: {
			filename: "get_group_contacts.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->groups->listContacts('grp_123456789', ['page' => 1, 'limit' => 10]);`,
		},
	},
	go: {
		add: {
			filename: "create_group.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

group, _ := client.Contacts.CreateGroup(map[string]interface{}{"name": "Beta Testers"})`,
		},
		get: {
			filename: "get_group.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

group, _ := client.Contacts.GetGroup("grp_123456789")`,
		},
		list: {
			filename: "list_groups.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

groups, _ := client.Contacts.ListGroups(map[string]interface{}{"page": 1, "limit": 10})`,
		},
		update: {
			filename: "update_group.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

group, _ := client.Contacts.UpdateGroup("grp_123456789", map[string]interface{"name": "Loyal Customers"})`,
		},
		delete: {
			filename: "delete_group.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.DeleteGroup("grp_123456789")`,
		},
		getContacts: {
			filename: "get_group_contacts.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Groups.ListContacts("grp_123456789", map[string]interface{"page": 1, "limit": 10})`,
		},
	},
	ruby: {
		add: {
			filename: "create_group.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

group = reloop.contacts.create_group(name: "Beta Testers")`,
		},
		get: {
			filename: "get_group.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

group = reloop.contacts.get_group("grp_123456789")`,
		},
		list: {
			filename: "list_groups.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

groups = reloop.contacts.list_groups(page: 1, limit: 10)`,
		},
		update: {
			filename: "update_group.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

group = reloop.contacts.update_group("grp_123456789", name: "Loyal Customers")`,
		},
		delete: {
			filename: "delete_group.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.delete_group("grp_123456789")`,
		},
		getContacts: {
			filename: "get_group_contacts.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.groups.list_contacts("grp_123456789", page: 1, limit: 10)`,
		},
	},
	rust: {
		add: {
			filename: "create_group.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().create_group(CreateGroupParams { name: "Beta Testers".to_string() }).await?;

    Ok(())
}`,
		},
		get: {
			filename: "get_group.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().get_group("grp_123456789").await?;

    Ok(())
}`,
		},
		list: {
			filename: "list_groups.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().list_groups(Some(ListGroupsParams { page: Some(1), limit: Some(10), ..Default::default() })).await?;

    Ok(())
}`,
		},
		update: {
			filename: "update_group.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().update_group("grp_123456789", UpdateGroupParams { name: "Loyal Customers".to_string() }).await?;

    Ok(())
}`,
		},
		delete: {
			filename: "delete_group.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().delete_group("grp_123456789").await?;

    Ok(())
}`,
		},
		getContacts: {
			filename: "get_group_contacts.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().groups().list_contacts("grp_123456789", Some(ListContactsParams { page: Some(1), limit: Some(10), ..Default::default() })).await?;

    Ok(())
}`,
		},
	},
	java: {
		add: {
			filename: "CreateGroup.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.createGroup(Map.of("name", "Beta Testers"));`,
		},
		get: {
			filename: "GetGroup.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.getGroup("grp_123456789");`,
		},
		list: {
			filename: "ListGroups.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.listGroups(Map.of("page", 1, "limit", 10));`,
		},
		update: {
			filename: "UpdateGroup.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.updateGroup("grp_123456789", Map.of("name", "Loyal Customers"));`,
		},
		delete: {
			filename: "DeleteGroup.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.deleteGroup("grp_123456789");`,
		},
		getContacts: {
			filename: "GetGroupContacts.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.groups.listContacts("grp_123456789", Map.of("page", 1, "limit", 10));`,
		},
	},
	dotnet: {
		add: {
			filename: "CreateGroup.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.CreateGroupAsync(new Dictionary<string, object?> { ["name"] = "Beta Testers" });`,
		},
		get: {
			filename: "GetGroup.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.GetGroupAsync("grp_123456789");`,
		},
		list: {
			filename: "ListGroups.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.ListGroupsAsync(new Dictionary<string, object?> { ["page"] = 1, ["limit"] = 10 });`,
		},
		update: {
			filename: "UpdateGroup.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.UpdateGroupAsync("grp_123456789", new Dictionary<string, object?> { ["name"] = "Loyal Customers" });`,
		},
		delete: {
			filename: "DeleteGroup.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.DeleteGroupAsync("grp_123456789");`,
		},
		getContacts: {
			filename: "GetGroupContacts.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Groups.ListContactsAsync("grp_123456789", new Dictionary<string, object?> { ["page"] = 1, ["limit"] = 10 });`,
		},
	},
	curl: {
		add: {
			filename: "create_group.sh",
			code: `curl -X POST https://reloop.sh/api/contacts/v1/groups/create \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"name": "Beta Testers"}'`,
		},
		get: {
			filename: "get_group.sh",
			code: `curl "https://reloop.sh/api/contacts/v1/groups/grp_123456789" \\\\
  -H "x-api-key: rl_123456789"`,
		},
		list: {
			filename: "list_groups.sh",
			code: `curl "https://reloop.sh/api/contacts/v1/groups/list?page=1&limit=10" \\\\
  -H "x-api-key: rl_123456789"`,
		},
		update: {
			filename: "update_group.sh",
			code: `curl -X PATCH https://reloop.sh/api/contacts/v1/groups/grp_123456789 \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"name": "Loyal Customers"}'`,
		},
		delete: {
			filename: "delete_group.sh",
			code: `curl -X DELETE https://reloop.sh/api/contacts/v1/groups/grp_123456789 \\\\
  -H "x-api-key: rl_123456789"`,
		},
		getContacts: {
			filename: "get_group_contacts.sh",
			code: `curl "https://reloop.sh/api/contacts/v1/groups/grp_123456789/contacts?page=1&limit=10" \\\\
  -H "x-api-key: rl_123456789"`,
		},
	},
};
