// Invented, tiny SQLite fixture. No uploaded records or document text belongs here.
import { DatabaseSync } from 'node:sqlite';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export function setSyntheticComponent(db, name, value) {
  const raw = Buffer.from(JSON.stringify(value));
  db.prepare('INSERT INTO components(name,payload,sha256) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,sha256=excluded.sha256')
    .run(name, deflateSync(raw), createHash('sha256').update(raw).digest('hex'));
}

export function writeSyntheticLegacyDatabase(filename, mutate = () => {}) {
  const db = new DatabaseSync(filename);
  try {
    db.exec(`
      CREATE TABLE components(name TEXT PRIMARY KEY,payload BLOB NOT NULL,sha256 TEXT NOT NULL);
      CREATE TABLE metrics(metric_id TEXT PRIMARY KEY,entity TEXT,name TEXT,unit TEXT,frequency TEXT,measure_type TEXT,scope TEXT);
      CREATE TABLE sources(source_id TEXT PRIMARY KEY,document TEXT,location TEXT,url TEXT,retrieved_at TEXT);
      CREATE TABLE observations(observation_id TEXT PRIMARY KEY,metric_id TEXT NOT NULL REFERENCES metrics,source_id TEXT REFERENCES sources,period TEXT,as_of TEXT,frequency TEXT,measure_type TEXT,value REAL,unit TEXT,status TEXT,role TEXT,component TEXT NOT NULL REFERENCES components,pointer TEXT NOT NULL,source_location TEXT,source_record TEXT,scope TEXT);
      CREATE TABLE metric_calculations(company TEXT,metric TEXT,period TEXT,yoy REAL,seq_pct REAL,acceleration_pp REAL,growth_unit TEXT,PRIMARY KEY(company,metric,period));
      CREATE TABLE research(record_id TEXT PRIMARY KEY,entity TEXT,source TEXT,source_date TEXT,takeaway TEXT,payload BLOB NOT NULL);
      CREATE TABLE templates(name TEXT PRIMARY KEY,body BLOB NOT NULL);
      CREATE TABLE raw_files(sha256 TEXT PRIMARY KEY,name TEXT,content BLOB);
    `);
    const components = {
      DB: { synthetic: true, title: 'Synthetic source fixture', rows: [{ value: 10 }, { value: 20 }, { value: 7 }] },
      syntheticContext: { synthetic: true, description: 'Invented supporting context' },
    };
    for (const [name, value] of Object.entries(components)) setSyntheticComponent(db, name, value);
    db.prepare('INSERT INTO sources VALUES(?,?,?,?,?)').run('synthetic-source', 'Synthetic document', 'Synthetic location', 'https://example.invalid/synthetic', '2026-09-01');
    db.prepare('INSERT INTO metrics VALUES(?,?,?,?,?,?,?)').run('synthetic-volume', 'CME', 'Synthetic volume', 'contracts/day', 'daily', 'flow', 'Synthetic scope');
    const insert = db.prepare('INSERT INTO observations VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    const rows = [
      ['synthetic-daily', '2026-08-01', '2026-08-01', 'daily', 10, 'contracts/day', 'Synthetic completed daily', 'existing_portal_series', 0],
      ['synthetic-monthly', '2026-08-01', '2026-08', 'monthly', 20, 'million contracts/month', 'Synthetic completed month', 'broker_series_separate_definition', 1],
      ['synthetic-provisional', '2026-09-01', '', 'MTD', 7, 'Not specified; see source record', 'Provisional synthetic cutoff unverified', 'partial_source_cutoff_unverified', 2],
    ];
    for (const [id, period, asOf, frequency, value, unit, status, role, index] of rows) {
      insert.run(id, 'synthetic-volume', 'synthetic-source', period, asOf, frequency, 'flow', value, unit,
        status, role, 'DB', JSON.stringify(['rows', index, 'value']), 'Synthetic location', 'Synthetic record', 'Synthetic scope');
    }
    db.prepare('INSERT INTO metric_calculations VALUES(?,?,?,?,?,?,?)').run('CME', 'Synthetic volume', '2026-08-01', 25, 5, null, 'percent');
    db.prepare('INSERT INTO research VALUES(?,?,?,?,?,?)').run('synthetic-research', 'CME', 'Synthetic research', '', 'Synthetic takeaway', deflateSync(Buffer.from(JSON.stringify({ synthetic: true, title: 'Synthetic research payload' }))));
    db.prepare('INSERT INTO templates VALUES(?,?)').run('portal', deflateSync(Buffer.from('<script>throw new Error("Synthetic template must never execute")</script>')));
    db.prepare('INSERT INTO raw_files VALUES(?,?,?)').run('synthetic-raw-hash', 'synthetic-report.txt', deflateSync(Buffer.from('Synthetic raw content must not be returned')));
    mutate(db, components);
  } finally { db.close(); }
}

export async function syntheticLegacyFixture(t, mutate) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'market-structure-synthetic-legacy-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filename = path.join(directory, 'synthetic.sqlite');
  writeSyntheticLegacyDatabase(filename, mutate);
  return filename;
}
