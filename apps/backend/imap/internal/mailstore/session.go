package mailstore

import (
	"bytes"
	"context"
	"errors"
	"io"
	"log/slog"
	"sort"
	"strings"
	"time"

	"github.com/emersion/go-imap/v2"
	"github.com/emersion/go-imap/v2/imapserver"

	"reloop/imap/internal/auth"
	"reloop/imap/internal/store"
)

// AppendLimit caps APPEND size (and is advertised as APPENDLIMIT).
const AppendLimit = 50 * 1024 * 1024

var (
	_ imapserver.SessionIMAP4rev2   = (*Session)(nil)
	_ imapserver.SessionAppendLimit = (*Session)(nil)
)

// Session is one IMAP connection.
type Session struct {
	b       *Backend
	ctx     context.Context
	remote  string
	account *store.Account
	sel     *selection
}

type selection struct {
	folder    *store.Folder
	st        *folderState
	tracker   *imapserver.SessionTracker
	readOnly  bool
	searchRes imap.UIDSet
}

// item is a message addressed by a command: its sequence number as this
// client currently sees it, and its UID.
type item struct {
	seq uint32
	uid imap.UID
}

func (b *Backend) NewSession(conn *imapserver.Conn) (imapserver.Session, *imapserver.GreetingData, error) {
	return &Session{b: b, ctx: context.Background(), remote: conn.NetConn().RemoteAddr().String()}, nil, nil
}

func (s *Session) Close() error {
	s.closeSelection()
	return nil
}

func (s *Session) closeSelection() {
	if s.sel != nil {
		s.sel.tracker.Close()
		s.sel = nil
	}
}

// ─── not authenticated ───────────────────────────────────────────────

// Login accepts the mailbox address as username and a Reloop API key as
// password. The key must belong to the mailbox's organization, and its address
// scope (api_key_scope) must allow this mailbox.
func (s *Session) Login(username, password string) error {
	account, err := s.b.Store.AccountByEmail(s.ctx, username)
	if err != nil {
		return err
	}
	if account != nil && account.Active {
		orgID, ok, err := s.b.Auth.Verify(s.ctx, password, account.Email)
		if errors.Is(err, auth.ErrUnavailable) {
			slog.Error("imap login: cannot verify api key", "err", err)
			return &imap.Error{
				Type: imap.StatusResponseTypeNo,
				Code: imap.ResponseCodeUnavailable,
				Text: "Temporary authentication failure, try again shortly",
			}
		} else if err != nil {
			return err
		}
		if ok && orgID == account.OrganizationID {
			if err := s.b.EnsureDefaultFolders(s.ctx, account.ID); err != nil {
				return err
			}
			s.account = account
			slog.Info("imap login", "account", account.Email, "remote", s.remote)
			return nil
		}
	}
	slog.Warn("imap login failed", "username", username, "remote", s.remote)
	time.Sleep(time.Second) // slow down guessing
	return imapserver.ErrAuthFailed
}

// ─── authenticated ───────────────────────────────────────────────────

func normalizeName(name string) string {
	name = strings.TrimRight(name, string(delim))
	if strings.EqualFold(name, "INBOX") {
		return "INBOX"
	}
	if len(name) > 6 && strings.EqualFold(name[:6], "INBOX/") {
		return "INBOX" + name[5:]
	}
	return name
}

var errNoSuchMailbox = &imap.Error{
	Type: imap.StatusResponseTypeNo,
	Code: imap.ResponseCodeNonExistent,
	Text: "No such mailbox",
}

var errTryCreate = &imap.Error{
	Type: imap.StatusResponseTypeNo,
	Code: imap.ResponseCodeTryCreate,
	Text: "No such mailbox",
}

var errReadOnly = &imap.Error{
	Type: imap.StatusResponseTypeNo,
	Text: "Mailbox is read-only",
}

func (s *Session) folder(name string) (*store.Folder, error) {
	f, err := s.b.Store.FolderByName(s.ctx, s.account.ID, normalizeName(name))
	if err != nil {
		return nil, err
	}
	if f == nil {
		return nil, errNoSuchMailbox
	}
	return f, nil
}

