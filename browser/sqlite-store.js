import initSqlJs from 'sql.js';
import { Unzlib } from 'fflate';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { createLegacyStore } from '../src/legacy-store-core.js';

const MiB = 1024 * 1024;

// Feeding bounded compressed chunks prevents one push from allocating an
// unbounded expanded payload before the size callback can reject it. Check the
// zlib checksum explicitly: fflate decodes zlib but does not verify Adler-32.
function inflateBounded(bytes, maximum) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 6) throw new Error('Invalid zlib payload.');
  const chunks = [];
  let length = 0;
  let adlerA = 1;
  let adlerB = 0;
  const stream = new Unzlib((chunk) => {
    length += chunk.byteLength;
    if (length > maximum) throw new Error('Payload exceeds the decompression size limit.');
    for (let offset = 0; offset < chunk.length; offset += 5552) {
      const end = Math.min(chunk.length, offset + 5552);
      for (let index = offset; index < end; index++) {
        adlerA += chunk[index];
        adlerB += adlerA;
      }
      adlerA %= 65521;
      adlerB %= 65521;
    }
    chunks.push(chunk);
  });
  for (let offset = 0; offset < bytes.length; offset += 1024) {
    const end = Math.min(bytes.length, offset + 1024);
    stream.push(bytes.subarray(offset, end), end === bytes.length);
  }
  const checksum = new DataView(bytes.buffer, bytes.byteOffset + bytes.byteLength - 4, 4).getUint32(0);
  if ((((adlerB << 16) | adlerA) >>> 0) !== checksum) throw new Error('Payload checksum is invalid.');
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

// Statements never escape this adapter. A statement is freed even if a caller
// stops iteration early or validation throws. Parameters are always bound.
function sqliteAdapter(database) {
  return {
    exec(sql) { database.exec(sql); },
    prepare(sql) {
      function* iterate(...parameters) {
        const statement = database.prepare(sql);
        try {
          if (parameters.length) statement.bind(parameters);
          while (statement.step()) yield Object.assign(Object.create(null), statement.getAsObject());
        } finally { statement.free(); }
      }
      return {
        iterate,
        all(...parameters) { return [...iterate(...parameters)]; },
        get(...parameters) { for (const row of iterate(...parameters)) return row; },
      };
    },
    close() { database.close(); },
  };
}

/** Load a standalone selected SQLite snapshot without filesystem/network access.
 * The WASM binary is supplied by the reviewed application bundle, never by an
 * uploaded document. The returned API exposes validated projections, not SQL.
 */
export async function openBrowserStore(databaseBytes, {
  wasmBytes, now = new Date(), maxComponentBytes = 256 * MiB,
  maxTotalBytes = 512 * MiB, maxDatabaseBytes = 512 * MiB,
} = {}) {
  if (!(databaseBytes instanceof Uint8Array)) throw new Error('SQLite input must be bytes.');
  if (!Number.isSafeInteger(maxDatabaseBytes) || maxDatabaseBytes < 100) throw new Error('A valid SQLite size limit is required.');
  if (databaseBytes.length < 100 || databaseBytes.length > maxDatabaseBytes) throw new Error('SQLite input is empty or exceeds the size limit.');
  if (new TextDecoder().decode(databaseBytes.subarray(0, 16)) !== 'SQLite format 3\0') throw new Error('Select a standalone SQLite database.');
  // A selected byte array cannot discover its adjacent WAL. Reject WAL-format
  // headers so committed data in an unselected sidecar is never ignored.
  if (databaseBytes[18] !== 1 || databaseBytes[19] !== 1) throw new Error('SQLite snapshot uses WAL or an unsupported journal mode; export a checkpointed database in DELETE journal mode.');
  if (!(wasmBytes instanceof Uint8Array) || !wasmBytes.byteLength) throw new Error('The bundled SQLite WebAssembly bytes are required.');
  const SQL = await initSqlJs({ wasmBinary: wasmBytes });
  // SQL.js copies the selected bytes into its private in-memory filesystem.
  // The source File/ArrayBuffer is never modified and no persistence is used.
  const database = new SQL.Database(databaseBytes);
  const db = sqliteAdapter(database);
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    return createLegacyStore(db, {
      now, maxComponentBytes, maxTotalBytes, inflate: inflateBounded,
      sha256: bytes => bytesToHex(sha256(bytes)), storage: 'browser-memory',
    });
  } catch (error) {
    db.close();
    throw error;
  }
}
