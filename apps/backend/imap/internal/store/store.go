// Package store is the Postgres layer for the IMAP mail store
// (mail_account, mail_app_password, mail_folder, mail_message).
package store

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, url string) (*Store, error) {
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("connect postgres: %w", err)
	}
	return &Store{pool: pool}, nil
}

func (s *Store) Close() { s.pool.Close() }

// newID mirrors the TS side's prefixed ids (cuid2 there; random base36 here).
func newID(prefix string) string {
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	for i := range b {
		b[i] = alphabet[int(b[i])%len(alphabet)]
	}
	return prefix + string(b)
}

// ─── accounts ────────────────────────────────────────────────────────

type Account struct {
	ID             string
	Email          string
	DisplayName    string
	OrganizationID string
	Active         bool
}

// AccountByEmail returns nil when no account has this address.
func (s *Store) AccountByEmail(ctx context.Context, email string) (*Account, error) {
	var a Account
	var displayName *string
	var status string
	err := s.pool.QueryRow(ctx, `
		SELECT id, email, display_name, organization_id, status
		FROM mail_account WHERE email = $1`,
		strings.ToLower(strings.TrimSpace(email)),
	).Scan(&a.ID, &a.Email, &displayName, &a.OrganizationID, &status)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	if displayName != nil {
		a.DisplayName = *displayName
	}
	a.Active = status == "active"
	return &a, nil
}

func (s *Store) CreateAccount(ctx context.Context, email, organizationID, domainID string) (*Account, error) {
	a := &Account{
		ID:             newID("macc_"),
		Email:          strings.ToLower(strings.TrimSpace(email)),
		OrganizationID: organizationID,
		Active:         true,
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO mail_account (id, email, organization_id, domain_id)
		VALUES ($1, $2, $3, $4)`,
		a.ID, a.Email, organizationID, domainID)
	return a, err
}

type AppPassword struct {
	ID   string
	Hash string
}

func (s *Store) ActiveAppPasswords(ctx context.Context, accountID string) ([]AppPassword, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, password_hash FROM mail_app_password
		WHERE account_id = $1 AND revoked_at IS NULL`, accountID)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (AppPassword, error) {
		var p AppPassword
		err := row.Scan(&p.ID, &p.Hash)
		return p, err
	})
}

func (s *Store) CreateAppPassword(ctx context.Context, accountID, label, hash string) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO mail_app_password (id, account_id, label, password_hash)
		VALUES ($1, $2, $3, $4)`,
		newID("mapw_"), accountID, label, hash)
	return err
}

func (s *Store) TouchAppPassword(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `UPDATE mail_app_password SET last_used_at = now() WHERE id = $1`, id)
	return err
}

// ─── folders ─────────────────────────────────────────────────────────

type Folder struct {
	ID          string
	AccountID   string
	Name        string
	SpecialUse  string
	Subscribed  bool
	UIDValidity uint32
	UIDNext     uint32
}

const folderColumns = `id, account_id, name, coalesce(special_use, ''), subscribed, uid_validity, uid_next`

func scanFolder(row pgx.Row) (*Folder, error) {
	var f Folder
	var uidValidity, uidNext int64
	err := row.Scan(&f.ID, &f.AccountID, &f.Name, &f.SpecialUse, &f.Subscribed, &uidValidity, &uidNext)
	if err != nil {
		return nil, err
	}
	f.UIDValidity = uint32(uidValidity)
	f.UIDNext = uint32(uidNext)
	return &f, nil
}

func (s *Store) Folders(ctx context.Context, accountID string) ([]*Folder, error) {
	rows, err := s.pool.Query(ctx, `SELECT `+folderColumns+` FROM mail_folder WHERE account_id = $1 ORDER BY name`, accountID)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (*Folder, error) { return scanFolder(row) })
}

// FolderByName returns nil when the folder does not exist.
func (s *Store) FolderByName(ctx context.Context, accountID, name string) (*Folder, error) {
	f, err := scanFolder(s.pool.QueryRow(ctx, `SELECT `+folderColumns+` FROM mail_folder WHERE account_id = $1 AND name = $2`, accountID, name))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return f, err
}

// CreateFolder returns ErrExists when the name is taken.
func (s *Store) CreateFolder(ctx context.Context, accountID, name, specialUse string) (*Folder, error) {
	var su *string
	if specialUse != "" {
		su = &specialUse
	}
	// Seconds since epoch is the conventional UIDVALIDITY; a re-created folder
	// gets a fresh value so clients drop their cached UIDs.
	f, err := scanFolder(s.pool.QueryRow(ctx, `
		INSERT INTO mail_folder (id, account_id, name, special_use, uid_validity)
		VALUES ($1, $2, $3, $4, greatest(
			extract(epoch from now())::bigint,
			(SELECT coalesce(max(uid_validity), 0) + 1 FROM mail_folder WHERE account_id = $2)))
		ON CONFLICT (account_id, name) DO NOTHING
		RETURNING `+folderColumns,
		newID("mfld_"), accountID, name, su))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrExists
	}
	return f, err
}

var ErrExists = errors.New("already exists")

func (s *Store) DeleteFolder(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM mail_folder WHERE id = $1`, id)
	return err
}

