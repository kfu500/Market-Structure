/** Bounded ZIP reads from user-selected Blobs. No filesystem writes or source execution. */
import { Inflate } from 'fflate';

export const MAX_ARCHIVE_BYTES = 2 * 1024 ** 3;
const MAX_CENTRAL_BYTES = 8 * 1024 ** 2;
const MAX_ENTRIES = 4096;
const fail = message => { throw new Error(message); };
const decoder = new TextDecoder('utf-8', { fatal: true });
const u16 = (view, offset) => view.getUint16(offset, true);
const u32 = (view, offset) => view.getUint32(offset, true);
const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  for (let bit = 0; bit < 8; bit++) index = (index >>> 1) ^ ((index & 1) ? 0xedb88320 : 0);
  return index >>> 0;
});
const updateCrc = (value, bytes) => {
  for (const byte of bytes) value = CRC_TABLE[(value ^ byte) & 255] ^ (value >>> 8);
  return value;
};

export async function readBlobRange(blob, offset, size) {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(size) || offset < 0 || size < 0 || offset + size > blob.size) fail('An archive has invalid byte ranges.');
  const bytes = new Uint8Array(await blob.slice(offset, offset + size).arrayBuffer());
  if (bytes.byteLength !== size) fail('A selected file could not be read completely.');
  return bytes;
}

function checkedName(bytes) {
  let name;
  try { name = decoder.decode(bytes); } catch { fail('An archive contains an unsupported filename encoding.'); }
  const directory = name.endsWith('/');
  const parts = (directory ? name.slice(0, -1) : name).split('/');
  if (!name || name.length > 1024 || /[\\\x00-\x1f\x7f:]/.test(name) || parts.some(part => !part || part === '.' || part === '..' || /[. ]$/.test(part))) fail('An archive contains an unsafe filename.');
  return { name, directory };
}

function checkExtra(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = 0; offset < bytes.length;) {
    if (offset + 4 > bytes.length) fail('An archive has malformed ZIP metadata.');
    const kind = u16(view, offset), size = u16(view, offset + 2);
    if (kind === 1) fail('ZIP64 archives are not supported by the local browser viewer.');
    offset += 4 + size;
    if (offset > bytes.length) fail('An archive has malformed ZIP metadata.');
  }
}

