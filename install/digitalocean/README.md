# Deploy a Reloop evaluation Droplet

The **Deploy to DigitalOcean** workflow creates an Ubuntu 24.04 x64 Droplet with
4 vCPUs and 8 GB RAM, then runs the existing VPS installer through cloud-init.
It uses the installer files from the selected workflow commit and published
Reloop container images. It does not build containers.

DigitalOcean [blocks SMTP ports 25, 465, and 587](https://docs.digitalocean.com/products/droplets/details/limits/).
Use this deployment to evaluate the dashboard and API. It cannot deliver
production mail directly. The Droplet is billable even if installation fails.

## One-time setup

1. Fork the repository and enable GitHub Actions in your fork.
2. Add your SSH public key to your DigitalOcean account and note its numeric ID.
3. Create a DigitalOcean API token with permission to read and create Droplets,
   read images, and read SSH keys. Save it as the `DIGITALOCEAN_TOKEN` repository
   secret under **Settings > Secrets and variables > Actions** in your fork.
4. Choose a domain you control. You will point it to the new IP after provisioning.

## Deploy

Open **Actions > Deploy to DigitalOcean > Run workflow** in your fork. Fill in
the hostname, TLS contact email, DigitalOcean SSH key IDs, region, and published
image tag. `latest` follows the VPS installer's default. For a release, select a
tag published for every Reloop image. Acknowledge the SMTP limitation and click
**Run workflow**.

The workflow runs local validation tests, creates one Droplet, and waits for its
public IPv4 address. Its summary provides the IP, DNS records, and setup commands.
A successful workflow means the Droplet was provisioned. Installation and
application health still need checking on the server.

The installer generates application secrets on the Droplet. Neither the
DigitalOcean API token nor an SSH private key is copied to the server.
Application secrets and the setup key are not printed in GitHub Actions logs.

## Finish setup

Add these DNS records, replacing the hostname and address:

```text
reloop.example.com          A    203.0.113.10
link.reloop.example.com     A    203.0.113.10
inbound.reloop.example.com  A    203.0.113.10
```

Connect with your SSH key:

```bash
ssh root@203.0.113.10
cloud-init status --wait
cat /var/lib/reloop-install.status
tail -n 50 /var/log/reloop-install.log
reloop status
cat /opt/reloop/admin-setup.key
```

Wait for `installed` in the status file and healthy services. Once DNS resolves,
Caddy obtains HTTPS certificates. Open `https://reloop.example.com/dashboard/setup`
and enter the setup key to create the first administrator. Keep the setup key
and installation log private; the log contains the key printed by the installer.

Only SSH and the installer-published web and mail ports are exposed. PostgreSQL,
Redis, NATS, and internal APIs stay on the Docker network. To restrict SSH,
attach a DigitalOcean Cloud Firewall allowing port 22 only from your IP and
ports 80/443 for the web application.

The initial administrator session lasts seven days. Sign-in codes and invitations
need system email. The standard SMTP ports are blocked here, and Reloop's local
mail transport has the same restriction. Without a separately configured,
reachable email transport, use this as a temporary evaluation. File uploads are
off until you configure S3-compatible storage through the VPS guide.

## Failure and cleanup

- If the workflow fails after creating a Droplet, inspect your DigitalOcean
  account before retrying. The workflow never deletes an existing server and
  refuses to create another Droplet with the same hostname.
- If installation fails, check `/var/log/reloop-install.log`. After fixing the
  cause, rerun the saved first-boot script with
  `sudo bash /var/lib/cloud/instance/scripts/part-001`. It reuses the existing
  installer configuration and secrets.
- Canceling the workflow does not cancel cloud-init or stop billing. Delete the
  evaluation Droplet in DigitalOcean when finished, after saving any data you need.
- Do not use **Run workflow** to update an existing server. Use `reloop update`
  over SSH, following the [VPS guide](https://reloop.sh/docs/self-host/vps).

An account API response or a successful container health check does not prove
email delivery. There is no App Platform template because App Platform cannot
expose Reloop's SMTP listeners or supply its persistent Docker volumes.

## Validation

```bash
bun test install/digitalocean/deploy.test.ts
bash -n install/digitalocean/bootstrap.sh
```

Tests use a fake DigitalOcean transport and create no resources. They cover
input validation, installer configuration, duplicate protection, provider
failures, and bounded polling. A live smoke test needs a DigitalOcean account,
an SSH key, and a domain.
