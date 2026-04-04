local kumo = require 'kumo'

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
  if authc == 'reloop' and password == 'reloop123' then
    -- THIS is what docs expect
    conn_meta:set_meta('authz_id', authc)
    return true
  end
  return false
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
  return kumo.make_queue_config {
    protocol = {
      smtp = {
        mx_list = { 'reloop-mailpit:1025' },
      },
    },
  }
end)
