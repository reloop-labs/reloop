export const codeExamples = {
	nodejs: {
		add: {
			filename: "create_property.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: property, error } = await reloop.contacts.createProperty({
  name: "company_name",
  type: "string",
  fallbackValue: "Unknown",
});
if (error) throw error;`,
		},
		list: {
			filename: "list_properties.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: properties, error } = await reloop.contacts.listProperties({ page: 1, limit: 10 });
if (error) throw error;`,
		},
		update: {
			filename: "update_property.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: property, error } = await reloop.contacts.updateProperty("prop_123456789", {
  fallbackValue: "N/A",
});
if (error) throw error;`,
		},
		delete: {
			filename: "delete_property.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, error } = await reloop.contacts.deleteProperty("prop_123456789");
if (error) throw error;`,
		},
	},
	python: {
		add: {
			filename: "create_property.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

property = reloop.contacts.create_property(
    name="company_name",
    type="string",
    fallback_value="Unknown",
)`,
		},
		list: {
			filename: "list_properties.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

properties = reloop.contacts.list_properties(page=1, limit=10)`,
		},
		update: {
			filename: "update_property.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

property = reloop.contacts.update_property("prop_123456789", fallback_value="N/A")`,
		},
		delete: {
			filename: "delete_property.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.delete_property("prop_123456789")`,
		},
	},
	php: {
		add: {
			filename: "create_property.php",
			code: `$reloop = Reloop::client('rl_123456789');

$property = $reloop->contacts->createProperty([
    'name' => 'company_name',
    'type' => 'string',
    'fallback_value' => 'Unknown',
]);`,
		},
		list: {
			filename: "list_properties.php",
			code: `$reloop = Reloop::client('rl_123456789');

$properties = $reloop->contacts->listProperties(['page' => 1, 'limit' => 10]);`,
		},
		update: {
			filename: "update_property.php",
			code: `$reloop = Reloop::client('rl_123456789');

$property = $reloop->contacts->updateProperty('prop_123456789', ['fallback_value' => 'N/A']);`,
		},
		delete: {
			filename: "delete_property.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->deleteProperty('prop_123456789');`,
		},
	},
	go: {
		add: {
			filename: "create_property.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

property, _ := client.Contacts.CreateProperty(map[string]interface{}{
    "name": "company_name",
    "type": "string",
    "fallbackValue": "Unknown",
})`,
		},
		list: {
			filename: "list_properties.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

properties, _ := client.Contacts.ListProperties(map[string]interface{}{"page": 1, "limit": 10})`,
		},
		update: {
			filename: "update_property.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

property, _ := client.Contacts.UpdateProperty("prop_123456789", map[string]interface{"fallbackValue": "N/A"})`,
		},
		delete: {
			filename: "delete_property.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.DeleteProperty("prop_123456789")`,
		},
	},
	ruby: {
		add: {
			filename: "create_property.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

property = reloop.contacts.create_property(
  name: "company_name",
  type: "string",
  fallback_value: "Unknown",
)`,
		},
		list: {
			filename: "list_properties.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

properties = reloop.contacts.list_properties(page: 1, limit: 10)`,
		},
		update: {
			filename: "update_property.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

property = reloop.contacts.update_property("prop_123456789", fallback_value: "N/A")`,
		},
		delete: {
			filename: "delete_property.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.delete_property("prop_123456789")`,
		},
	},
	rust: {
		add: {
			filename: "create_property.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().create_property(CreatePropertyParams {
        name: "company_name".to_string(),
        property_type: PropertyType::String,
        fallback_value: Some("Unknown".to_string()),
        ..Default::default()
    }).await?;

    Ok(())
}`,
		},
		list: {
			filename: "list_properties.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().list_properties(Some(ListPropertiesParams { page: Some(1), limit: Some(10), ..Default::default() })).await?;

    Ok(())
}`,
		},
		update: {
			filename: "update_property.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().update_property("prop_123456789", UpdatePropertyParams { fallback_value: Some("N/A".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
		},
		delete: {
			filename: "delete_property.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().delete_property("prop_123456789").await?;

    Ok(())
}`,
		},
	},
	java: {
		add: {
			filename: "CreateProperty.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.createProperty(Map.of(
    "name", "company_name",
    "type", "string",
    "fallbackValue", "Unknown"
));`,
		},
		list: {
			filename: "ListProperties.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.listProperties(Map.of("page", 1, "limit", 10));`,
		},
		update: {
			filename: "UpdateProperty.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.updateProperty("prop_123456789", Map.of("fallbackValue", "N/A"));`,
		},
		delete: {
			filename: "DeleteProperty.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.deleteProperty("prop_123456789");`,
		},
	},
	dotnet: {
		add: {
			filename: "CreateProperty.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.CreatePropertyAsync(new Dictionary<string, object?>
{
    ["name"] = "company_name",
    ["type"] = "string",
    ["fallbackValue"] = "Unknown",
});`,
		},
		list: {
			filename: "ListProperties.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.ListPropertiesAsync(new Dictionary<string, object?> { ["page"] = 1, ["limit"] = 10 });`,
		},
		update: {
			filename: "UpdateProperty.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.UpdatePropertyAsync("prop_123456789", new Dictionary<string, object?> { ["fallbackValue"] = "N/A" });`,
		},
		delete: {
			filename: "DeleteProperty.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.DeletePropertyAsync("prop_123456789");`,
		},
	},
	curl: {
		add: {
			filename: "create_property.sh",
			code: `curl -X POST https://reloop.sh/api/contacts/v1/properties/create \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"name": "company_name","type": "string","fallbackValue": "Unknown"}'`,
		},
		list: {
			filename: "list_properties.sh",
			code: `curl "https://reloop.sh/api/contacts/v1/properties/list?page=1&limit=10" \\\\
  -H "x-api-key: rl_123456789"`,
		},
		update: {
			filename: "update_property.sh",
			code: `curl -X PATCH https://reloop.sh/api/contacts/v1/properties/prop_123456789 \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"fallbackValue": "N/A"}'`,
		},
		delete: {
			filename: "delete_property.sh",
			code: `curl -X DELETE https://reloop.sh/api/contacts/v1/properties/prop_123456789 \\\\
  -H "x-api-key: rl_123456789"`,
		},
	},
};
