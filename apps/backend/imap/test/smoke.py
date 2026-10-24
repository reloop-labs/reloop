"""End-to-end smoke test against a running IMAP server (plain IMAP, dev mode).

    IMAP_TEST_USER=you@domain IMAP_TEST_PASSWORD=xxxx-xxxx-xxxx-xxxx python3 test/smoke.py

Needs NATS on localhost:4222 for the delivery/IDLE checks. Uses the account's
real mailbox, so point it at a throwaway account.
"""
import imaplib, json, os, socket, sys, time, uuid, re

HOST = os.environ.get("IMAP_TEST_HOST", "localhost")
PORT = int(os.environ.get("IMAP_TEST_PORT", "1143"))
USER = os.environ["IMAP_TEST_USER"]
PW = os.environ["IMAP_TEST_PASSWORD"]
NATS = (os.environ.get("IMAP_TEST_NATS_HOST", "localhost"), 4222)
results = []

def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))

def nats_publish(subject, payload):
    s = socket.create_connection(NATS)
    s.recv(4096)
    data = json.dumps(payload).encode()
    s.sendall(b"CONNECT {\"verbose\":false}\r\n" + f"PUB {subject} {len(data)}\r\n".encode() + data + b"\r\nPING\r\n")
    s.recv(4096)
    s.close()

def raw_msg(subject, to=USER, body="hello body", extra=""):
    mid = f"<{uuid.uuid4()}@test>"
    return (f"From: Alice <alice@example.com>\r\nTo: {to}\r\nSubject: {subject}\r\n"
            f"Message-ID: {mid}\r\nDate: Sat, 24 Oct 2026 10:00:00 +0000\r\n{extra}"
            f"Content-Type: text/plain; charset=utf-8\r\n\r\n{body}\r\n")

# ── auth ──
m = imaplib.IMAP4(HOST, PORT)
try:
    m.login(USER, "wrong-password"); check("rejects wrong password", False)
except imaplib.IMAP4.error:
    check("rejects wrong password", True)
m = imaplib.IMAP4(HOST, PORT)
typ, _ = m.login(USER.upper(), PW.replace("-", "").upper())
check("login: case-insensitive user, password without dashes", typ == "OK")

typ, caps = m.capability()
caps = caps[0].decode()
for c in ["IDLE", "MOVE", "UIDPLUS", "SPECIAL-USE", "NAMESPACE"]:
    check(f"capability {c}", c in caps, caps)

# ── folders ──
typ, lst = m.list()
listing = b"\n".join(lst).decode()
for name, attr in [("Sent", "\\Sent"), ("Drafts", "\\Drafts"), ("Trash", "\\Trash"), ("Junk", "\\Junk"), ("Archive", "\\Archive")]:
    check(f"LIST {name} has {attr}", re.search(re.escape(attr) + r'.*"/" "?' + name, listing) is not None, listing)
check("LIST has INBOX", "INBOX" in listing)

check("CREATE Projects", m.create("Projects")[0] == "OK")
check("CREATE Projects/Q4", m.create("Projects/Q4")[0] == "OK")
check("CREATE duplicate fails", m.create("Projects")[0] == "NO")
check("RENAME Projects -> Work", m.rename("Projects", "Work")[0] == "OK")
listing = b"\n".join(m.list()[1]).decode()
check("RENAME moved child Work/Q4", "Work/Q4" in listing and "Projects" not in listing, listing)

# ── append / select / fetch ──
typ, data = m.append("INBOX", None, None, raw_msg("First message", body="the quick brown fox").encode())
check("APPEND returns APPENDUID", typ == "OK" and b"APPENDUID" in data[0], data)
m.append("INBOX", "(\\Flagged)", None, raw_msg("Second message", body="lazy dog").encode())
typ, data = m.select("INBOX")
check("SELECT INBOX shows 2 messages", typ == "OK" and data[0] == b"2", data)

typ, data = m.fetch("1", "(UID FLAGS ENVELOPE BODYSTRUCTURE RFC822.SIZE)")
blob = data[0].decode() if isinstance(data[0], bytes) else data[0][0].decode()
check("FETCH envelope has subject", "First message" in blob, blob)
check("FETCH has BODYSTRUCTURE", "BODYSTRUCTURE" in blob, blob)
check("FETCH unread before body read", "\\Seen" not in blob, blob)

typ, data = m.fetch("1", "(BODY.PEEK[TEXT])")
check("BODY.PEEK returns body", b"quick brown fox" in data[0][1])
typ, data = m.fetch("1", "(FLAGS)")
check("PEEK does not mark seen", b"\\Seen" not in data[0])
typ, data = m.fetch("1", "(BODY[])")
check("BODY[] returns full message", b"Subject: First message" in data[0][1])
typ, data = m.fetch("1", "(FLAGS)")
check("BODY[] marks seen", b"\\Seen" in b"".join(x if isinstance(x, bytes) else x[0] for x in data), data)

