package mailstore

// FETCH and SEARCH evaluation, adapted from go-imap's imapmemserver
// (github.com/emersion/go-imap/v2, MIT licence, Copyright (c) 2013 The Go-IMAP Authors).

import (
	"bufio"
	"bytes"
	"io"
	"strings"
	"time"

	"github.com/emersion/go-imap/v2"
	"github.com/emersion/go-imap/v2/imapserver"
	gomessage "github.com/emersion/go-message"
	"github.com/emersion/go-message/mail"
	"github.com/emersion/go-message/textproto"

	"reloop/imap/internal/store"
)

// fetchNeedsRaw reports whether answering options requires the message body.
func fetchNeedsRaw(options *imap.FetchOptions) bool {
	return options.Envelope || options.BodyStructure != nil ||
		len(options.BodySection) > 0 || len(options.BinarySection) > 0 || len(options.BinarySectionSize) > 0
}

func writeFetch(w *imapserver.FetchResponseWriter, msg *store.Message, flags []imap.Flag, options *imap.FetchOptions) error {
	w.WriteUID(imap.UID(msg.UID))

	if options.Flags {
		w.WriteFlags(flags)
	}
	if options.InternalDate {
		w.WriteInternalDate(msg.InternalDate)
	}
	if options.RFC822Size {
		w.WriteRFC822Size(msg.Size)
	}
	if options.Envelope {
		w.WriteEnvelope(envelope(msg.Raw))
	}
	if options.BodyStructure != nil {
		w.WriteBodyStructure(imapserver.ExtractBodyStructure(bytes.NewReader(msg.Raw)))
	}

	for _, bs := range options.BodySection {
		buf := imapserver.ExtractBodySection(bytes.NewReader(msg.Raw), bs)
		wc := w.WriteBodySection(bs, int64(len(buf)))
		_, writeErr := wc.Write(buf)
		closeErr := wc.Close()
		if writeErr != nil {
			return writeErr
		}
		if closeErr != nil {
			return closeErr
		}
	}

	for _, bs := range options.BinarySection {
		buf := imapserver.ExtractBinarySection(bytes.NewReader(msg.Raw), bs)
		wc := w.WriteBinarySection(bs, int64(len(buf)))
		_, writeErr := wc.Write(buf)
		closeErr := wc.Close()
		if writeErr != nil {
			return writeErr
		}
		if closeErr != nil {
			return closeErr
		}
	}

	for _, bss := range options.BinarySectionSize {
		n := imapserver.ExtractBinarySectionSize(bytes.NewReader(msg.Raw), bss)
		w.WriteBinarySectionSize(bss, n)
	}

	return w.Close()
}

func envelope(raw []byte) *imap.Envelope {
	header, err := textproto.ReadHeader(bufio.NewReader(bytes.NewReader(raw)))
	if err != nil {
		return nil
	}
	return imapserver.ExtractEnvelope(header)
}

// searchNeedsRaw reports whether evaluating criteria requires message content.
func searchNeedsRaw(c *imap.SearchCriteria) bool {
	if len(c.Header) > 0 || len(c.Body) > 0 || len(c.Text) > 0 || !c.SentSince.IsZero() || !c.SentBefore.IsZero() {
		return true
	}
	for i := range c.Not {
		if searchNeedsRaw(&c.Not[i]) {
			return true
		}
	}
	for _, or := range c.Or {
		if searchNeedsRaw(&or[0]) || searchNeedsRaw(&or[1]) {
			return true
		}
	}
	return false
}

func matchMessage(msg *store.Message, seqNum uint32, criteria *imap.SearchCriteria) bool {
	for _, seqSet := range criteria.SeqNum {
		if seqNum == 0 || !seqSet.Contains(seqNum) {
			return false
		}
	}
	for _, uidSet := range criteria.UID {
		if !uidSet.Contains(imap.UID(msg.UID)) {
			return false
		}
	}
	if !matchDate(msg.InternalDate, criteria.Since, criteria.Before) {
		return false
	}

	flags := toFlags(msg.Flags)
	for _, flag := range criteria.Flag {
		if !hasFlag(flags, flag) {
			return false
		}
	}
	for _, flag := range criteria.NotFlag {
		if hasFlag(flags, flag) {
			return false
		}
	}

	if criteria.Larger != 0 && msg.Size <= criteria.Larger {
		return false
	}
	if criteria.Smaller != 0 && msg.Size >= criteria.Smaller {
		return false
	}

	if len(criteria.Header) > 0 || !criteria.SentSince.IsZero() || !criteria.SentBefore.IsZero() {
		header := mail.Header{Header: entity(msg.Raw).Header}
		for _, fieldCriteria := range criteria.Header {
			if !matchHeaderFields(header.FieldsByKey(fieldCriteria.Key), fieldCriteria.Value) {
				return false
			}
		}
		if !criteria.SentSince.IsZero() || !criteria.SentBefore.IsZero() {
			t, err := header.Date()
			if err != nil || !matchDate(t, criteria.SentSince, criteria.SentBefore) {
				return false
			}
		}
	}

	for _, text := range criteria.Text {
		if !matchEntity(entity(msg.Raw), text, true) {
			return false
		}
	}
	for _, body := range criteria.Body {
		if !matchEntity(entity(msg.Raw), body, false) {
			return false
		}
	}

	for i := range criteria.Not {
		if matchMessage(msg, seqNum, &criteria.Not[i]) {
			return false
		}
	}
	for _, or := range criteria.Or {
		if !matchMessage(msg, seqNum, &or[0]) && !matchMessage(msg, seqNum, &or[1]) {
			return false
		}
	}
	return true
}

func entity(raw []byte) *gomessage.Entity {
	e, _ := gomessage.Read(bytes.NewReader(raw))
	if e == nil {
		e, _ = gomessage.New(gomessage.Header{}, bytes.NewReader(nil))
	}
	return e
}

func matchDate(t, since, before time.Time) bool {
	// RFC 3501 requires zone-unaware date comparison.
	t = time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
	if !since.IsZero() && t.Before(since) {
		return false
	}
	if !before.IsZero() && !t.Before(before) {
		return false
	}
	return true
}

func matchHeaderFields(fields gomessage.HeaderFields, pattern string) bool {
	if pattern == "" {
		return fields.Len() > 0
	}
	pattern = strings.ToLower(pattern)
	for fields.Next() {
		v, _ := fields.Text()
		if strings.Contains(strings.ToLower(v), pattern) {
			return true
		}
	}
	return false
}

func matchEntity(e *gomessage.Entity, pattern string, includeHeader bool) bool {
	if pattern == "" {
		return true
	}
	if includeHeader && matchHeaderFields(e.Header.Fields(), pattern) {
		return true
	}

	if mr := e.MultipartReader(); mr != nil {
		for {
			part, err := mr.NextPart()
			if err == io.EOF {
				return false
			} else if err != nil {
				return false
			}
			if matchEntity(part, pattern, includeHeader) {
				return true
			}
		}
	}

	t, _, err := e.Header.ContentType()
	if err != nil || t == "" {
		t = "text/plain" // RFC 2045 default when Content-Type is missing or broken
	}
	if !strings.HasPrefix(t, "text/") && !strings.HasPrefix(t, "message/") {
		return false
	}
	buf, err := io.ReadAll(e.Body)
	if err != nil {
		return false
	}
	return bytes.Contains(bytes.ToLower(buf), bytes.ToLower([]byte(pattern)))
}