var mailboxFlags = []imap.Flag{imap.FlagSeen, imap.FlagAnswered, imap.FlagFlagged, imap.FlagDeleted, imap.FlagDraft}

func (s *Session) Select(name string, options *imap.SelectOptions) (*imap.SelectData, error) {
	s.closeSelection()

	f, err := s.folder(name)
	if err != nil {
		return nil, err
	}
	st, err := s.b.state(s.ctx, f)
	if err != nil {
		return nil, err
	}

	st.mu.Lock()
	defer st.mu.Unlock()

	uidNext, firstUnseenUID, err := s.b.Store.SelectInfo(s.ctx, f.ID)
	if err != nil {
		return nil, err
	}
	s.sel = &selection{folder: f, st: st, tracker: st.tracker.NewSession(), readOnly: options.ReadOnly}

	data := &imap.SelectData{
		Flags:       mailboxFlags,
		NumMessages: uint32(len(st.uids)),
		UIDNext:     imap.UID(uidNext),
		UIDValidity: st.uidValidity,
	}
	if !options.ReadOnly {
		data.PermanentFlags = append(append([]imap.Flag{}, mailboxFlags...), imap.FlagWildcard)
	}
	if firstUnseenUID != 0 {
		if i := indexOf(st.uids, imap.UID(firstUnseenUID)); i >= 0 {
			data.FirstUnseenSeqNum = uint32(i) + 1
		}
	}
	return data, nil
}

func (s *Session) Create(name string, options *imap.CreateOptions) error {
	name = normalizeName(name)
	specialUse := ""
	if options != nil && len(options.SpecialUse) > 0 {
		specialUse = string(options.SpecialUse[0])
	}
	_, err := s.b.Store.CreateFolder(s.ctx, s.account.ID, name, specialUse)
	if errors.Is(err, store.ErrExists) || name == "INBOX" {
		return &imap.Error{
			Type: imap.StatusResponseTypeNo,
			Code: imap.ResponseCodeAlreadyExists,
			Text: "Mailbox already exists",
		}
	}
	return err
}

func (s *Session) Delete(name string) error {
	if normalizeName(name) == "INBOX" {
		return &imap.Error{Type: imap.StatusResponseTypeNo, Text: "INBOX cannot be deleted"}
	}
	f, err := s.folder(name)
	if err != nil {
		return err
	}
	if err := s.b.Store.DeleteFolder(s.ctx, f.ID); err != nil {
		return err
	}
	s.b.forget(f.ID)
	return nil
}

func (s *Session) Rename(oldName, newName string, options *imap.RenameOptions) error {
	oldName, newName = normalizeName(oldName), normalizeName(newName)
	if oldName == "INBOX" {
		return &imap.Error{Type: imap.StatusResponseTypeNo, Text: "Renaming INBOX is not supported"}
	}
	if _, err := s.folder(oldName); err != nil {
		return err
	}
	if existing, err := s.b.Store.FolderByName(s.ctx, s.account.ID, newName); err != nil {
		return err
	} else if existing != nil || newName == "INBOX" {
		return &imap.Error{
			Type: imap.StatusResponseTypeNo,
			Code: imap.ResponseCodeAlreadyExists,
			Text: "Mailbox already exists",
		}
	}
	return s.b.Store.RenameFolder(s.ctx, s.account.ID, oldName, newName, string(delim))
}

func (s *Session) Subscribe(name string) error   { return s.setSubscribed(name, true) }
func (s *Session) Unsubscribe(name string) error { return s.setSubscribed(name, false) }

func (s *Session) setSubscribed(name string, subscribed bool) error {
	f, err := s.folder(name)
	if err != nil {
		return err
	}
	return s.b.Store.SetSubscribed(s.ctx, f.ID, subscribed)
}