# ── flags / search ──
check("STORE +FLAGS keyword", m.store("2", "+FLAGS", "($Agent \\Answered)")[0] == "OK")
typ, data = m.fetch("2", "(FLAGS)")
check("keyword + system flags kept", b"$Agent" in data[0] and b"\\Flagged" in data[0] and b"\\Answered" in data[0], data)
typ, data = m.search(None, "UNSEEN")
check("SEARCH UNSEEN -> 2", data[0].split() == [b"2"], data)
typ, data = m.search(None, 'TEXT "brown fox"')
check("SEARCH TEXT -> 1", data[0].split() == [b"1"], data)
typ, data = m.search(None, 'FROM "alice"')
check("SEARCH FROM -> both", data[0].split() == [b"1", b"2"], data)
typ, data = m.uid("SEARCH", None, "KEYWORD", "$Agent")
check("UID SEARCH KEYWORD", len(data[0].split()) == 1, data)

# ── copy / move / expunge ──
typ, data = m.copy("1", "Archive")
check("COPY to Archive", typ == "OK", data)
typ, data = m._simple_command("MOVE", "2", "Trash"); m._untagged_response(typ, data, "MOVE")
check("MOVE to Trash", typ == "OK", data)
typ, data = m.select("INBOX")
check("INBOX has 1 after MOVE", data[0] == b"1", data)
typ, data = m.status("Trash", "(MESSAGES UNSEEN)")
check("STATUS Trash 1 msg", b"MESSAGES 1" in data[0], data)
m.store("1", "+FLAGS", "\\Deleted")
typ, data = m.expunge()
check("EXPUNGE reports seq 1", typ == "OK" and data[0] == b"1", data)
typ, data = m.select("INBOX")
check("INBOX empty after EXPUNGE", data[0] == b"0", data)
typ, data = m.select("Archive")
check("Archive still has copy with \\Seen", data[0] == b"1" and b"\\Seen" in m.fetch("1", "(FLAGS)")[1][0])

# ── delivery from NATS (inbound KumoMTA path) + IDLE push ──
idle = imaplib.IMAP4(HOST, PORT)
idle.login(USER, PW)
idle.select("INBOX")
sock = idle.sock
sock.sendall(b"i1 IDLE\r\n")
check("IDLE continuation", idle.readline().startswith(b"+"))

nats_publish("kumomta.inbound_received", {"rawMessage": raw_msg("Pushed via NATS", to="someone-else@x.com").replace("\r\n", "\n"),
                                           "recipients": [USER.replace("@", "+agent@")]})
sock.settimeout(5)
got = b""
try:
    while b"EXISTS" not in got:
        got += idle.readline()
except socket.timeout:
    pass
check("IDLE pushes EXISTS on delivery (BCC via envelope, +tag)", b"1 EXISTS" in got, got)
sock.sendall(b"DONE\r\n")
while not idle.readline().startswith(b"i1 OK"):
    pass
typ, data = idle.fetch("1", "(BODY.PEEK[HEADER.FIELDS (SUBJECT)] BODY.PEEK[TEXT])")
check("delivered message readable", b"Pushed via NATS" in data[0][1], data)
full = idle.fetch("1", "(BODY.PEEK[])")[1][0][1]
check("LF normalised to CRLF", full.count(b"\n") == full.count(b"\r\n"), full[:80])

nats_publish("kumomta.inbound_received", {"rawMessage": raw_msg("Cheap pills", extra="X-Spam-Flag: YES\r\n")})
time.sleep(1)
typ, data = idle.status("Junk", "(MESSAGES)")
check("spam (no envelope, To header) goes to Junk", b"MESSAGES 1" in data[0], data)

# flag change from one session visible to another via NOOP
m.select("INBOX")
m.store("1", "+FLAGS", "\\Flagged")
typ, data = idle.noop()
fetches = idle.untagged_responses.get("FETCH", [])
check("flag change pushed to other session", any(b"\\Flagged" in (x if isinstance(x, bytes) else b"") for x in fetches), fetches)

# ── cleanup folders ──
check("DELETE Work/Q4", m.delete("Work/Q4")[0] == "OK")
check("DELETE Work", m.delete("Work")[0] == "OK")
check("DELETE INBOX refused", m.delete("INBOX")[0] == "NO")
m.logout(); idle.logout()

failed = [n for n, ok in results if not ok]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
