CREATE TABLE IF NOT EXISTS leads(id TEXT PRIMARY KEY, data TEXT NOT NULL, template TEXT NOT NULL, website_status TEXT NOT NULL DEFAULT 'queued', email_status TEXT NOT NULL DEFAULT 'not_sent', updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, lead_id TEXT, type TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS events_lead ON events(lead_id,created_at);
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY, lead_id TEXT, thread_id TEXT, direction TEXT NOT NULL, sender TEXT, subject TEXT, body TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS message_thread ON messages(thread_id);
CREATE TABLE IF NOT EXISTS send_locks(lead_id TEXT PRIMARY KEY, campaign TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS login_limits(key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at INTEGER NOT NULL);
