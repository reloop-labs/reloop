local kumo = require 'kumo'
local log_hooks = require 'policy-extras.log_hooks'

local kumomta_key = os.getenv("X_KUMOMTA_KEY") or "reloop"
local kumomta_endpoint = os.getenv("KUMOMTA_ENDPOINT") or "http://local.reloop.sh"

local function url_encode(str)
  if str then
    str = str:gsub("\n", "\r\n")
    str = str:gsub("([^%w %-%_%.%~])", function(c)
      return string.format("%%%02X", string.byte(c))
    end)
    str = str:gsub(" ", "+")
  end
  return str
end

local tracking_url = os.getenv("TRACKING_BASE_URL") or kumomta_endpoint

local function inject_tracking(data, email_log_id)
  local tracking_base_url = tracking_url:gsub("/+$", "")

  -- Only proceed if it looks like HTML
  if not data:find("text/html") then
    return data
  end

  -- 1. Inject pixel before </body>
  local pixel = string.format('<img src="%s/api/mail/v1/track/open/%s" width="1" height="1" style="display:none" alt="" />', tracking_base_url, email_log_id)
  if data:find("</body>") then
    data = data:gsub("</body>", pixel .. "</body>")
  else
    -- If no </body>, just append at end (naive but better than nothing)
    data = data .. pixel
  end

  -- 2. Rewrite links
  -- Aggressive approach for raw MIME/Quoted-Printable: href=3D"URL" or href="URL"
  data = data:gsub('(href=3D?["\']?)(https?://[^"%s >]+)(["\']?)', function(prefix, url, suffix)
    -- Skip if already tracked
    if url:find("/api/mail/v1/track/click") then
      return nil
    end
    local tracked_url = string.format("%s/api/mail/v1/track/click/%s?url=%s", tracking_base_url, email_log_id, url_encode(url))
    return prefix .. tracked_url .. suffix
  end)

  return data
end

-- Send a JSON webhook to the backend for log updates.
log_hooks:new {
  name = 'webhook',
  log_parameters = {
    headers = { 'Subject', 'X-Email-Log-ID' },
    meta = { 'X-Email-Log-ID' },
  },
  constructor = function(domain, tenant, campaign)
    local connection = {}
    local client = kumo.http.build_client {}

    function connection:send(message)
      local response = client
        :post(kumomta_endpoint .. '/api/kumomta/v1/webhook/kumomta')
        :header('Content-Type', 'application/json')
        :header('x-kumomta-key', kumomta_key)
        :body('[' .. message:get_data() .. ']')
        :send()

      local disposition = string.format(
        '%d %s: %s',
        response:status_code(),
        response:status_reason(),
        response:text()
      )

      if response:status_is_success() then
        return disposition
      end
      kumo.reject(500, disposition)
    end

    function connection:close()
      client:close()
    end

    return connection
  end,
}

kumo.on('init', function()
  kumo.define_spool {
    name = 'data',
    path = '/var/spool/kumomta/data',
  }

  kumo.define_spool {
    name = 'meta',
    path = '/var/spool/kumomta/meta',
  }

  kumo.start_esmtp_listener {
    listen = '0.0.0.0:25',

    -- allow connection (NOT relay)
  }

  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = { '0.0.0.0/0' },
  }
end)

-- AUTH
kumo.on('smtp_server_auth_plain', function(authz, authc, password, conn_meta)
  -- Store API key; actual key + domain verification happens on message receipt
  conn_meta:set_meta('api_key', password)
  conn_meta:set_meta('authz_id', authc)
  return true
end)

-- 🔥 THIS is the REAL relay control (docs way)
kumo.on('get_listener_domain', function(domain, listener, conn_meta)
  if conn_meta:get_meta('authz_id') then
    return kumo.make_listener_domain {
      relay_to = true,
    }
  end
end)

-- Route to Mailpit
kumo.on('get_queue_config', function(domain, tenant, campaign, routing_domain)
  if domain:find('%.log_hook$') then
    return kumo.make_queue_config {
      -- Use default for webhooks (which is the lua constructor we defined)
    }
  end

  return kumo.make_queue_config {
    protocol = {
      smtp = {
        mx_list = { 'reloop-mailpit:1025' },
      },
    },
  }
end)

-- Enforce API Key + Domain Verification on Receipt
kumo.on('smtp_server_message_received', function(msg)
  local api_key = msg:get_meta('api_key') or ""

  local sender = msg:sender()
  local domain = ""
  local from_email = ""
  if sender then
    from_email = tostring(sender)
    domain = string.match(from_email, "@([^>]+)>?") or ""
  end

  local to_emails = {}
  local to_header = msg:get_first_named_header_value('To')
  if to_header then
    table.insert(to_emails, tostring(to_header))
  end

  local message_id = msg:get_first_named_header_value('Message-ID') or ""
  local subject = msg:get_first_named_header_value('Subject') or ""
  local data = msg:get_data()
  local size = #data
  local text_body = ""
  local html_body = ""

  -- Simple body extraction (after headers)
  local _, body_start = string.find(data, "\r?\n\r?\n")
  if body_start then
    text_body = string.sub(data, body_start + 1)
  else
    text_body = data
  end

  print("[LOG-INCOMING] api_key=" .. api_key .. " domain=" .. domain)

  if api_key == "" or domain == "" then
    kumo.reject(550, "5.7.1 Missing credentials or sender domain.")
    return
  end

  local client = kumo.http.build_client({
    headers = {
      ["x-kumomta-key"] = kumomta_key,
      ["Content-Type"] = "application/json"
    }
  })

  local status, response = pcall(function()
    local req = client:post(kumomta_endpoint .. "/api/kumomta/v1/log-incoming")
    return req
      :header("x-kumomta-key", kumomta_key)
      :header("Content-Type", "application/json")
      :body(kumo.serde.json_encode({
        key = api_key,
        domainName = domain,
        messageId = message_id,
        providerMessageId = msg:id(),
        fromEmail = from_email,
        toEmails = to_emails,
        subject = subject,
        size = size,
        textBody = text_body,
        htmlBody = html_body,
        rawMessage = data
      }))
      :send()
  end)

  if not status then
    print("[LOG-INCOMING] pcall failed: " .. tostring(response))
    kumo.reject(451, "4.3.0 Temporary failure contacting log-incoming endpoint")
    return
  end

  local code = response:status_code()
  local body_text = response:text()
  print("[LOG-INCOMING] status=" .. tostring(code) .. " body=" .. tostring(body_text))

  if code == 200 then
    -- success, store the log ID in metadata for webhook tracking
    local body = kumo.serde.json_parse(body_text)
    if body and body.id then
      msg:set_meta('X-Email-Log-ID', body.id)

      -- Apply tracking injection
      local new_data = inject_tracking(msg:get_data(), body.id)
      if new_data ~= msg:get_data() then
        msg:set_data(new_data)
        print("[TRACKING] injected tracking into message " .. msg:id())
      end
    end
  elseif code == 401 then
    kumo.reject(535, "5.7.8 Invalid API key")
  elseif code == 404 then
    kumo.reject(550, "5.7.1 Domain " .. domain .. " not found")
  else
    kumo.reject(451, "4.3.0 Temporary failure verifying API key or domain status")
  end
end)