func (s *Session) List(w *imapserver.ListWriter, ref string, patterns []string, options *imap.ListOptions) error {
	if len(patterns) == 0 {
		return w.WriteList(&imap.ListData{
			Attrs: []imap.MailboxAttr{imap.MailboxAttrNoSelect},
			Delim: delim,
		})
	}

	folders, err := s.b.Store.Folders(s.ctx, s.account.ID)
	if err != nil {
		return err
	}
	parents := make(map[string]bool)
	for _, f := range folders {
		if i := strings.LastIndexByte(f.Name, byte(delim)); i > 0 {
			parents[f.Name[:i]] = true
		}
	}

	for _, f := range folders {
		match := false
		for _, pattern := range patterns {
			if imapserver.MatchList(f.Name, delim, ref, pattern) ||
				(f.Name == "INBOX" && imapserver.MatchList(f.Name, delim, ref, strings.ToUpper(pattern))) {
				match = true
				break
			}
		}
		if !match {
			continue
		}
		if options.SelectSubscribed && !f.Subscribed {
			continue
		}
		if options.SelectSpecialUse && f.SpecialUse == "" {
			continue
		}

		data := imap.ListData{Mailbox: f.Name, Delim: delim}
		if parents[f.Name] {
			data.Attrs = append(data.Attrs, imap.MailboxAttrHasChildren)
		} else {
			data.Attrs = append(data.Attrs, imap.MailboxAttrHasNoChildren)
		}
		if f.Subscribed {
			data.Attrs = append(data.Attrs, imap.MailboxAttrSubscribed)
		}
		// Always expose roles so clients map Sent/Trash/Junk without setup.
		if f.SpecialUse != "" {
			data.Attrs = append(data.Attrs, imap.MailboxAttr(f.SpecialUse))
		}
		if options.ReturnStatus != nil {
			if data.Status, err = s.status(f, options.ReturnStatus); err != nil {
				return err
			}
		}
		if err := w.WriteList(&data); err != nil {
			return err
		}
	}
	return nil
}

func (s *Session) Status(name string, options *imap.StatusOptions) (*imap.StatusData, error) {
	f, err := s.folder(name)
	if err != nil {
		return nil, err
	}
	return s.status(f, options)
}

func (s *Session) status(f *store.Folder, options *imap.StatusOptions) (*imap.StatusData, error) {
	stats, err := s.b.Store.FolderStats(s.ctx, f.ID)
	if err != nil {
		return nil, err
	}
	data := &imap.StatusData{Mailbox: f.Name}
	if options.NumMessages {
		data.NumMessages = &stats.NumMessages
	}
	if options.UIDNext {
		data.UIDNext = imap.UID(stats.UIDNext)
	}
	if options.UIDValidity {
		data.UIDValidity = f.UIDValidity
	}
	if options.NumUnseen {
		data.NumUnseen = &stats.NumUnseen
	}
	if options.NumDeleted {
		data.NumDeleted = &stats.NumDeleted
	}
	if options.Size {
		data.Size = &stats.Size
	}
	if options.NumRecent {
		zero := uint32(0)
		data.NumRecent = &zero
	}
	return data, nil
}

func (s *Session) AppendLimit() uint32 { return AppendLimit }

func (s *Session) Append(name string, r imap.LiteralReader, options *imap.AppendOptions) (*imap.AppendData, error) {
	f, err := s.b.Store.FolderByName(s.ctx, s.account.ID, normalizeName(name))
	if err != nil {
		return nil, err
	}
	if f == nil {
		return nil, errTryCreate
	}
	if r.Size() > AppendLimit {
		return nil, &imap.Error{Type: imap.StatusResponseTypeNo, Code: imap.ResponseCodeTooBig, Text: "Message too big"}
	}
	var buf bytes.Buffer
	if _, err := buf.ReadFrom(io.LimitReader(r, AppendLimit+1)); err != nil {
		return nil, err
	}
	uid, err := s.b.appendMessage(s.ctx, f, buf.Bytes(), options.Flags, options.Time)
	if err != nil {
		return nil, err
	}
	return &imap.AppendData{UID: uid, UIDValidity: f.UIDValidity}, nil
}

func (s *Session) Namespace() (*imap.NamespaceData, error) {
	return &imap.NamespaceData{
		Personal: []imap.NamespaceDescriptor{{Delim: delim}},
	}, nil
}

func (s *Session) Poll(w *imapserver.UpdateWriter, allowExpunge bool) error {
	if s.sel == nil {
		return nil
	}
	return s.sel.tracker.Poll(w, allowExpunge)
}

