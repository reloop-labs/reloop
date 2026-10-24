// Package mailstore implements the IMAP server session on top of Postgres.
//
// Sequence numbers and push updates (IDLE) need a consistent, ordered view of
// every folder, so each folder's UID list lives in memory next to a
// go-imap MailboxTracker. This process must therefore be the only writer of
// mail_folder / mail_message: run one instance, and route writes from other
// services (agent API) through it.
package mailstore

import (
	"bytes"
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/emersion/go-imap/v2"
	"github.com/emersion/go-imap/v2/imapserver"
	"github.com/emersion/go-message/mail"

	"reloop/imap/internal/store"
)

const delim = '/'

// Default folders every account gets, with their RFC 6154 roles.
var defaultFolders = []struct{ name, specialUse string }{
	{"INBOX", ""},
	{"Sent", string(imap.MailboxAttrSent)},
	{"Drafts", string(imap.MailboxAttrDrafts)},
	{"Archive", string(imap.MailboxAttrArchive)},
	{"Junk", string(imap.MailboxAttrJunk)},
	{"Trash", string(imap.MailboxAttrTrash)},
}

type Backend struct {
	Store *store.Store

	mu      sync.Mutex
	folders map[string]*folderState // by folder id
}

func NewBackend(s *store.Store) *Backend {
	return &Backend{Store: s, folders: make(map[string]*folderState)}
}

// folderState is the in-memory, ordered view of one folder.
type folderState struct {
	mu          sync.Mutex
	id          string
	accountID   string
	uidValidity uint32
	uids        []imap.UID // ascending; index i is sequence number i+1
	tracker     *imapserver.MailboxTracker
}

func (b *Backend) state(ctx context.Context, f *store.Folder) (*folderState, error) {
	b.mu.Lock()
	st := b.folders[f.ID]
	b.mu.Unlock()
	if st != nil {
		return st, nil
	}

	uids, err := b.Store.FolderUIDs(ctx, f.ID)
	if err != nil {
		return nil, err
	}

	b.mu.Lock()
	defer b.mu.Unlock()
	if st := b.folders[f.ID]; st != nil {
		return st, nil // lost a load race; keep the first
	}
	st = &folderState{
		id:          f.ID,
		accountID:   f.AccountID,
		uidValidity: f.UIDValidity,
		uids:        make([]imap.UID, len(uids)),
		tracker:     imapserver.NewMailboxTracker(uint32(len(uids))),
	}
	for i, uid := range uids {
		st.uids[i] = imap.UID(uid)
	}
	b.folders[f.ID] = st
	return st, nil
}

func (b *Backend) forget(folderID string) {
	b.mu.Lock()
	delete(b.folders, folderID)
	b.mu.Unlock()
}

// EnsureDefaultFolders creates INBOX, Sent, Drafts, Archive, Junk and Trash if missing.
func (b *Backend) EnsureDefaultFolders(ctx context.Context, accountID string) error {
	existing, err := b.Store.Folders(ctx, accountID)
	if err != nil {
		return err
	}
	have := make(map[string]bool, len(existing))
	for _, f := range existing {
		have[f.Name] = true
	}
	for _, df := range defaultFolders {
		if have[df.name] {
			continue
		}
		if _, err := b.Store.CreateFolder(ctx, accountID, df.name, df.specialUse); err != nil && err != store.ErrExists {
			return err
		}
	}
	return nil
}

// appendMessage stores raw in folder f and announces it to selected sessions.
func (b *Backend) appendMessage(ctx context.Context, f *store.Folder, raw []byte, flags []imap.Flag, t time.Time) (imap.UID, error) {
	st, err := b.state(ctx, f)
	if err != nil {
		return 0, err
	}
	if t.IsZero() {
		t = time.Now()
	}

	nm := &store.NewMessage{
		AccountID:    f.AccountID,
		FolderID:     f.ID,
		Flags:        flagStrings(normalizeFlags(flags)),
		InternalDate: t,
		Raw:          raw,
	}
	parseHeaderFields(raw, nm)

	st.mu.Lock()
	defer st.mu.Unlock()
	uid, err := b.Store.InsertMessage(ctx, nm)
	if err != nil {
		return 0, err
	}
	st.uids = append(st.uids, imap.UID(uid))
	st.tracker.QueueNumMessages(uint32(len(st.uids)))
	return imap.UID(uid), nil
}

