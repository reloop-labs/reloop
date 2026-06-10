local kumo = require 'kumo'
local constants = require 'policy.constants'
local utils = require 'policy.utils'
utils.init(kumo)



-- Helper function to apply business logic to both SMTP and HTTP generated messages
local function apply_reloop_logic(msg, api_key)
  local msg_id = msg:id()

  local header_api_key = msg:get_first_named_header_value('X-Api-Key')
  if header_api_key and header_api_key ~= "" then
    api_key = header_api_key
    print("[LOG-INCOMING] [" .. msg_id .. "] Found X-Api-Key header: using it as api_key")
  end
  msg:remove_all_named_headers('X-Api-Key')
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

  print("[LOG-INCOMING] [" .. msg_id .. "] processing message: api_key=" .. api_key .. " domain=" .. domain .. " recipients=" .. #to_emails)

  if api_key == "" or domain == "" then
    print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Missing credentials or sender domain")
    kumo.reject(550, "5.7.1 Missing credentials or sender domain.")
    return
  end

  local client = kumo.http.build_client({
    danger_accept_invalid_certs = true
  })

  -- Check if message was already logged by internal backend HTTP inject
  local existing_log_id = msg:get_first_named_header_value('X-Email-Log-ID')

  if not existing_log_id then
    local target_url = constants.kumomta_url .. "/v1/log-incoming"
    print("[LOG-INCOMING] [" .. msg_id .. "] calling webhook: " .. target_url)

    local status, response = pcall(function()
      local payload = {
        domainName = domain,
        messageId = message_id,
        providerMessageId = msg_id,
        fromEmail = from_email,
        toEmails = to_emails,
        subject = subject,
        size = size,
        textBody = text_body,
        htmlBody = html_body,
        rawMessage = data
      }
      local payload_str = kumo.serde.json_encode(payload)
      print("[LOG-INCOMING PAYLOAD] [" .. msg_id .. "] " .. payload_str)

      local req = client:post(target_url)
      return req
        :header("x-api-key", api_key)
        :header("Content-Type", "application/json")
        :body(payload_str)
        :send()
    end)

    if not status then
      print("[LOG-INCOMING] [" .. msg_id .. "] FAILED to send request: " .. tostring(response))
      kumo.reject(451, "4.3.0 Temporary failure contacting log-incoming endpoint: " .. tostring(response))
      return
    end

    local code = response:status_code()
    local body_text = response:text()
    print("[LOG-INCOMING] [" .. msg_id .. "] response: status=" .. tostring(code) .. " body=" .. tostring(body_text))

    if code == 200 then
      -- success, store the log ID in metadata for webhook tracking
      local body = kumo.serde.json_parse(body_text)
      if body and body.id then
        msg:set_meta('X-Email-Log-ID', body.id)
        print("[LOG-INCOMING] [" .. msg_id .. "] stored log ID: " .. body.id)

        -- Apply tracking injection
        local new_data = utils.inject_tracking(
          msg:get_data(),
          body.id,
          body.trackingDomain,
          body.clickTracking,
          body.openTracking
        )
        if new_data ~= msg:get_data() then
          msg:set_data(new_data)
          print("[TRACKING] [" .. msg_id .. "] injected tracking into message (domain: " .. tostring(body.trackingDomain) .. ")")
        end
      else
        print("[LOG-INCOMING] [" .. msg_id .. "] ERROR: backend returned 200 but no ID found")
      end
    elseif code == 401 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Invalid API key")
      kumo.reject(535, "5.7.8 Invalid API key")
      return
    elseif code == 404 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Domain " .. domain .. " not found")
      kumo.reject(550, "5.7.1 Domain " .. domain .. " not found")
      return
    elseif code == 409 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Message ID already exists")
      kumo.reject(550, "5.7.1 Message ID already exists")
      return
    else
      print("[LOG-INCOMING] [" .. msg_id .. "] ERROR: Unhandled status code " .. tostring(code))
      kumo.reject(451, "4.3.0 Temporary failure verifying API key or domain status")
      return
    end
  else
    msg:set_meta('X-Email-Log-ID', existing_log_id)
    print("[LOG-INCOMING] [" .. msg_id .. "] Skipped log-incoming, already logged with ID=" .. existing_log_id)
  end

  -- Ensure mandatory headers for deliverability
  if not msg:get_first_named_header_value('Date') then
    local date_str = os.date("!%a, %d %b %Y %H:%M:%S +0000")
    msg:append_header('Date', date_str)
    print("[HEADERS] [" .. msg_id .. "] Injected missing Date: " .. date_str)
  end

  if not msg:get_first_named_header_value('MIME-Version') then
    msg:append_header('MIME-Version', '1.0')
    print("[HEADERS] [" .. msg_id .. "] Injected missing MIME-Version: 1.0")
  end

  local current_mid = msg:get_first_named_header_value('Message-ID')
  if not current_mid or not current_mid:find("^<.+@.+>$") then
    local new_mid = string.format("<%s@%s>", msg_id, domain)
    msg:append_header('Message-ID', new_mid)
    print("[HEADERS] [" .. msg_id .. "] Injected/Fixed Message-ID: " .. new_mid)
  end

  -- DKIM sign the message (MUST BE LAST AFTER ALL HEADER/BODY CHANGES)
  local dkim_target = constants.kumomta_url .. "/v1/dkim-key"
  print("[DKIM] [" .. msg_id .. "] fetching key from: " .. dkim_target)

  local dkim_ok, dkim_resp = pcall(function()
    local req = client:post(dkim_target)
    return req
      :header("x-api-key", api_key)
      :header("Content-Type", "application/json")
      :body(kumo.serde.json_encode({ domainName = domain }))
      :send()
  end)

  if dkim_ok then
    local dkim_code = dkim_resp:status_code()
    local dkim_body = dkim_resp:text()
    if dkim_code == 200 then
      local dkim_data = kumo.serde.json_parse(dkim_body)
      if dkim_data and dkim_data.privateKey and dkim_data.selector then
        local sign_ok, sign_err = pcall(function()
          local signer = kumo.dkim.rsa_sha256_signer {
            domain   = domain,
            selector = dkim_data.selector,
            headers  = { 'From', 'To', 'Subject', 'Date', 'Message-ID' },
            key      = { key_data = dkim_data.privateKey },
          }
          msg:dkim_sign(signer)
        end)
        if sign_ok then
          print("[DKIM] [" .. msg_id .. "] signed successfully: selector=" .. dkim_data.selector)
        else
          print("[DKIM] [" .. msg_id .. "] signing failed: " .. tostring(sign_err))
        end
      else
        print("[DKIM] [" .. msg_id .. "] ERROR: key data missing in response")
      end
    else
      print("[DKIM] [" .. msg_id .. "] fetch failed: status=" .. tostring(dkim_code))
    end
  else
    print("[DKIM] [" .. msg_id .. "] fetch error (pcall failed): " .. tostring(dkim_resp))
  end
end

-- AUTH
kumo.on('smtp_server_auth_plain', function(authz, authc, password, conn_meta)
  -- Store API key; actual key + domain verification happens on message receipt
  conn_meta:set_meta('api_key', password)
  conn_meta:set_meta('authz_id', authc)
  return true
end)

kumo.on('http_server_validate_auth_basic', function(user, password)
  -- Return an AuthInfo object containing the password as the identity
  -- so that http_message_generated receives the password in http_auth
  return {
    identities = {
      { identity = password, context = 'HttpBasicAuth' },
    }
  }
end)

-- Relay control: only authenticated senders can relay
kumo.on('get_listener_domain', function(domain, listener, conn_meta)
  if conn_meta:get_meta('authz_id') then
    return kumo.make_listener_domain {
      relay_to = true,
    }
  end

  -- Reject unauthenticated senders — inbound mail is handled by the
  -- dedicated inbound MTA service, not this outbound relay.
  return kumo.make_listener_domain {
    relay_to = false,
  }
end)



-- Outbound: API Key + Domain Verification on Receipt
kumo.on('smtp_server_message_received', function(msg)
  local api_key = msg:get_meta('api_key') or ""

  if api_key == "" then
    print("[SMTP] [" .. msg:id() .. "] Rejected: no API key (unauthenticated)")
    kumo.reject(550, "5.7.1 Authentication required")
    return
  end

  apply_reloop_logic(msg, api_key)
end)

kumo.on('http_message_generated', function(msg)
  local http_auth = msg:get_meta('http_auth')
  local api_key = ""
  if type(http_auth) == "table" and http_auth.password then
    api_key = http_auth.password
  elseif type(http_auth) == "string" and string.match(http_auth, "^rl_") then
    api_key = http_auth
  end
  apply_reloop_logic(msg, api_key)
end)
