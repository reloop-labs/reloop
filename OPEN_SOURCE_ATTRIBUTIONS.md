# Open Source Software Attributions

This document provides proper attribution to all open source software used in the ReloopLabs mail infrastructure.

## Mail Server Software

### Postfix
- **Project:** Postfix Mail Transfer Agent
- **Website:** https://www.postfix.org/
- **License:** IBM Public License 1.0
- **Copyright:** Wietse Venema
- **Description:** SMTP mail transfer agent used for sending and receiving email

### Dovecot
- **Project:** Dovecot IMAP/POP3 Server
- **Website:** https://dovecot.org/
- **License:** MIT License
- **Copyright:** Timo Sirainen
- **Description:** IMAP and POP3 server for accessing email

### Rspamd
- **Project:** Rspamd Spam Filtering System
- **Website:** https://rspamd.com/
- **License:** Apache License 2.0
- **Copyright:** Vsevolod Stakhov
- **Description:** Fast spam filtering system for email

## Base Images and Dependencies

### Ubuntu
- **Project:** Ubuntu Linux
- **Website:** https://ubuntu.com/
- **License:** Various (GPL, LGPL, etc.)
- **Copyright:** Canonical Ltd.
- **Description:** Base operating system for containers

### PostgreSQL
- **Project:** PostgreSQL Database
- **Website:** https://www.postgresql.org/
- **License:** PostgreSQL License
- **Copyright:** PostgreSQL Global Development Group
- **Description:** Database system for storing mail configuration

### Redis
- **Project:** Redis In-Memory Data Store
- **Website:** https://redis.io/
- **License:** BSD 3-Clause License
- **Copyright:** Redis Ltd.
- **Description:** Caching and session management

## System Tools

### Supervisor
- **Project:** Supervisor Process Control System
- **Website:** http://supervisord.org/
- **License:** BSD License
- **Copyright:** Chris McDonough
- **Description:** Process manager for keeping services running

### SASL
- **Project:** Cyrus SASL
- **Website:** https://www.cyrusimap.org/sasl/
- **License:** BSD License
- **Copyright:** Carnegie Mellon University
- **Description:** Authentication framework

## License Compliance

All software used in this infrastructure is open source and properly licensed. The configurations and Docker setups are original work by the ReloopLabs team that builds upon these open source components.

## Attribution Requirements

When using this mail infrastructure:

1. **Postfix:** Include Postfix copyright notice in documentation
2. **Dovecot:** MIT license requires preservation of copyright notice
3. **Rspamd:** Apache 2.0 license requires preservation of copyright and license notices

## Recommended Attribution Text

```
This mail infrastructure uses the following open source software:

- Postfix Mail Transfer Agent (IBM Public License 1.0) - https://www.postfix.org/
- Dovecot IMAP/POP3 Server (MIT License) - https://dovecot.org/
- Rspamd Spam Filtering (Apache License 2.0) - https://rspamd.com/

```
<sub><sup><small><i>Configuration and Mail server Docker setup by Rudra Patel (https://github.com/rudra-2)</i></small></sup></sub>
---