// removeMessages deletes uids from st and queues EXPUNGE for every session.
// Caller holds st.mu.
func (b *Backend) removeMessagesLocked(ctx context.Context, st *folderState, uids []imap.UID) error {
	if len(uids) == 0 {
		return nil
	}
	ids := make([]uint32, len(uids))
	remove := make(map[imap.UID]bool, len(uids))
	for i, uid := range uids {
		ids[i] = uint32(uid)
		remove[uid] = true
	}
	if err := b.Store.DeleteMessages(ctx, st.id, ids); err != nil {
		return err
	}
	// Walk backwards so earlier sequence numbers stay valid while expunging.
	for i := len(st.uids) - 1; i >= 0; i-- {
		if remove[st.uids[i]] {
			st.tracker.QueueExpunge(uint32(i) + 1)
			st.uids = append(st.uids[:i], st.uids[i+1:]...)
		}
	}
	return nil
}

// Deliver files an incoming message into an account's INBOX (or Junk).
func (b *Backend) Deliver(ctx context.Context, account *store.Account, raw []byte, spam bool) error {
	if err := b.EnsureDefaultFolders(ctx, account.ID); err != nil {
		return err
	}
	name := "INBOX"
	if spam {
		name = "Junk"
	}
	f, err := b.Store.FolderByName(ctx, account.ID, name)
	if err != nil {
		return err
	}
	if f == nil {
		return fmt.Errorf("folder %q missing for %s", name, account.Email)
	}
	_, err = b.appendMessage(ctx, f, normalizeCRLF(raw), nil, time.Now())
	return err
}

// ─── helpers ─────────────────────────────────────────────────────────

var systemFlags = map[string]imap.Flag{
	`\seen`:     imap.FlagSeen,
	`\answered`: imap.FlagAnswered,
	`\flagged`:  imap.FlagFlagged,
	`\deleted`:  imap.FlagDeleted,
	`\draft`:    imap.FlagDraft,
}

// normalizeFlags canonicalises system flags, drops \Recent and de-duplicates
// case-insensitively, keeping keywords as the client spelled them.
func normalizeFlags(flags []imap.Flag) []imap.Flag {
	seen := make(map[string]bool, len(flags))
	out := make([]imap.Flag, 0, len(flags))
	for _, f := range flags {
		key := strings.ToLower(string(f))
		if key == `\recent` || key == "" || seen[key] {
			continue
		}
		seen[key] = true
		if canon, ok := systemFlags[key]; ok {
			f = canon
		}
		out = append(out, f)
	}
	sort.Slice(out, func(i, j int) bool { return out[i] < out[j] })
	return out
}

func hasFlag(flags []imap.Flag, flag imap.Flag) bool {
	for _, f := range flags {
		if strings.EqualFold(string(f), string(flag)) {
			return true
		}
	}
	return false
}

func applyStore(current []imap.Flag, op *imap.StoreFlags) []imap.Flag {
	switch op.Op {
	case imap.StoreFlagsSet:
		return normalizeFlags(op.Flags)
	case imap.StoreFlagsAdd:
		return normalizeFlags(append(append([]imap.Flag{}, current...), op.Flags...))
	case imap.StoreFlagsDel:
		var out []imap.Flag
		for _, f := range current {
			if !hasFlag(op.Flags, f) {
				out = append(out, f)
			}
		}
		return normalizeFlags(out)
	}
	return current
}

func toFlags(s []string) []imap.Flag {
	out := make([]imap.Flag, len(s))
	for i, f := range s {
		out[i] = imap.Flag(f)
	}
	return out
}

func flagStrings(flags []imap.Flag) []string {
	out := make([]string, len(flags))
	for i, f := range flags {
		out[i] = string(f)
	}
	return out
}

// normalizeCRLF turns bare LF line endings into CRLF, as IMAP requires.
func normalizeCRLF(raw []byte) []byte {
	if !bytes.Contains(raw, []byte("\n")) || bytes.Count(raw, []byte("\r\n")) == bytes.Count(raw, []byte("\n")) {
		return raw
	}
	var buf bytes.Buffer
	buf.Grow(len(raw) + len(raw)/40)
	for i, c := range raw {
		if c == '\n' && (i == 0 || raw[i-1] != '\r') {
			buf.WriteByte('\r')
		}
		buf.WriteByte(c)
	}
	return buf.Bytes()
}

// parseHeaderFields fills the denormalised columns used by the agent API.
func parseHeaderFields(raw []byte, nm *store.NewMessage) {
	r, err := mail.CreateReader(bytes.NewReader(raw))
	if err != nil && r == nil {
		return
	}
	h := r.Header
	nm.MessageID, _ = h.MessageID()
	nm.Subject, _ = h.Subject()
	if from, err := h.AddressList("From"); err == nil && len(from) > 0 {
		nm.FromEmail = strings.ToLower(from[0].Address)
	}
	if d, err := h.Date(); err == nil && !d.IsZero() {
		nm.SentAt = &d
	}
}