func (s *Session) Idle(w *imapserver.UpdateWriter, stop <-chan struct{}) error {
	if s.sel == nil {
		return nil
	}
	return s.sel.tracker.Idle(w, stop)
}

// ─── selected ────────────────────────────────────────────────────────

func (s *Session) Unselect() error {
	s.closeSelection()
	return nil
}

func (s *Session) Expunge(w *imapserver.ExpungeWriter, uids *imap.UIDSet) error {
	if s.sel.readOnly {
		return errReadOnly
	}
	st := s.sel.st
	st.mu.Lock()
	defer st.mu.Unlock()

	msgs, err := s.b.Store.Messages(s.ctx, st.id, nil, false)
	if err != nil {
		return err
	}
	var remove []imap.UID
	for _, m := range msgs {
		uid := imap.UID(m.UID)
		if uids != nil && !uids.Contains(uid) {
			continue
		}
		if hasFlag(toFlags(m.Flags), imap.FlagDeleted) {
			remove = append(remove, uid)
		}
	}
	// EXPUNGE responses reach this client through Poll after the command.
	return s.b.removeMessagesLocked(s.ctx, st, remove)
}

func (s *Session) Search(kind imapserver.NumKind, criteria *imap.SearchCriteria, options *imap.SearchOptions) (*imap.SearchData, error) {
	sel := s.sel
	st := sel.st

	st.mu.Lock()
	all := make([]item, 0, len(st.uids))
	for i, uid := range st.uids {
		all = append(all, item{seq: sel.tracker.EncodeSeqNum(uint32(i) + 1), uid: uid})
	}
	var maxUID imap.UID
	if n := len(st.uids); n > 0 {
		maxUID = st.uids[n-1]
	}
	sel.staticSearchCriteria(criteria, uint32(len(st.uids)), maxUID)
	st.mu.Unlock()

	msgs, err := s.b.Store.Messages(s.ctx, st.id, nil, searchNeedsRaw(criteria))
	if err != nil {
		return nil, err
	}
	byUID := make(map[imap.UID]*store.Message, len(msgs))
	for _, m := range msgs {
		byUID[imap.UID(m.UID)] = m
	}

	var data imap.SearchData
	var seqSet imap.SeqSet
	var uidSet imap.UIDSet
	for _, it := range all {
		msg := byUID[it.uid]
		if msg == nil || !matchMessage(msg, it.seq, criteria) {
			continue
		}
		// Always collect UIDs; SEARCHRES may save them.
		uidSet.AddNum(it.uid)

		var num uint32
		switch kind {
		case imapserver.NumKindSeq:
			if it.seq == 0 {
				continue
			}
			seqSet.AddNum(it.seq)
			num = it.seq
		case imapserver.NumKindUID:
			num = uint32(it.uid)
		}
		if data.Min == 0 || num < data.Min {
			data.Min = num
		}
		if num > data.Max {
			data.Max = num
		}
		data.Count++
	}

	switch kind {
	case imapserver.NumKindSeq:
		data.All = seqSet
	case imapserver.NumKindUID:
		data.All = uidSet
	}
	if options.ReturnSave {
		sel.searchRes = uidSet
	}
	return &data, nil
}

func (s *Session) Fetch(w *imapserver.FetchWriter, numSet imap.NumSet, options *imap.FetchOptions) error {
	sel := s.sel
	st := sel.st

	st.mu.Lock()
	items := sel.resolveLocked(numSet)
	st.mu.Unlock()
	if len(items) == 0 {
		return nil
	}

	msgs, err := s.b.Store.Messages(s.ctx, st.id, itemUIDs(items), fetchNeedsRaw(options))
	if err != nil {
		return err
	}
	byUID := make(map[imap.UID]*store.Message, len(msgs))
	for _, m := range msgs {
		byUID[imap.UID(m.UID)] = m
	}

	markSeen := false
	if !sel.readOnly {
		for _, bs := range options.BodySection {
			if !bs.Peek {
				markSeen = true
				break
			}
		}
	}

	for _, it := range items {
		msg := byUID[it.uid]
		if msg == nil {
			continue // expunged since we resolved the set
		}
		flags := toFlags(msg.Flags)
		if markSeen && !hasFlag(flags, imap.FlagSeen) {
			flags = normalizeFlags(append(flags, imap.FlagSeen))
			// nil source: this client also gets the FLAGS update, as RFC 3501 expects.
			if err := s.b.setFlags(s.ctx, st, it.uid, flags, nil); err != nil {
				return err
			}
		}
		if err := writeFetch(w.CreateMessage(it.seq), msg, flags, options); err != nil {
			return err
		}
	}
	return nil
}