export async function openSourceZip(blob) {
  if (!blob || typeof blob.slice !== 'function' || !Number.isSafeInteger(blob.size) || blob.size < 22 || blob.size > MAX_ARCHIVE_BYTES) fail('Select a complete ZIP smaller than 2 GiB.');
  const tailOffset = Math.max(0, blob.size - 65557);
  const tail = await readBlobRange(blob, tailOffset, blob.size - tailOffset);
  const tailView = new DataView(tail.buffer);
  let end = -1;
  for (let offset = tail.length - 22; offset >= 0; offset--) {
    if (u32(tailView, offset) === 0x06054b50 && offset + 22 + u16(tailView, offset + 20) === tail.length) { end = offset; break; }
  }
  if (end < 0) fail('The selected ZIP is incomplete or malformed.');
  const count = u16(tailView, end + 10), centralSize = u32(tailView, end + 12), centralOffset = u32(tailView, end + 16);
  if (u16(tailView, end + 4) || u16(tailView, end + 6) || u16(tailView, end + 8) !== count || count === 65535 || centralSize === 0xffffffff || centralOffset === 0xffffffff) fail('Multi-volume and ZIP64 archives are not supported.');
  if (!count || count > MAX_ENTRIES || centralSize > MAX_CENTRAL_BYTES || centralOffset + centralSize !== tailOffset + end) fail('An archive has invalid or oversized ZIP metadata.');
  const central = await readBlobRange(blob, centralOffset, centralSize);
  const view = new DataView(central.buffer);
  const entries = [], names = new Set();
  let offset = 0;
  for (let index = 0; index < count; index++) {
    if (offset + 46 > central.length || u32(view, offset) !== 0x02014b50) fail('An archive has malformed central directory records.');
    const flags = u16(view, offset + 8), method = u16(view, offset + 10), crc = u32(view, offset + 16);
    const compressedSize = u32(view, offset + 20), size = u32(view, offset + 24);
    const nameLength = u16(view, offset + 28), extraLength = u16(view, offset + 30), commentLength = u16(view, offset + 32);
    const localOffset = u32(view, offset + 42), mode = u32(view, offset + 38) >>> 16;
    const next = offset + 46 + nameLength + extraLength + commentLength;
    if (next > central.length || !nameLength || (flags & ~0x080e) || ![0, 8].includes(method) || u16(view, offset + 34) || [compressedSize, size, localOffset].includes(0xffffffff) || ((mode & 0xf000) && ![0x4000, 0x8000].includes(mode & 0xf000))) fail('An archive contains unsupported, encrypted or invalid members.');
    const nameBytes = central.slice(offset + 46, offset + 46 + nameLength);
    const { name, directory } = checkedName(nameBytes);
    const key = name.normalize('NFC').toLowerCase();
    if (names.has(key)) fail('An archive contains duplicate filenames.');
    names.add(key);
    checkExtra(central.subarray(offset + 46 + nameLength, offset + 46 + nameLength + extraLength));
    if (localOffset + 30 + compressedSize > centralOffset || (directory && (size || compressedSize))) fail('An archive has invalid member boundaries.');
    entries.push({ name, directory, size, compressedSize, crc, method, flags, localOffset, nameBytes });
    offset = next;
  }
  if (offset !== central.length) fail('An archive has unexpected central directory data.');
  const sorted = [...entries].sort((a, b) => a.localOffset - b.localOffset);
  for (let index = 0; index < sorted.length; index++) {
    const entry = sorted[index];
    const local = await readBlobRange(blob, entry.localOffset, 30);
    const localView = new DataView(local.buffer);
    if (u32(localView, 0) !== 0x04034b50 || u16(localView, 6) !== entry.flags || u16(localView, 8) !== entry.method || u16(localView, 26) !== entry.nameBytes.length) fail('An archive has inconsistent local and central records.');
    const metadataLength = u16(localView, 26) + u16(localView, 28);
    const metadata = await readBlobRange(blob, entry.localOffset + 30, metadataLength);
    if (entry.nameBytes.some((value, i) => metadata[i] !== value)) fail('An archive has inconsistent member names.');
    checkExtra(metadata.subarray(entry.nameBytes.length));
    if (!(entry.flags & 8) && (u32(localView, 14) !== entry.crc || u32(localView, 18) !== entry.compressedSize || u32(localView, 22) !== entry.size)) fail('An archive has inconsistent member sizes or checksums.');
    entry.dataOffset = entry.localOffset + 30 + metadataLength;
    const dataEnd = entry.dataOffset + entry.compressedSize;
    const next = sorted[index + 1]?.localOffset ?? centralOffset;
    if (dataEnd > next) fail('An archive has overlapping member records.');
    if (entry.flags & 8) {
      const descriptor = await readBlobRange(blob, dataEnd, Math.min(16, next - dataEnd));
      const descView = new DataView(descriptor.buffer);
      const start = descriptor.length >= 4 && u32(descView, 0) === 0x08074b50 ? 4 : 0;
      if (descriptor.length < start + 12 || u32(descView, start) !== entry.crc || u32(descView, start + 4) !== entry.compressedSize || u32(descView, start + 8) !== entry.size) fail('An archive has invalid member descriptors.');
    }
  }
  return { blob, entries };
}

export async function extractSourceZipMember(archive, member, { maxBytes, onProgress = () => {} } = {}) {
  const entry = archive.entries.find(item => item.name === member);
  if (!entry || entry.directory) fail('The required file is missing from the original archive.');
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0 || entry.size > maxBytes) fail('An archive member exceeds the supported size limit.');
  if (entry.method === 0 && entry.compressedSize !== entry.size) fail('An uncompressed member has inconsistent sizes.');
  const result = new Uint8Array(entry.size);
  let written = 0, crc = 0xffffffff;
  const accept = chunk => {
    if (written + chunk.length > entry.size || written + chunk.length > maxBytes) fail('An archive expanded beyond its declared size.');
    result.set(chunk, written);
    written += chunk.length;
    crc = updateCrc(crc, chunk);
  };
  const inflater = entry.method === 8 ? new Inflate(accept) : null;
  for (let offset = 0; offset < entry.compressedSize; offset += 65536) {
    const size = Math.min(65536, entry.compressedSize - offset);
    const bytes = await readBlobRange(archive.blob, entry.dataOffset + offset, size);
    if (inflater) inflater.push(bytes, offset + size === entry.compressedSize); else accept(bytes);
    onProgress({ completed: offset + size, total: entry.compressedSize });
  }
  if (inflater && !entry.compressedSize) inflater.push(new Uint8Array(), true);
  if (written !== entry.size || ((crc ^ 0xffffffff) >>> 0) !== entry.crc) fail('An original archive failed its size or CRC integrity check.');
  return result;
}
