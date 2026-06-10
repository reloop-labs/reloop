local kumo = require 'kumo'
local constants = require 'policy.constants'

-- Persistent NATS client
local nats_client
local function get_nats_client()
  if not nats_client then
    nats_client = kumo.nats.connect {
      servers = { constants.nats_url },
    }
  end
  return nats_client
end

-- Accept all domains — this is an open MX receiver
kumo.on('get_listener_domain', function(domain, listener, conn_meta)
  return kumo.make_listener_domain {
    relay_to = true,
  }
end)

-- Validate recipient mailbox before accepting the message
kumo.on('smtp_server_rcpt_to', function(recipient, conn_meta)
  local recipient_str = recipient.email or tostring(recipient)
  print("[INBOUND RCPT TO] Checking recipient: " .. tostring(recipient_str))

  local client = kumo.http.build_client({
    danger_accept_invalid_certs = true
  })

  local target_url = constants.check_recipient_url .. "/v1/check-recipient"
  local payload = { email = recipient_str }
  local payload_str = kumo.serde.json_encode(payload)

  local ok, resp = pcall(function()
    local req = client:post(target_url)
    return req
      :header("Content-Type", "application/json")
      :body(payload_str)
      :send()
  end)

  if not ok then
    print("[INBOUND RCPT TO] Error contacting check-recipient: " .. tostring(resp))
    kumo.reject(451, "4.3.0 Temporary failure validating recipient")
    return
  end

  local code = resp:status_code()
  local body_text = resp:text()

  if code == 200 then
    local data = kumo.serde.json_parse(body_text)
    if data and data.allowed then
      print("[INBOUND RCPT TO] Allowed: " .. recipient_str)
    else
      print("[INBOUND RCPT TO] Rejected (not allowed): " .. recipient_str)
      kumo.reject(550, "5.1.1 User unknown")
    end
  else
    print("[INBOUND RCPT TO] Rejected (status " .. tostring(code) .. "): " .. recipient_str)
    kumo.reject(550, "5.1.1 User unknown")
  end
end)

-- Process received inbound email: RSpamD scan → NATS publish
kumo.on('smtp_server_message_received', function(msg)
  local msg_id = msg:id()
  print("[INBOUND] [" .. msg_id .. "] Processing inbound email")

  -- 1. RSpamD spam check + header injection
  local client = kumo.http.build_client({
    danger_accept_invalid_certs = true
  })
  local ok_rspamd, resp_rspamd = pcall(function()
    local req = client:post(constants.rspamd_url)
    return req:body(msg:get_data()):send()
  end)

  local rspamd_score = nil
  local rspamd_action = nil
  local rspamd_symbols = {}

  if ok_rspamd then
    local code = resp_rspamd:status_code()
    if code == 200 then
      local data = kumo.serde.json_parse(resp_rspamd:text())
      if data then
        rspamd_score = data['score']
        rspamd_action = data['action']

        -- Collect top symbol names for X-Spam-Status
        if data['symbols'] then
          for name, _ in pairs(data['symbols']) do
            table.insert(rspamd_symbols, name)
          end
        end

        -- Hard reject high-confidence spam at SMTP level
        if rspamd_score and rspamd_score >= 15 then
          print("[INBOUND RSPAMD] [" .. msg_id .. "] Rejected spam (score: " .. tostring(rspamd_score) .. ")")
          kumo.reject(550, 'Message rejected as spam')
          return
        end

        -- Inject X-Spam-* headers into the message for downstream processing
        local is_spam = rspamd_action == "reject" or rspamd_action == "add header" or (rspamd_score and rspamd_score >= 5)
        local flag_value = is_spam and "YES" or "NO"
        local status_prefix = is_spam and "Yes" or "No"
        local symbols_str = table.concat(rspamd_symbols, ",")
        local status_value = status_prefix .. ", score=" .. tostring(rspamd_score or 0) .. " required=5 tests=" .. symbols_str
        
        msg:append_header('X-Spam-Score', tostring(rspamd_score or 0))
        msg:append_header('X-Spam-Flag', flag_value)
        msg:append_header('X-Spam-Status', status_value)
        msg:append_header('X-Spam-Action', rspamd_action or "no action")

        print("[INBOUND RSPAMD] [" .. msg_id .. "] Passed (score: " .. tostring(rspamd_score) .. ", action: " .. tostring(rspamd_action) .. ", flag: " .. flag_value .. ")")
      end
    else
      print("[INBOUND RSPAMD] [" .. msg_id .. "] Warning: check returned HTTP " .. tostring(code))
    end
  else
    print("[INBOUND RSPAMD] [" .. msg_id .. "] Warning: failed to connect: " .. tostring(resp_rspamd))
  end

  -- 2. Publish raw message to NATS for inbox service processing
  local nc = get_nats_client()
  local ok, err = pcall(function()
    local payload = {
      rawMessage = msg:get_data()
    }
    nc:publish {
      subject = 'kumomta.inbound_received',
      payload = kumo.serde.json_encode(payload),
    }
  end)

  if not ok then
    print("[INBOUND] [" .. msg_id .. "] FAILED to publish to NATS: " .. tostring(err))
    nats_client = nil
    kumo.reject(451, "4.3.0 Temporary failure processing inbound email")
    return
  end

  print("[INBOUND] [" .. msg_id .. "] Successfully published to NATS")
end)