// RenameFolder renames a folder and every folder below it in the hierarchy.
func (s *Store) RenameFolder(ctx context.Context, accountID, oldName, newName string, delim string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE mail_folder
		SET name = $3 || substr(name, length($2) + 1)
		WHERE account_id = $1 AND (name = $2 OR starts_with(name, $2 || $4))`,
		accountID, oldName, newName, delim)
	return err
}

func (s *Store) SetSubscribed(ctx context.Context, id string, subscribed bool) error {
	_, err := s.pool.Exec(ctx, `UPDATE mail_folder SET subscribed = $2 WHERE id = $1`, id, subscribed)
	return err
}

type FolderStats struct {
	NumMessages uint32
	NumUnseen   uint32
	NumDeleted  uint32
	Size        int64
	UIDNext     uint32
}

func (s *Store) FolderStats(ctx context.Context, folderID string) (*FolderStats, error) {
	var st FolderStats
	var uidNext int64
	err := s.pool.QueryRow(ctx, `
		SELECT
			count(m.id),
			count(m.id) FILTER (WHERE NOT ('\Seen' = ANY(m.flags))),
			count(m.id) FILTER (WHERE '\Deleted' = ANY(m.flags)),
			coalesce(sum(m.size), 0),
			f.uid_next
		FROM mail_folder f
		LEFT JOIN mail_message m ON m.folder_id = f.id
		WHERE f.id = $1
		GROUP BY f.uid_next`, folderID,
	).Scan(&st.NumMessages, &st.NumUnseen, &st.NumDeleted, &st.Size, &uidNext)
	st.UIDNext = uint32(uidNext)
	return &st, err
}

// SelectInfo returns the folder's next UID and its lowest unseen UID (0 if none).
func (s *Store) SelectInfo(ctx context.Context, folderID string) (uidNext, firstUnseenUID uint32, err error) {
	var next int64
	var unseen *int64
	err = s.pool.QueryRow(ctx, `
		SELECT f.uid_next,
			(SELECT min(uid) FROM mail_message m WHERE m.folder_id = f.id AND NOT ('\Seen' = ANY(m.flags)))
		FROM mail_folder f WHERE f.id = $1`, folderID,
	).Scan(&next, &unseen)
	if unseen != nil {
		firstUnseenUID = uint32(*unseen)
	}
	return uint32(next), firstUnseenUID, err
}

// ─── messages ────────────────────────────────────────────────────────

type Message struct {
	UID          uint32
	Flags        []string
	InternalDate time.Time
	Size         int64
	Raw          []byte // only loaded when asked for
}

func (s *Store) FolderUIDs(ctx context.Context, folderID string) ([]uint32, error) {
	rows, err := s.pool.Query(ctx, `SELECT uid FROM mail_message WHERE folder_id = $1 ORDER BY uid`, folderID)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (uint32, error) {
		var uid int64
		err := row.Scan(&uid)
		return uint32(uid), err
	})
}

// Messages loads the given UIDs (or all messages when uids is nil), ordered by UID.
func (s *Store) Messages(ctx context.Context, folderID string, uids []uint32, withRaw bool) ([]*Message, error) {
	cols := `uid, flags, internal_date, size`
	if withRaw {
		cols += `, raw`
	}
	var rows pgx.Rows
	var err error
	if uids == nil {
		rows, err = s.pool.Query(ctx, `SELECT `+cols+` FROM mail_message WHERE folder_id = $1 ORDER BY uid`, folderID)
	} else {
		ids := make([]int64, len(uids))
		for i, uid := range uids {
			ids[i] = int64(uid)
		}
		rows, err = s.pool.Query(ctx, `SELECT `+cols+` FROM mail_message WHERE folder_id = $1 AND uid = ANY($2) ORDER BY uid`, folderID, ids)
	}
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (*Message, error) {
		var m Message
		var uid int64
		dest := []any{&uid, &m.Flags, &m.InternalDate, &m.Size}
		if withRaw {
			dest = append(dest, &m.Raw)
		}
		err := row.Scan(dest...)
		m.UID = uint32(uid)
		return &m, err
	})
}

// NewMessage is a message about to be stored; the UID is allocated by InsertMessage.
type NewMessage struct {
	AccountID    string
	FolderID     string
	Flags        []string
	InternalDate time.Time
	Raw          []byte
	MessageID    string
	Subject      string
	FromEmail    string
	SentAt       *time.Time
}

// InsertMessage allocates the folder's next UID and stores the message atomically.
func (s *Store) InsertMessage(ctx context.Context, m *NewMessage) (uint32, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)

	var uid int64
	if err := tx.QueryRow(ctx, `
		UPDATE mail_folder SET uid_next = uid_next + 1 WHERE id = $1
		RETURNING uid_next - 1`, m.FolderID).Scan(&uid); err != nil {
		return 0, fmt.Errorf("allocate uid: %w", err)
	}
	flags := m.Flags
	if flags == nil {
		flags = []string{}
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO mail_message
			(id, account_id, folder_id, uid, flags, internal_date, size, raw, message_id, subject, from_email, sent_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, nullif($9, ''), nullif($10, ''), nullif($11, ''), $12)`,
		newID("mmsg_"), m.AccountID, m.FolderID, uid, flags, m.InternalDate, len(m.Raw), m.Raw,
		m.MessageID, m.Subject, truncate(m.FromEmail, 255), m.SentAt,
	); err != nil {
		return 0, err
	}
	return uint32(uid), tx.Commit(ctx)
}

func (s *Store) SetFlags(ctx context.Context, folderID string, uid uint32, flags []string) error {
	if flags == nil {
		flags = []string{}
	}
	_, err := s.pool.Exec(ctx, `UPDATE mail_message SET flags = $3 WHERE folder_id = $1 AND uid = $2`, folderID, int64(uid), flags)
	return err
}

func (s *Store) DeleteMessages(ctx context.Context, folderID string, uids []uint32) error {
	ids := make([]int64, len(uids))
	for i, uid := range uids {
		ids[i] = int64(uid)
	}
	_, err := s.pool.Exec(ctx, `DELETE FROM mail_message WHERE folder_id = $1 AND uid = ANY($2)`, folderID, ids)
	return err
}

func truncate(s string, n int) string {
	if len(s) > n {
		return s[:n]
	}
	return s
}