func (s *Session) Store(w *imapserver.FetchWriter, numSet imap.NumSet, op *imap.StoreFlags, options *imap.StoreOptions) error {
	sel := s.sel
	if sel.readOnly {
		return errReadOnly
	}
	st := sel.st

	st.mu.Lock()
	items := sel.resolveLocked(numSet)
	st.mu.Unlock()
	if len(items) == 0 {
		return nil
	}

	msgs, err := s.b.Store.Messages(s.ctx, st.id, itemUIDs(items), false)
	if err != nil {
		return err
	}
	byUID := make(map[imap.UID]*store.Message, len(msgs))
	for _, m := range msgs {
		byUID[imap.UID(m.UID)] = m
	}

	for _, it := range items {
		msg := byUID[it.uid]
		if msg == nil {
			continue
		}
		current := toFlags(msg.Flags)
		flags := applyStore(current, op)
		if !sameFlags(current, flags) {
			if err := s.b.setFlags(s.ctx, st, it.uid, flags, sel.tracker); err != nil {
				return err
			}
		}
		if !op.Silent {
			rw := w.CreateMessage(it.seq)
			rw.WriteUID(it.uid)
			rw.WriteFlags(flags)
			if err := rw.Close(); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *Session) Copy(numSet imap.NumSet, dest string) (*imap.CopyData, error) {
	data, _, err := s.copy(numSet, dest)
	return data, err
}

func (s *Session) Move(w *imapserver.MoveWriter, numSet imap.NumSet, dest string) error {
	sel := s.sel
	if sel.readOnly {
		return errReadOnly
	}
	if normalizeName(dest) == sel.folder.Name {
		return &imap.Error{Type: imap.StatusResponseTypeNo, Text: "Source and destination mailboxes are identical"}
	}
	data, moved, err := s.copy(numSet, dest)
	if err != nil {
		return err
	}

	st := sel.st
	st.mu.Lock()
	err = s.b.removeMessagesLocked(s.ctx, st, moved)
	st.mu.Unlock()
	if err != nil {
		return err
	}
	// EXPUNGE responses follow through Poll, after this COPYUID.
	return w.WriteCopyData(data)
}

// copy appends the addressed messages to dest and returns their source UIDs.
func (s *Session) copy(numSet imap.NumSet, dest string) (*imap.CopyData, []imap.UID, error) {
	destFolder, err := s.b.Store.FolderByName(s.ctx, s.account.ID, normalizeName(dest))
	if err != nil {
		return nil, nil, err
	}
	if destFolder == nil {
		return nil, nil, errTryCreate
	}

	st := s.sel.st
	st.mu.Lock()
	items := s.sel.resolveLocked(numSet)
	st.mu.Unlock()

	msgs, err := s.b.Store.Messages(s.ctx, st.id, itemUIDs(items), true)
	if err != nil {
		return nil, nil, err
	}

	var sourceUIDs, destUIDs imap.UIDSet
	var copied []imap.UID
	for _, m := range msgs {
		uid, err := s.b.appendMessage(s.ctx, destFolder, m.Raw, toFlags(m.Flags), m.InternalDate)
		if err != nil {
			return nil, nil, err
		}
		sourceUIDs.AddNum(imap.UID(m.UID))
		destUIDs.AddNum(uid)
		copied = append(copied, imap.UID(m.UID))
	}
	return &imap.CopyData{
		UIDValidity: destFolder.UIDValidity,
		SourceUIDs:  sourceUIDs,
		DestUIDs:    destUIDs,
	}, copied, nil
}

// ─── helpers ─────────────────────────────────────────────────────────

// setFlags persists flags and notifies sessions (except source) of the change.
func (b *Backend) setFlags(ctx context.Context, st *folderState, uid imap.UID, flags []imap.Flag, source *imapserver.SessionTracker) error {
	st.mu.Lock()
	defer st.mu.Unlock()
	i := indexOf(st.uids, uid)
	if i < 0 {
		return nil
	}
	if err := b.Store.SetFlags(ctx, st.id, uint32(uid), flagStrings(flags)); err != nil {
		return err
	}
	st.tracker.QueueMessageFlags(uint32(i)+1, uid, flags, source)
	return nil
}

// resolveLocked maps a sequence or UID set onto the messages this client can
// address. Caller holds sel.st.mu.
func (sel *selection) resolveLocked(numSet imap.NumSet) []item {
	if imap.IsSearchRes(numSet) {
		numSet = sel.searchRes
	}
	st := sel.st
	var maxUID imap.UID
	if n := len(st.uids); n > 0 {
		maxUID = st.uids[n-1]
	}
	numSet = staticNumSet(numSet, uint32(len(st.uids)), maxUID)

	var items []item
	for i, uid := range st.uids {
		seq := sel.tracker.EncodeSeqNum(uint32(i) + 1)
		if seq == 0 {
			continue // not yet announced to this client
		}
		switch set := numSet.(type) {
		case imap.SeqSet:
			if !set.Contains(seq) {
				continue
			}
		case imap.UIDSet:
			if !set.Contains(uid) {
				continue
			}
		}
		items = append(items, item{seq: seq, uid: uid})
	}
	return items
}

func (sel *selection) staticSearchCriteria(criteria *imap.SearchCriteria, maxSeq uint32, maxUID imap.UID) {
	seqNums := make([]imap.SeqSet, 0, len(criteria.SeqNum))
	for _, seqSet := range criteria.SeqNum {
		var numSet imap.NumSet = seqSet
		if imap.IsSearchRes(numSet) {
			numSet = sel.searchRes
		}
		switch set := staticNumSet(numSet, maxSeq, maxUID).(type) {
		case imap.SeqSet:
			seqNums = append(seqNums, set)
		case imap.UIDSet: // SEARCHRES
			criteria.UID = append(criteria.UID, set)
		}
	}
	criteria.SeqNum = seqNums

	for i, uidSet := range criteria.UID {
		criteria.UID[i] = staticNumSet(uidSet, maxSeq, maxUID).(imap.UIDSet)
	}
	for i := range criteria.Not {
		sel.staticSearchCriteria(&criteria.Not[i], maxSeq, maxUID)
	}
	for i := range criteria.Or {
		for j := range criteria.Or[i] {
			sel.staticSearchCriteria(&criteria.Or[i][j], maxSeq, maxUID)
		}
	}
}

// staticNumSet replaces "*" with the current maximum, on a copy of the set.
func staticNumSet(numSet imap.NumSet, maxSeq uint32, maxUID imap.UID) imap.NumSet {
	switch set := numSet.(type) {
	case imap.SeqSet:
		out := append(imap.SeqSet(nil), set...)
		for i := range out {
			staticRange(&out[i].Start, &out[i].Stop, maxSeq)
		}
		return out
	case imap.UIDSet:
		out := append(imap.UIDSet(nil), set...)
		for i := range out {
			staticRange((*uint32)(&out[i].Start), (*uint32)(&out[i].Stop), uint32(maxUID))
		}
		return out
	}
	return numSet
}

func staticRange(start, stop *uint32, max uint32) {
	dyn := false
	if *start == 0 {
		*start = max
		dyn = true
	}
	if *stop == 0 {
		*stop = max
		dyn = true
	}
	if dyn && *start > *stop {
		*start, *stop = *stop, *start
	}
}

func indexOf(uids []imap.UID, uid imap.UID) int {
	i := sort.Search(len(uids), func(i int) bool { return uids[i] >= uid })
	if i < len(uids) && uids[i] == uid {
		return i
	}
	return -1
}

func itemUIDs(items []item) []uint32 {
	out := make([]uint32, len(items))
	for i, it := range items {
		out[i] = uint32(it.uid)
	}
	return out
}

func sameFlags(a, b []imap.Flag) bool {
	a, b = normalizeFlags(a), normalizeFlags(b)
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if !strings.EqualFold(string(a[i]), string(b[i])) {
			return false
		}
	}
	return true
}
