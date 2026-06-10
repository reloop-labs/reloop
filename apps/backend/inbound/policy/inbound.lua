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

  -- 1. RSpamD spam check
  local client = kumo.http.build_client({
    danger_accept_invalid_certs = true
  })
  local ok_rspamd, resp_rspamd = pcall(function()
    local req = client:post(constants.rspamd_url)
    return req:body(msg:get_data()):send()
  end)

  if ok_rspamd then
    local code = resp_rspamd:status_code()
    if code == 200 then
      local data = kumo.serde.json_parse(resp_rspamd:text())
      if data and data['score'] and data['score'] >= 15 then
        print("[INBOUND RSPAMD] [" .. msg_id .. "] Rejected spam (score: " .. tostring(data['score']) .. ")")
        kumo.reject(550, 'Message rejected as spam')
        return
      else
        print("[INBOUND RSPAMD] [" .. msg_id .. "] Passed (score: " .. tostring(data and data['score'] or "unknown") .. ")")
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
